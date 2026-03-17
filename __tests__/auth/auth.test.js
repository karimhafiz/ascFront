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
});
