import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ModeratorRoute from "../../../src/components/common/ModeratorRoute";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: jest.fn(),
  getUserRole: jest.fn(),
}));

const { isAuthenticated, getUserRole } = require("../../../src/auth/auth");

function renderWithRoute(initialPath = "/manage") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ModeratorRoute />}>
          <Route path="/manage" element={<div>Manage Page</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ModeratorRoute", () => {
  it("should render child route for admin", () => {
    isAuthenticated.mockReturnValue(true);
    getUserRole.mockReturnValue("admin");

    renderWithRoute();
    expect(screen.getByText("Manage Page")).toBeInTheDocument();
  });

  it("should render child route for moderator", () => {
    isAuthenticated.mockReturnValue(true);
    getUserRole.mockReturnValue("moderator");

    renderWithRoute();
    expect(screen.getByText("Manage Page")).toBeInTheDocument();
  });

  it("should redirect to /login if not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    getUserRole.mockReturnValue(null);

    renderWithRoute();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("should redirect regular user to /", () => {
    isAuthenticated.mockReturnValue(true);
    getUserRole.mockReturnValue("user");

    renderWithRoute();
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
