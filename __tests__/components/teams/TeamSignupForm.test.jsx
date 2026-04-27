import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TeamSignupForm from "../../../src/components/teams/TeamSignupForm";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ teams: [] }),
    })
  ),
}));

describe("TeamSignupForm", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form with all fields", async () => {
    await act(async () => {
      render(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });

    expect(screen.getByText("Team Sign Up")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Team Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Manager Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Manager Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone Number")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    await act(async () => {
      render(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });

    fireEvent.click(screen.getByLabelText("Close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should pre-fill manager email from prop", async () => {
    await act(async () => {
      render(<TeamSignupForm eventId="e1" managerId="mgr@test.com" onClose={mockOnClose} />);
    });

    const emailInput = screen.getByPlaceholderText("Manager Email");
    expect(emailInput.value).toBe("mgr@test.com");
  });

  it("should show submit button with correct text", async () => {
    await act(async () => {
      render(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });
    expect(screen.getByText("Register Team")).toBeInTheDocument();
  });

  it("should have required fields", async () => {
    await act(async () => {
      render(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });

    expect(screen.getByPlaceholderText("Team Name")).toBeRequired();
    expect(screen.getByPlaceholderText("Manager Name")).toBeRequired();
    expect(screen.getByPlaceholderText("Manager Email")).toBeRequired();
    expect(screen.getByPlaceholderText("Phone Number")).toBeRequired();
  });
});
