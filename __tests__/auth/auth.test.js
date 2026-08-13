import {
  setAuth,
  getAuthToken,
  getUser,
  clearAuth,
  isAuthenticated,
  isAdmin,
  isModerator,
  getUserRole,
  parseJwt,
  fetchWithAuth,
  subscribeToSessionExpired,
} from "../../src/auth/auth";

// Build a fake JWT with a given payload
function fakeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe("Auth utilities", () => {
  beforeEach(() => {
    clearAuth();
  });

  describe("parseJwt", () => {
    it("should decode a valid JWT payload", () => {
      const payload = { id: "123", role: "admin", exp: 9999999999 };
      const token = fakeJwt(payload);
      const result = parseJwt(token);
      expect(result.id).toBe("123");
      expect(result.role).toBe("admin");
    });

    it("should return null for invalid token", () => {
      const result = parseJwt("not-a-jwt");
      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = parseJwt("");
      expect(result).toBeNull();
    });
  });

  describe("setAuth / getAuthToken / getUser", () => {
    it("should store and retrieve token and user", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = fakeJwt({ id: "123", exp: futureExp });
      const user = { id: "123", name: "Test", email: "t@t.com", role: "user" };

      setAuth(token, user);

      expect(getAuthToken()).toBe(token);
      expect(getUser()).toEqual(user);
    });

    it("should handle null token", () => {
      setAuth(null, null);
      expect(getAuthToken()).toBeNull();
      expect(getUser()).toBeNull();
    });
  });

  describe("clearAuth", () => {
    it("should clear all auth state", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ exp: futureExp }), { id: "1" });
      clearAuth();
      expect(getAuthToken()).toBeNull();
      expect(getUser()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when token is valid and not expired", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ exp: futureExp }), { id: "1" });
      expect(isAuthenticated()).toBe(true);
    });

    it("should return false when token is expired", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      setAuth(fakeJwt({ exp: pastExp }), { id: "1" });
      expect(isAuthenticated()).toBe(false);
    });

    it("should return false when no token", () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("should return true for admin user", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ role: "admin", exp: futureExp }), { id: "1", role: "admin" });
      expect(isAdmin()).toBe(true);
    });

    it("should return false for regular user", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ role: "user", exp: futureExp }), { id: "1", role: "user" });
      expect(isAdmin()).toBe(false);
    });
  });

  describe("isModerator", () => {
    it("should return true for moderator", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ role: "moderator", exp: futureExp }), { id: "1", role: "moderator" });
      expect(isModerator()).toBe(true);
    });

    it("should return false for admin", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ role: "admin", exp: futureExp }), { id: "1", role: "admin" });
      expect(isModerator()).toBe(false);
    });
  });

  describe("getUserRole", () => {
    it("should return role from user object", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ role: "admin", exp: futureExp }), { id: "1", role: "admin" });
      expect(getUserRole()).toBe("admin");
    });

    it("should return role from token if no user", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      setAuth(fakeJwt({ role: "moderator", exp: futureExp }), null);
      // getUserRole checks _user first, then falls back to token
      expect(getUserRole()).toBe("moderator");
    });

    it("should return null when no auth", () => {
      expect(getUserRole()).toBeNull();
    });
  });

  describe("proactive refresh timer", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z")); // exact second boundary — exp is whole seconds
      global.fetch = jest.fn();
    });

    afterEach(() => {
      clearAuth();
      jest.useRealTimers();
      delete global.fetch;
    });

    it("schedules a refresh 1 minute before the token expires", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }),
          user: { id: "1" },
        }),
      });

      setAuth(fakeJwt({ exp: Math.floor(Date.now() / 1000) + 300 }), { id: "1" });

      await jest.advanceTimersByTimeAsync(300 * 1000 - 60_000 - 1);
      expect(global.fetch).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("reschedules the next refresh after a successful refresh", async () => {
      // exp computed lazily at call-time so it stays 300s ahead of the *advanced* fake clock,
      // not the clock at test setup — otherwise the second refresh sees an already-past
      // expiry, schedules a 0-delay timer, and loops forever.
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 300 }),
          user: { id: "1" },
        }),
      });

      setAuth(fakeJwt({ exp: Math.floor(Date.now() / 1000) + 300 }), { id: "1" });

      await jest.advanceTimersByTimeAsync(300 * 1000 - 60_000);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(300 * 1000 - 60_000);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("clears auth and stops the chain when a refresh fails", async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 401 });

      setAuth(fakeJwt({ exp: Math.floor(Date.now() / 1000) + 300 }), { id: "1" });

      await jest.advanceTimersByTimeAsync(300 * 1000 - 60_000);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(getAuthToken()).toBeNull();

      await jest.advanceTimersByTimeAsync(10 * 60 * 1000);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("cancels the pending timer when clearAuth is called manually", async () => {
      setAuth(fakeJwt({ exp: Math.floor(Date.now() / 1000) + 300 }), { id: "1" });
      clearAuth();

      await jest.advanceTimersByTimeAsync(300 * 1000);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("schedules an immediate refresh for an already-expired token", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 300 }),
          user: { id: "1" },
        }),
      });

      setAuth(fakeJwt({ exp: Math.floor(Date.now() / 1000) - 100 }), { id: "1" });

      await jest.advanceTimersByTimeAsync(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchWithAuth session-expired notification", () => {
    let unsubscribe;

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      unsubscribe?.();
      clearAuth();
      delete global.fetch;
    });

    it("notifies subscribers when there is no token and the refresh fails", async () => {
      const onExpired = jest.fn();
      unsubscribe = subscribeToSessionExpired(onExpired);
      global.fetch.mockResolvedValue({ ok: false, status: 401 });

      await expect(fetchWithAuth("http://api/test")).rejects.toThrow("Session expired");
      expect(onExpired).toHaveBeenCalledTimes(1);
    });

    it("notifies subscribers when a mid-request 401 retry-refresh fails", async () => {
      const onExpired = jest.fn();
      unsubscribe = subscribeToSessionExpired(onExpired);
      setAuth(fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }), { id: "1" });

      global.fetch
        .mockResolvedValueOnce({ status: 401 }) // the actual request
        .mockResolvedValueOnce({ ok: false, status: 401 }); // the retry-refresh attempt

      await expect(fetchWithAuth("http://api/test")).rejects.toThrow("Session expired");
      expect(onExpired).toHaveBeenCalledTimes(1);
    });
  });
});
