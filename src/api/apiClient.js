import { fetchWithAuth } from "../auth/auth";
import { fetchOrThrow } from "../util/errorUtil";

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

// Same convenience as fetchJSON (unwrap JSON, throw on non-ok), but for
// public/unauthenticated endpoints — built on fetchOrThrow instead of
// fetchWithAuth, so it never attaches a bearer token and still surfaces
// backend/DB/Stripe-down detection. Use for queryFns that must work for
// logged-out visitors (guest checkout, public event/venue pages, etc.).
export async function fetchPublicJSON(url, options) {
  const res = await fetchOrThrow(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Server error (${res.status})`);
  }
  return data;
}
