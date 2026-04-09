import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import UsersTab from "../../../src/components/admin/UsersTab";
import "@testing-library/jest-dom";

// Mock auth
jest.mock("../../../src/auth/auth", () => ({
  getAuthToken: () => "mock-token",
}));

// Mock fetch for role change
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Role updated" }),
  })
);

const users = [
  {
    _id: "u1",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    _id: "u2",
    name: "Mod User",
    email: "mod@test.com",
    role: "moderator",
    createdAt: "2025-06-01T00:00:00Z",
  },
  {
    _id: "u3",
    name: "Regular User",
    email: "user@test.com",
    role: "user",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("UsersTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all users", () => {
    render(<UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} />);
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Mod User")).toBeInTheDocument();
    expect(screen.getByText("Regular User")).toBeInTheDocument();
  });

  it("shows 'you' label for current user instead of role dropdown", () => {
    render(<UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} />);
    expect(screen.getByText("you")).toBeInTheDocument();
  });

  it("renders role dropdowns for other users", () => {
    render(<UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} />);
    const selects = screen.getAllByRole("combobox");
    // 2 other users should have dropdowns
    expect(selects).toHaveLength(2);
  });

  it("shows 'No users found' when empty", () => {
    render(<UsersTab users={[]} currentUserId="u1" onRoleChange={jest.fn()} />);
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("filters users by search", () => {
    render(<UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "mod" },
    });
    expect(screen.getByText("Mod User")).toBeInTheDocument();
    expect(screen.queryByText("Regular User")).not.toBeInTheDocument();
  });

  it("calls onRoleChange after successful role update", async () => {
    const onRoleChange = jest.fn();
    render(<UsersTab users={users} currentUserId="u1" onRoleChange={onRoleChange} />);

    const selects = screen.getAllByRole("combobox");
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: "admin" } });
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(onRoleChange).toHaveBeenCalledWith("u2", "admin");
  });

  it("shows role badges with correct text", () => {
    render(<UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} />);
    // Role text appears in badges and dropdowns, so use getAllByText
    expect(screen.getAllByText("admin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("moderator").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("user").length).toBeGreaterThanOrEqual(1);
  });
});
