import { googleLogin } from "../../src/hooks/useAuth";
import { setAuth } from "../../src/auth/auth";

// Mock auth module
jest.mock("../../src/auth/auth", () => ({
  setAuth: jest.fn(),
  clearAuth: jest.fn(),
  getAuthToken: jest.fn(() => null),
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
});
