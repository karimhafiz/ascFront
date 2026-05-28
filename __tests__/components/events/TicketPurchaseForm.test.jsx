import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TicketPurchaseForm from "../../../src/components/events/TicketPurchaseForm";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

let mockAuth = { loggedIn: false, token: null, email: "" };

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: () => mockAuth.loggedIn,
  getAuthToken: () => mockAuth.token,
  parseJwt: (t) => (t ? { email: mockAuth.email } : null),
  fetchWithAuth: jest.fn(),
}));

const baseEvent = {
  _id: "evt1",
  title: "Football Match",
  ticketPrice: 10,
  ticketsAvailable: 50,
  isReoccurring: false,
  stripePriceId: null,
  isTournament: false,
  subscriptionInterval: null,
};

function renderForm(eventOverrides = {}, props = {}) {
  const event = { ...baseEvent, ...eventOverrides };
  return render(
    <MemoryRouter>
      <TicketPurchaseForm
        event={event}
        eventId={event._id}
        onTournamentSignup={jest.fn()}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("TicketPurchaseForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = { loggedIn: false, token: null, email: "" };
  });

  // ── Guest ticket purchase ──

  describe("Guest (unauthenticated)", () => {
    it("shows editable email field for guests", () => {
      renderForm();
      const emailInput = screen.getByPlaceholderText("Enter your email");
      expect(emailInput).not.toBeDisabled();
    });

    it("shows email warning for guests", () => {
      renderForm();
      expect(screen.getByText("Double-check your email")).toBeInTheDocument();
      expect(screen.getByText(/This cannot be changed after purchase/)).toBeInTheDocument();
    });

    it("shows the ticket form (email + quantity + buy button) for one-time events", () => {
      renderForm();
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
      expect(screen.getByText("Ticket Quantity:")).toBeInTheDocument();
      expect(screen.getByText("Buy Tickets")).toBeInTheDocument();
    });
  });

  // ── Logged-in user ──

  describe("Authenticated user", () => {
    beforeEach(() => {
      mockAuth = { loggedIn: true, token: "fake.jwt.token", email: "user@test.com" };
    });

    it("shows disabled email field with pre-filled value", () => {
      renderForm();
      const emailInput = screen.getByPlaceholderText("Enter your email");
      expect(emailInput).toBeDisabled();
      expect(emailInput.value).toBe("user@test.com");
    });

    it("shows lock icon when logged in", () => {
      renderForm();
      expect(screen.getByTitle("Using your account email")).toBeInTheDocument();
    });

    it("does NOT show email warning when logged in", () => {
      renderForm();
      expect(screen.queryByText("Double-check your email")).not.toBeInTheDocument();
    });
  });

  // ── Subscription events (auth required) ──

  describe("Subscription events", () => {
    const subscriptionEvent = {
      isReoccurring: true,
      stripePriceId: "price_123",
      ticketPrice: 15,
      subscriptionInterval: "week",
    };

    it("shows login CTA instead of form for unauthenticated users", () => {
      renderForm(subscriptionEvent);
      expect(screen.getByText("Log in to subscribe")).toBeInTheDocument();
      expect(
        screen.getByText(/You need an account to manage your subscription/)
      ).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Enter your email")).not.toBeInTheDocument();
    });

    it("shows sign up link for unauthenticated users", () => {
      renderForm(subscriptionEvent);
      expect(screen.getByText("Sign up")).toBeInTheDocument();
    });

    it("navigates to /login when login button clicked", () => {
      renderForm(subscriptionEvent);
      fireEvent.click(screen.getByText("Log in to subscribe"));
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("navigates to /register when sign up clicked", () => {
      renderForm(subscriptionEvent);
      fireEvent.click(screen.getByText("Sign up"));
      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });

    it("shows full form for authenticated users", () => {
      mockAuth = { loggedIn: true, token: "fake.jwt.token", email: "user@test.com" };
      renderForm(subscriptionEvent);
      expect(screen.queryByText("Log in to subscribe")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });
  });

  // ── Tournament events (auth required) ──

  describe("Tournament events", () => {
    const tournamentEvent = { isTournament: true };

    it("shows login CTA instead of form for unauthenticated users", () => {
      renderForm(tournamentEvent);
      expect(screen.getByText("Log in to register your team")).toBeInTheDocument();
      expect(screen.getByText(/You need an account to register a team/)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Enter your email")).not.toBeInTheDocument();
    });

    it("shows full form for authenticated users", () => {
      mockAuth = { loggedIn: true, token: "fake.jwt.token", email: "user@test.com" };
      renderForm(tournamentEvent);
      expect(screen.queryByText("Log in to register your team")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });
  });
});
