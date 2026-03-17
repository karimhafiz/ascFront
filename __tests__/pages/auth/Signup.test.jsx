import React from "react";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import Signup from "../../../src/pages/auth/Signup";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: jest.fn(() => false),
  getAuthToken: jest.fn(() => null),
}));

jest.mock("../../../src/components/auth/GoogleLogin", () => () => <div>Google Login Button</div>);

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useActionData: jest.fn(() => undefined),
    useNavigation: jest.fn(() => ({ state: "idle" })),
  };
});

const { isAuthenticated } = require("../../../src/auth/auth");
const { useActionData } = require("react-router-dom");

function renderSignup() {
  const router = createMemoryRouter(
    [
      { path: "/signup", element: <Signup /> },
      { path: "/", element: <div>Home</div> },
    ],
    { initialEntries: ["/signup"] }
  );
  return render(<RouterProvider router={router} />);
}

describe("Signup Page", () => {
  beforeEach(() => {
    isAuthenticated.mockReturnValue(false);
    useActionData.mockReturnValue(undefined);
  });

  it("should render signup form", () => {
    renderSignup();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("should render Google login button", () => {
    renderSignup();
    expect(screen.getByText("Google Login Button")).toBeInTheDocument();
  });

  it("should redirect to home if already authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    renderSignup();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should display error message from action data", () => {
    useActionData.mockReturnValue({ message: "Email already in use." });
    renderSignup();
    expect(screen.getByText("Email already in use.")).toBeInTheDocument();
  });

  it("should show submit button", () => {
    renderSignup();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });
});
