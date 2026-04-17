import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GoogleLogin from "../../../src/components/auth/GoogleLogin";
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
jest.mock("../../../src/auth/authActions", () => ({
  googleLogin: jest.fn(() => Promise.resolve({ role: null })),
}));

describe("GoogleLogin component", () => {
  it("renders a button with Google text", () => {
    render(<GoogleLogin />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("button is clickable", () => {
    render(<GoogleLogin />);
    const btn = screen.getByRole("button", { name: /continue with google/i });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    // Should not throw — click triggers handleClick which is a no-op when GSI isn't loaded
  });

  it("renders hidden Google button container", () => {
    const { container } = render(<GoogleLogin />);
    const hiddenDiv = container.querySelector(".opacity-0.pointer-events-none");
    expect(hiddenDiv).toBeInTheDocument();
  });
});
