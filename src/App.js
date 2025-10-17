// App.js
import React, { useState } from "react";
import AgoraCall from "./AgoraCall";
import { fetchRtcToken } from "./tokenClient";

export default function App() {
  // Your App ID (unchanged)
  const [appId, setAppId] = useState("bf217a0ed798442f88824ec1d409fbdf");
  const [channel, setChannel] = useState("");
  const [uid, setUid] = useState("");
  const [role, setRole] = useState("publisher");
  const [token, setToken] = useState("");
  const [inCall, setInCall] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateUuid = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  };

  const handleJoin = async () => {
    try {
      setLoading(true);
      if (!appId || appId.length < 10) throw new Error("Enter a valid App ID");
      if (!channel) throw new Error("Enter a channel");
      const nUid = Number(uid);
      if (!Number.isFinite(nUid) || nUid <= 0)
        throw new Error("UID must be a positive number");
      if (!["publisher", "subscriber"].includes(role.toLowerCase()))
        throw new Error("Role must be publisher/subscriber");

      const tkn = await fetchRtcToken({ channel, uid: nUid, role });
      if (!tkn || tkn.length < 20)
        throw new Error("Invalid token from service");
      setToken(tkn);
      setInCall(true);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to get token/join");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    setInCall(false);
    setToken("");
  };

  return (
    <div
      style={{
        maxWidth: 820,
        margin: "32px auto",
        fontFamily: "Inter, system-ui, Arial",
      }}
    >
      <h2>Agora Web Test (Your Config)</h2>

      {!inCall && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label>App ID (unchanged)</label>
            <input
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Your Agora App ID"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label>Channel</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Channel name (UUID recommended)"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
              <button
                type="button"
                onClick={() => setChannel(generateUuid())}
                style={{ marginTop: 4 }}
              >
                New UUID
              </button>
            </div>
          </div>
          <div>
            <label>UID (number)</label>
            <input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. 115765"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="publisher">publisher</option>
              <option value="subscriber">subscriber</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / span 2" }}>
            <button
              disabled={loading}
              onClick={handleJoin}
              style={{ padding: "10px 16px" }}
            >
              {loading ? "Joining..." : "Get Token & Join"}
            </button>
          </div>
        </div>
      )}

      {inCall && (
        <>
          <div style={{ margin: "16px 0" }}>
            <button
              onClick={handleLeave}
              style={{
                padding: "10px 16px",
                background: "#d33",
                color: "#fff",
              }}
            >
              Leave
            </button>
          </div>
          <AgoraCall
            appId={appId}
            channel={channel}
            token={token}
            uid={Number(uid)}
            role={role}
          />
        </>
      )}
    </div>
  );
}
