// tokenClient.js
import axios from "axios";

// Your microservice base (unchanged)
const BASE = "https://demoms.financemagic.co.uk";

// Uses your exact route: getbyuidandnhannelname (unchanged)
export async function fetchRtcToken({ channel, uid, role }) {
  const url =
    `${BASE}/api/mmvoicemicroservice/rtctoken/getbyuidandnhannelname` +
    `?ChannelName=${encodeURIComponent(channel)}` +
    `&UId=${encodeURIComponent(uid)}` +
    `&Role=${encodeURIComponent(role)}`;
  const { data } = await axios.get(url);
  const ok =
    data &&
    data.success &&
    data.responseData &&
    data.responseData.RTCTokenResponse &&
    data.responseData.RTCTokenResponse.rtcToken;
  if (!ok) throw new Error("Bad token response");
  return data.responseData.RTCTokenResponse.rtcToken;
}
