import React from "react";
import { render } from "@testing-library/react";
import GoogleLogin from "../../../src/components/auth/GoogleLogin";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(() => jest.fn()),
  };
});

jest.mock("../../../src/hooks/useAuth", () => ({
  googleLogin: jest.fn(() => Promise.resolve({ role: null })),
}));

describe("GoogleLogin component", () => {
  it("renders a container div for the Google Sign-In button", () => {
    const { container } = render(<GoogleLogin />);
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
  });

  it("has a ref container with correct classes", () => {
    const { container } = render(<GoogleLogin />);
    const div = container.querySelector(".mt-6.flex.justify-center");
    expect(div).toBeInTheDocument();
  });

  it("does not render a fallback button (GSI renders externally)", () => {
    const { container } = render(<GoogleLogin />);
    expect(container.querySelector("button")).toBeNull();
  });
});
