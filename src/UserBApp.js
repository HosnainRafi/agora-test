// UserBApp.js
import React, { useState } from "react";
import AgoraCall from "./AgoraCall";
import { fetchRtcToken } from "./tokenClient";

export default function UserBApp() {
  // Keep your App ID unchanged
  const [appId, setAppId] = useState("ff35e70c31d54880be4560d53f79931d");
  // Paste the same channel as User A to join the same room
  const [channel, setChannel] = useState("");
  // Use a different uid than User A, e.g., 115766
  const [uid, setUid] = useState("");
  const [role, setRole] = useState("publisher");
  const [token, setToken] = useState("");
  const [inCall, setInCall] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    try {
      setLoading(true);
      if (!appId || appId.length < 10) throw new Error("Enter a valid App ID");
      if (!channel) throw new Error("Enter the SAME channel as User A");
      const nUid = Number(uid);
      if (!Number.isFinite(nUid) || nUid <= 0)
        throw new Error("UID must be a positive number");
      if (!["publisher", "subscriber"].includes(role.toLowerCase()))
        throw new Error("Role must be publisher/subscriber");

      // IMPORTANT: this calls your microservice to mint a token for THIS uid on the SAME channel
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
      <h2>User B Join (Same Room)</h2>

      {!inCall && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label>App ID</label>
            <input
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Your Agora App ID"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label>Channel (same as User A)</label>
            <input
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Paste the same channel string"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div>
            <label>UID (DIFFERENT from User A)</label>
            <input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. 115766"
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
