import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../../src/components/common/ProtectedRoute";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: jest.fn(),
  getUserRole: jest.fn(),
}));

const { isAuthenticated, getUserRole } = require("../../../src/auth/auth");

function renderWithRoute(initialPath = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("should render child route for admin", () => {
    isAuthenticated.mockReturnValue(true);
    getUserRole.mockReturnValue("admin");

    renderWithRoute("/admin");
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("should redirect to /login if not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    getUserRole.mockReturnValue(null);

    renderWithRoute("/admin");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("should redirect to / if authenticated but not admin", () => {
    isAuthenticated.mockReturnValue(true);
    getUserRole.mockReturnValue("user");

    renderWithRoute("/admin");
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("should redirect moderator to / (admin-only route)", () => {
    isAuthenticated.mockReturnValue(true);
    getUserRole.mockReturnValue("moderator");

    renderWithRoute("/admin");
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
