import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import UsersTab from "../../../src/components/admin/UsersTab";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  getAuthToken: () => "mock-token",
  fetchWithAuth: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Role updated" }),
    })
  ),
}));

import { fetchWithAuth } from "../../../src/auth/auth";

const users = [
  {
    _id: "u1",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
    isBanned: false,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    _id: "u2",
    name: "Mod User",
    email: "mod@test.com",
    role: "moderator",
    isBanned: false,
    createdAt: "2025-06-01T00:00:00Z",
  },
  {
    _id: "u3",
    name: "Regular User",
    email: "user@test.com",
    role: "user",
    isBanned: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("UsersTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all users", () => {
    render(
      <UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    expect(screen.getAllByText("Admin User").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Mod User").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Regular User").length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'you' label for current user", () => {
    render(
      <UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    expect(screen.getAllByText("you").length).toBeGreaterThanOrEqual(1);
  });

  it("renders role dropdowns for other users", () => {
    render(
      <UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    const selects = screen.getAllByRole("combobox");
    // 2 other users x 2 layouts (mobile + desktop) = 4
    expect(selects).toHaveLength(4);
  });

  it("shows 'No users found' when empty", () => {
    render(
      <UsersTab users={[]} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    expect(screen.getAllByText("No users found").length).toBeGreaterThanOrEqual(1);
  });

  it("filters users by search", () => {
    render(
      <UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "mod" },
    });
    expect(screen.getAllByText("Mod User").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Regular User")).not.toBeInTheDocument();
  });

  it("opens confirm modal on role change and calls onRoleChange after confirm", async () => {
    const onRoleChange = jest.fn();
    render(
      <UsersTab
        users={users}
        currentUserId="u1"
        onRoleChange={onRoleChange}
        onBanToggle={jest.fn()}
      />
    );

    const selects = screen.getAllByRole("combobox");
    // Change role on one of the selects (triggers confirm modal)
    fireEvent.change(selects[0], { target: { value: "admin" } });

    // Confirm modal should appear
    expect(screen.getByText("Promote user?")).toBeInTheDocument();

    // Click confirm
    await act(async () => {
      fireEvent.click(screen.getByText("Promote"));
    });

    expect(fetchWithAuth).toHaveBeenCalled();
    expect(onRoleChange).toHaveBeenCalledWith("u2", "admin");
  });

  it("shows role badges", () => {
    render(
      <UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    expect(screen.getAllByText("admin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("moderator").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("user").length).toBeGreaterThanOrEqual(1);
  });

  it("shows ban buttons for non-current users", () => {
    render(
      <UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    const banButtons = screen.getAllByText("Ban");
    expect(banButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("shows Active status for non-banned users", () => {
    render(
      <UsersTab users={users} currentUserId="u1" onRoleChange={jest.fn()} onBanToggle={jest.fn()} />
    );
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(1);
  });
});
