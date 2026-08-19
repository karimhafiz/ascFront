import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import VerifyEmail from "../../../src/pages/auth/VerifyEmail";
import "@testing-library/jest-dom";

let mockLoggedIn = false;
const mockRefreshAccessToken = jest.fn();

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: () => mockLoggedIn,
  refreshAccessToken: (...args) => mockRefreshAccessToken(...args),
  getAuthToken: () => "fake.jwt.token",
  parseJwt: () => ({ email: "user@test.com" }),
}));

const mockConfirmMutate = jest.fn();

jest.mock("../../../src/hooks/useEmailVerificationMutation", () => ({
  useConfirmEmailVerificationMutation: () => ({
    mutate: mockConfirmMutate,
  }),
  useRequestEmailVerificationMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

function renderPage(search = "?token=abc123") {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/verify-email${search}`]}>
        <VerifyEmail />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("VerifyEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoggedIn = false;
  });

  it("shows an error when no token is present in the URL", () => {
    renderPage("");
    expect(screen.getByText("This verification link is missing a token.")).toBeInTheDocument();
    expect(mockConfirmMutate).not.toHaveBeenCalled();
  });

  it("calls confirm exactly once with the token from the URL", () => {
    act(() => {
      renderPage();
    });
    expect(mockConfirmMutate).toHaveBeenCalledTimes(1);
    expect(mockConfirmMutate).toHaveBeenCalledWith("abc123", expect.any(Object));
  });

  it("shows a spinner while confirming", () => {
    // mutate() never resolves — stays in the pending state
    mockConfirmMutate.mockImplementation(() => {});
    renderPage();
    expect(screen.getByText("Verifying your email…")).toBeInTheDocument();
  });

  it("shows the error and a login link when not authenticated and the token is invalid", () => {
    mockConfirmMutate.mockImplementation((token, { onError }) =>
      onError({ message: "This link has expired or is invalid." })
    );
    renderPage();

    expect(screen.getByText("This link has expired or is invalid.")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("shows a resend notice instead of a login link when already authenticated and the token is invalid", () => {
    mockLoggedIn = true;
    mockConfirmMutate.mockImplementation((token, { onError }) =>
      onError({ message: "This link has expired or is invalid." })
    );
    renderPage();

    expect(screen.getByText("Verify your email to continue")).toBeInTheDocument();
  });

  it("shows success and refreshes the token when already logged in", () => {
    mockLoggedIn = true;
    mockConfirmMutate.mockImplementation((token, { onSuccess }) => onSuccess());
    renderPage();

    expect(screen.getByText("Email Verified")).toBeInTheDocument();
    expect(mockRefreshAccessToken).toHaveBeenCalled();
    expect(screen.getByText("Go to My Profile")).toBeInTheDocument();
  });

  it("does not attempt a token refresh when not logged in", () => {
    mockLoggedIn = false;
    mockConfirmMutate.mockImplementation((token, { onSuccess }) => onSuccess());
    renderPage();

    expect(screen.getByText("Email Verified")).toBeInTheDocument();
    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });
});
