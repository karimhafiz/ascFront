import { googleLogin, logoutAction } from "../../src/auth/authActions";
import { setAuth, clearAuth } from "../../src/auth/auth";

// Mock auth module
jest.mock("../../src/auth/auth", () => ({
  setAuth: jest.fn(),
  clearAuth: jest.fn(),
  getAuthToken: jest.fn(() => null),
}));

// Mock redirect to avoid React Router internals needing full Response API
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  redirect: jest.fn((url) => ({ redirectUrl: url, status: 302 })),
}));

// Mock global fetch
global.fetch = jest.fn();

describe("Auth Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("googleLogin", () => {
    it("should call API and set auth on success", async () => {
      const mockResponse = {
        accessToken: "mock-token",
        user: { id: "1", name: "Test", role: "user" },
      };
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await googleLogin("google-token-123");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("users/google"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ tokenId: "google-token-123" }),
        })
      );
      expect(setAuth).toHaveBeenCalledWith("mock-token", mockResponse.user);
      expect(result.role).toBe("user");
    });

    it("should throw on failed response", async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(googleLogin("bad-token")).rejects.toThrow("Google login failed");
    });
  });

  describe("logoutAction", () => {
    it("should call logout API and clear auth", async () => {
      fetch.mockResolvedValue({ ok: true });

      const result = await logoutAction();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("users/logout"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
      expect(clearAuth).toHaveBeenCalled();
      expect(result.status).toBe(302);
    });

    it("should clear auth even if API call fails", async () => {
      fetch.mockRejectedValue(new Error("Network error"));

      const result = await logoutAction();

      expect(clearAuth).toHaveBeenCalled();
      expect(result.status).toBe(302);
    });
  });
});
