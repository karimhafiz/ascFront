import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TeamSignupForm from "../../../src/components/teams/TeamSignupForm";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: jest.fn((url) => {
    if (url.includes("/register")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Registered" }), // no url = free tournament
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ teams: [] }),
    });
  }),
}));

function renderWithQuery(ui) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("TeamSignupForm", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form with all fields", async () => {
    await act(async () => {
      renderWithQuery(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });

    expect(screen.getByText("Team Sign Up")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Team Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Manager Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Manager Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone Number")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    await act(async () => {
      renderWithQuery(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });

    fireEvent.click(screen.getByLabelText("Close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should pre-fill manager email from prop", async () => {
    await act(async () => {
      renderWithQuery(
        <TeamSignupForm eventId="e1" managerId="mgr@test.com" onClose={mockOnClose} />
      );
    });

    const emailInput = screen.getByPlaceholderText("Manager Email");
    expect(emailInput.value).toBe("mgr@test.com");
  });

  it("should show submit button with correct text", async () => {
    await act(async () => {
      renderWithQuery(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });
    expect(screen.getByText("Register Team")).toBeInTheDocument();
  });

  it("should have required fields", async () => {
    await act(async () => {
      renderWithQuery(<TeamSignupForm eventId="e1" onClose={mockOnClose} />);
    });

    expect(screen.getByPlaceholderText("Team Name")).toBeRequired();
    expect(screen.getByPlaceholderText("Manager Name")).toBeRequired();
    expect(screen.getByPlaceholderText("Manager Email")).toBeRequired();
    expect(screen.getByPlaceholderText("Phone Number")).toBeRequired();
  });

  // Regression test: a free-tournament registration used to close the modal
  // and hard-reload the page instead of calling the onSuccess invalidation
  // callback the parent already wires up — silently dropping it.
  it("should invalidate and call onSuccess/onClose on free registration instead of reloading", async () => {
    const mockOnSuccess = jest.fn();
    const reloadSpy = jest.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });

    await act(async () => {
      renderWithQuery(
        <TeamSignupForm eventId="e1" onClose={mockOnClose} onSuccess={mockOnSuccess} />
      );
    });

    fireEvent.change(screen.getByPlaceholderText("Team Name"), {
      target: { value: "The Test Team" },
    });
    fireEvent.change(screen.getByPlaceholderText("Manager Name"), {
      target: { value: "Manager Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("Manager Email"), {
      target: { value: "manager@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone Number"), {
      target: { value: "07123456789" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Register Team"));
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(reloadSpy).not.toHaveBeenCalled();
  });
});
