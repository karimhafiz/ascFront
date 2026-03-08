import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GoogleLogin from "./GoogleLogin";
import "@testing-library/jest-dom";

// mock navigate hook
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(() => jest.fn()),
  };
});

// mock authActions.googleLogin so we don't hit network
jest.mock("../auth/authActions", () => ({
  googleLogin: jest.fn(() => Promise.resolve({ role: null })),
}));

describe("GoogleLogin component", () => {
  it("renders a button with Google text", () => {
    render(<GoogleLogin />);
    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  it("button is disabled initially until script loads", () => {
    render(<GoogleLogin />);
    const btn = screen.getByRole("button", { name: /continue with google/i });
    expect(btn).toBeDisabled();
  });
});
