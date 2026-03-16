import axios from "axios";
import { jwtDecode } from "jwt-decode";

let refreshInterval: ReturnType<typeof setInterval> | null = null;

async function refreshNow() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    stopTokenRefreshTimer();
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/refresh",
      {},
      { withCredentials: true }
    );
    localStorage.setItem("accessToken", res.data.token);
  } catch {
    localStorage.removeItem("accessToken");
    stopTokenRefreshTimer();
    window.location.href = "/login";
  }
}

export async function startTokenRefreshTimer() {
  const THIRTEEN_MINUTES = 13 * 60 * 1000;

  stopTokenRefreshTimer();

  const token = localStorage.getItem("accessToken");
  if (token) {
    const decoded = jwtDecode<{ exp: number }>(token);
    const expiresIn = decoded.exp - Date.now() / 1000;

    if (expiresIn < 15 * 60) {
      await refreshNow();
    }
  }

  refreshInterval = setInterval(refreshNow, THIRTEEN_MINUTES);

  return refreshInterval;
}

export function stopTokenRefreshTimer() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}