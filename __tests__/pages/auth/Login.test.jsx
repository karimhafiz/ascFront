import React from "react";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import Login from "../../../src/pages/auth/Login";
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

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <Login /> },
      { path: "/", element: <div>Home</div> },
    ],
    { initialEntries: ["/login"] }
  );
  return render(<RouterProvider router={router} />);
}

describe("Login Page", () => {
  beforeEach(() => {
    isAuthenticated.mockReturnValue(false);
    useActionData.mockReturnValue(undefined);
  });

  it("should render login form", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("should render Google login button", () => {
    renderLogin();
    expect(screen.getByText("Google Login Button")).toBeInTheDocument();
  });

  it("should redirect to home if already authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    renderLogin();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should display error message from action data", () => {
    useActionData.mockReturnValue({ message: "Invalid credentials" });
    renderLogin();
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should display Google conflict message", () => {
    useActionData.mockReturnValue({
      message: "This account uses Google Sign-In.",
      authMethod: "google",
    });
    renderLogin();
    expect(screen.getByText("This account uses Google Sign-In.")).toBeInTheDocument();
    expect(screen.getByText(/Use the Google button below/)).toBeInTheDocument();
  });
});
