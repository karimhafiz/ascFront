const API = import.meta.env.VITE_DEV_URI;

// ── In-memory token store (not accessible via XSS unlike localStorage) ──
let _accessToken = null;
let _expiration = null;
let _user = null; // { id, name, email, role }

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
}

export function clearAuth() {
  _accessToken = null;
  _expiration = null;
  _user = null;
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
        clearAuth();
        return false;
      }
      const data = await res.json();
      setAuth(data.accessToken, data.user);
      return true;
    } catch {
      clearAuth();
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Token utilities ──

export function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const padded = base64Payload.padEnd(base64Payload.length + (4 - (base64Payload.length % 4)) % 4, "=");
    const payload = atob(padded);
    return JSON.parse(payload);
  } catch (err) {
    console.error("parseJwt failed:", err);
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
  return !!_accessToken && !!_expiration && new Date(_expiration) > new Date();
}

export function isAdmin() {
  return isAuthenticated() && getUserRole() === "admin";
}

export function isModerator() {
  return isAuthenticated() && getUserRole() === "moderator";
}

// ── Authenticated fetch with auto-refresh ──

export async function fetchWithAuth(url, options = {}) {
  let token = getAuthToken();

  if (!token || !isAuthenticated()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please log in again.");
    }
    token = getAuthToken();
  }

  const headers = { ...(options.headers || {}) };
  headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  // If 401, try one refresh then retry
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please log in again.");
    }
    token = getAuthToken();
    headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  }

  return response;
}
