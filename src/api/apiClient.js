import { fetchWithAuth } from "../auth/auth";

export const API = import.meta.env.VITE_DEV_URI;

// Auth-aware fetch + JSON unwrap for use inside queryFn/mutationFn — throws
// with the server's error/message on a non-ok response instead of requiring
// every call site to repeat that check by hand.
export async function fetchJSON(url, options) {
  const res = await fetchWithAuth(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Server error (${res.status})`);
  }
  return data;
}
