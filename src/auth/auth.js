import { ApiError, STRIPE_DOWN_MESSAGE } from "../util/errorUtil";

const API = import.meta.env.VITE_DEV_URI;

// ── In-memory token store (not accessible via XSS unlike localStorage) ──
let _accessToken = null;
let _expiration = null;
let _user = null; // { id, name, email, role }

// ── Proactive refresh, scheduled against the token's actual exp claim ──
const REFRESH_BUFFER_MS = 60_000; // refresh 1 minute before actual expiry
let _refreshTimer = null;

function _scheduleRefresh() {
  clearTimeout(_refreshTimer);
  if (!_expiration) return;
  const delay = Math.max(new Date(_expiration).getTime() - Date.now() - REFRESH_BUFFER_MS, 0);
  _refreshTimer = setTimeout(async () => {
    // This timer is only ever armed while a real token is held, so a failed
    // refresh here means an active session just genuinely ended — worth telling
    // the user, unlike a failed bootstrap refresh for a never-logged-in visitor.
    const refreshed = await refreshAccessToken();
    if (!refreshed) _notifySessionExpired();
  }, delay);
}

// ── Subscribers — notified whenever auth state changes ──
const _subscribers = new Set();
let _version = 0;

export function subscribeToAuth(fn) {
  _subscribers.add(fn);
  return () => _subscribers.delete(fn);
}

export function getAuthVersion() {
  return _version;
}

function _notify() {
  _version++;
  _subscribers.forEach((fn) => fn());
}

// ── Subscribers — notified specifically when a refresh attempt fails,
// i.e. the session has genuinely ended (not a manual logout) ──
const _expiredSubscribers = new Set();

export function subscribeToSessionExpired(fn) {
  _expiredSubscribers.add(fn);
  return () => _expiredSubscribers.delete(fn);
}

function _notifySessionExpired() {
  _expiredSubscribers.forEach((fn) => fn());
}

export function getAuthToken() {
  return _accessToken;
}

export function getUser() {
  return _user;
}

export function setAuth(accessToken, user) {
  _accessToken = accessToken;
  if (accessToken) {
    const payload = parseJwt(accessToken);
    _expiration = payload ? new Date(payload.exp * 1000).toISOString() : null;
  } else {
    _expiration = null;
  }
  _user = user || null;
  _scheduleRefresh();
  _notify();
}

export function clearAuth() {
  clearTimeout(_refreshTimer);
  _refreshTimer = null;
  _accessToken = null;
  _expiration = null;
  _user = null;
  _notify();
}

// ── Refresh token flow (cookie-based) ──

let _refreshPromise = null;

export async function refreshAccessToken() {
  // Deduplicate concurrent refresh calls
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${API}users/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        if (import.meta.env.DEV) {
          console.debug(
            `[auth] refreshAccessToken: ${res.status} ${res.statusText} — cookie likely missing or expired`
          );
        }
        clearAuth();
        return false;
      }
      const data = await res.json();
      setAuth(data.accessToken, data.user);
      return true;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.debug("[auth] refreshAccessToken threw:", err);
      }
      clearAuth();
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Payload = token.split(".")[1];
    const padded = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "="
    );
    const payload = atob(padded);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function getUserRole() {
  if (_user) return _user.role;
  const token = getAuthToken();
  if (!token) return null;
  const data = parseJwt(token);
  return data ? data.role : null;
}

export function isAuthenticated() {
  return _accessToken && _expiration && new Date(_expiration) > new Date();
}

export function isAdmin() {
  return isAuthenticated() && getUserRole() === "admin";
}

export function isModerator() {
  return isAuthenticated() && getUserRole() === "moderator";
}

export function isVerified() {
  if (!isAuthenticated()) return false;
  if (_user) return _user.isVerified;
  const token = getAuthToken();
  if (!token) return false;
  const data = parseJwt(token);
  return data ? data.isVerified : false;
}

// ── Auth-agnostic fetch wrapper: distinguishes "server unreachable" (fetch
// itself throws), "DB down" (backend's connectDB middleware responds 503),
// and "Stripe down" (a Stripe-calling route responds 502) from ordinary
// non-ok responses, which callers still handle themselves. ──

export async function fetchOrThrow(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError("Unable to reach the server.", null);
  }
  if (response.status === 503) {
    throw new ApiError("Database is unavailable.", 503);
  }
  if (response.status === 502) {
    throw new ApiError(STRIPE_DOWN_MESSAGE, 502);
  }
  return response;
}

// ── Authenticated fetch with auto-refresh ──

export async function fetchWithAuth(url, options = {}) {
  let token = getAuthToken();

  if (!token || !isAuthenticated()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      _notifySessionExpired();
      throw new Error("Session expired. Please log in again.");
    }
    token = getAuthToken();
  }

  const headers = { ...(options.headers || {}) };
  headers.Authorization = `Bearer ${token}`;

  const response = await fetchOrThrow(url, { ...options, headers });

  // If 401, try one refresh then retry
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      _notifySessionExpired();
      throw new Error("Session expired. Please log in again.");
    }
    token = getAuthToken();
    headers.Authorization = `Bearer ${token}`;
    return fetchOrThrow(url, { ...options, headers });
  }

  return response;
}
