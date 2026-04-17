import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TeamSignupForm from "../../../src/components/teams/TeamSignupForm";
import "@testing-library/jest-dom";

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ teams: [] }),
  })
);

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
    expect(screen.getByPlaceholderText("Member Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Member Email")).toBeInTheDocument();
  });

  it("should start with one member row", async () => {
    await act(async () => {
      render(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });
    expect(screen.getByText("1 member")).toBeInTheDocument();
  });

  it("should add a member when clicking Add Member", async () => {
    await act(async () => {
      render(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Add Member/));
    });

    expect(screen.getByText("2 members")).toBeInTheDocument();
    const memberInputs = screen.getAllByPlaceholderText("Member Name");
    expect(memberInputs).toHaveLength(2);
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
    expect(screen.getByText(/Pay & Register Team/)).toBeInTheDocument();
  });
});
