import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../../src/components/common/MainNavbar";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: jest.fn(),
  isAdmin: jest.fn(),
  parseJwt: jest.fn(),
  getAuthToken: jest.fn(),
  clearAuth: jest.fn(),
}));

const { isAuthenticated, isAdmin, parseJwt, getAuthToken } = require("../../../src/auth/auth");

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe("MainNavbar", () => {
  beforeEach(() => {
    isAuthenticated.mockReturnValue(false);
    isAdmin.mockReturnValue(false);
    parseJwt.mockReturnValue(null);
    getAuthToken.mockReturnValue(null);
  });

  it("should render core navigation links", () => {
    renderNavbar();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.getByText("Courses")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("should show Login and Sign Up when not authenticated", () => {
    renderNavbar();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("should hide Login and Sign Up when authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    parseJwt.mockReturnValue({ email: "user@test.com" });
    getAuthToken.mockReturnValue("some-token");

    renderNavbar();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
  });

  it("should show Dashboard link for admin", () => {
    isAuthenticated.mockReturnValue(true);
    isAdmin.mockReturnValue(true);
    parseJwt.mockReturnValue({ email: "admin@test.com" });
    getAuthToken.mockReturnValue("some-token");

    renderNavbar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should not show Dashboard for non-admin authenticated user", () => {
    isAuthenticated.mockReturnValue(true);
    isAdmin.mockReturnValue(false);
    parseJwt.mockReturnValue({ email: "user@test.com" });
    getAuthToken.mockReturnValue("some-token");

    renderNavbar();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("should show user email initial when authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    parseJwt.mockReturnValue({ email: "alice@test.com" });
    getAuthToken.mockReturnValue("some-token");

    renderNavbar();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should show My Profile link when authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    parseJwt.mockReturnValue({ email: "alice@test.com" });
    getAuthToken.mockReturnValue("some-token");

    renderNavbar();
    expect(screen.getByText("My Profile")).toBeInTheDocument();
  });

  it("should show Log out button when authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    parseJwt.mockReturnValue({ email: "alice@test.com" });
    getAuthToken.mockReturnValue("some-token");

    renderNavbar();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });
});
