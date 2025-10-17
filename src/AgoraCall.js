import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

export default function AgoraCall({ appId, channel, token, uid, role }) {
  const clientRef = useRef(null);
  const [localMic, setLocalMic] = useState(null);
  const [localCam, setLocalCam] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    const onUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((prev) => {
        const found = prev.find((u) => u.uid === user.uid);
        return found
          ? prev.map((u) => (u.uid === user.uid ? user : u))
          : [...prev, user];
      });
      if (mediaType === "video") {
        const elId = `remote-player-${user.uid}`;
        let el = document.getElementById(elId);
        if (!el) {
          el = document.createElement("div");
          el.id = elId;
          el.style.width = "100%";
          el.style.height = "100%";
          el.style.background = "#000";
          document.getElementById("remote-grid").appendChild(el);
        }
        user.videoTrack && user.videoTrack.play(elId);
      }
      if (mediaType === "audio") {
        user.audioTrack && user.audioTrack.play();
      }
    };

    const onUserLeft = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      const el = document.getElementById(`remote-player-${user.uid}`);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };

    client.on("user-published", onUserPublished);
    client.on("user-left", onUserLeft);

    const run = async () => {
      const numericUid = Number(uid);
      if (!Number.isFinite(numericUid) || numericUid <= 0)
        throw new Error("UID must be a positive number");
      if (!token || token.length < 20) throw new Error("Invalid token");
      await client.join(appId, channel, token, numericUid);
      if (role && role.toLowerCase() === "publisher") {
        const mic = await AgoraRTC.createMicrophoneAudioTrack();
        const cam = await AgoraRTC.createCameraVideoTrack();
        setLocalMic(mic);
        setLocalCam(cam);
        await client.publish([mic, cam]);
        cam.play("local-player");
      }
    };

    run().catch((e) => {
      console.error("Join/publish error:", e);
      alert("Failed to join/publish. Check console.");
    });

    return () => {
      const stopClose = (t) => {
        if (t) {
          try {
            t.stop();
          } catch {}
          try {
            t.close();
          } catch {}
        }
      };
      stopClose(localMic);
      stopClose(localCam);
      if (client) {
        try {
          client.leave();
        } catch {}
      }
      client.off("user-published", onUserPublished);
      client.off("user-left", onUserLeft);
      setRemoteUsers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, channel, token, uid, role]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        height: 520,
      }}
    >
      <div
        id="remote-grid"
        style={{
          position: "relative",
          background: "#1f1f1f",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {remoteUsers.length === 0 && (
          <div
            style={{
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            Waiting for remote user...
          </div>
        )}
      </div>
      <div
        id="local-player"
        style={{
          background: "#000",
          border: "3px solid #fff",
          borderRadius: 8,
        }}
      />
    </div>
  );
}
