import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderConfirmation from "../../../src/pages/payments/OrderConfirmation";
import "@testing-library/jest-dom";

let mockAuth = { loggedIn: false, token: null };

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: () => mockAuth.loggedIn,
  getAuthToken: () => mockAuth.token,
}));

function renderPage(search = "?session_id=cs_test_123") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/order-confirmation${search}`]}>
        <OrderConfirmation />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("OrderConfirmation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = { loggedIn: false, token: null };
  });

  describe("Guest user (unauthenticated)", () => {
    it("shows payment success message", () => {
      renderPage();
      expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
    });

    it("shows account registration prompt", () => {
      renderPage();
      expect(screen.getByText("Want to view your tickets online?")).toBeInTheDocument();
      expect(screen.getByText(/Create an account using the same email/)).toBeInTheDocument();
    });

    it("shows Create an Account button instead of View My Tickets", () => {
      renderPage();
      expect(screen.getByText("Create an Account")).toBeInTheDocument();
      expect(screen.queryByText("View My Tickets")).not.toBeInTheDocument();
    });

    it("shows Browse More Events link", () => {
      renderPage();
      expect(screen.getByText("Browse More Events")).toBeInTheDocument();
    });

    it("does NOT mention profile", () => {
      renderPage();
      expect(screen.queryByText(/will appear in your profile/)).not.toBeInTheDocument();
    });
  });

  describe("Authenticated user", () => {
    beforeEach(() => {
      mockAuth = { loggedIn: true, token: "fake.jwt.token" };
    });

    it("shows payment success message", () => {
      renderPage();
      expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
    });

    it("mentions profile for ticket visibility", () => {
      renderPage();
      expect(
        screen.getByText(/Your ticket will appear in your profile shortly/)
      ).toBeInTheDocument();
    });

    it("shows View My Tickets button instead of Create an Account", () => {
      renderPage();
      expect(screen.getByText("View My Tickets")).toBeInTheDocument();
      expect(screen.queryByText("Create an Account")).not.toBeInTheDocument();
    });

    it("does NOT show account registration prompt", () => {
      renderPage();
      expect(screen.queryByText("Want to view your tickets online?")).not.toBeInTheDocument();
    });
  });
});
