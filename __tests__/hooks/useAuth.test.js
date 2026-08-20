import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSignup, useLogin } from "../../src/hooks/useAuth";

const mockSetAuth = jest.fn();
jest.mock("../../src/auth/auth", () => ({
  ...jest.requireActual("../../src/auth/auth"),
  setAuth: (...args) => mockSetAuth(...args),
  clearAuth: jest.fn(),
}));

function wrapper({ children }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("useSignup", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("logs in with the same credentials immediately after registering, instead of requiring the user to retype them", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Registered" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: "token123",
          user: { id: "u1", role: "user", email: "new@test.com" },
        }),
      });

    const { result } = renderHook(() => useSignup(), { wrapper });

    act(() => {
      result.current.mutate({ name: "New User", email: "new@test.com", password: "password123" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [registerCall, loginCall] = global.fetch.mock.calls;
    expect(registerCall[0]).toContain("users/register");
    expect(loginCall[0]).toContain("users/login");
    expect(JSON.parse(loginCall[1].body)).toEqual({
      email: "new@test.com",
      password: "password123",
    });
    expect(mockSetAuth).toHaveBeenCalledWith("token123", {
      id: "u1",
      role: "user",
      email: "new@test.com",
    });
  });

  it("does not attempt to log in if registration itself fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Email already in use." }),
    });

    const { result } = renderHook(() => useSignup(), { wrapper });

    act(() => {
      result.current.mutate({ name: "New User", email: "new@test.com", password: "password123" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(result.current.error.message).toBe("Email already in use.");
  });
});

describe("useLogin", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("still logs in normally on its own", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: "token456",
        user: { id: "u2", role: "user", email: "existing@test.com" },
      }),
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate({ email: "existing@test.com", password: "password123" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetAuth).toHaveBeenCalledWith("token456", {
      id: "u2",
      role: "user",
      email: "existing@test.com",
    });
  });
});
