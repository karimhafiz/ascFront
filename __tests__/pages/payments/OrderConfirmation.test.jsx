import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderConfirmation from "../../../src/pages/payments/OrderConfirmation";
import "@testing-library/jest-dom";

let mockAuth = { loggedIn: false, token: null };

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: () => mockAuth.loggedIn,
  getAuthToken: () => mockAuth.token,
}));

// Mock QRCodeSVG to avoid canvas issues in tests
jest.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }) => <div data-testid="qr-code">{value}</div>,
}));

const originalFetch = global.fetch;

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
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("Guest user (unauthenticated)", () => {
    it("shows loading spinner while fetching guest order", () => {
      // Fetch never resolves — stays loading
      global.fetch.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByText("Loading your ticket…")).toBeInTheDocument();
    });

    describe("when guest order loads successfully", () => {
      beforeEach(() => {
        global.fetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            tickets: [
              {
                _id: "t1",
                ticketCode: "TKT-ABC123",
                buyerEmail: "guest@example.com",
                eventId: {
                  _id: "ev1",
                  title: "Football Match",
                  date: "2026-06-01T18:00:00Z",
                  openingTime: "6:00 PM",
                  street: "Main St",
                  city: "London",
                  postCode: "E1 1AA",
                  typeOfEvent: "Sports",
                  ticketPrice: 10,
                },
              },
            ],
            email: "guest@example.com",
            amountTotal: 10,
            quantity: 1,
          }),
        });
      });

      it("shows payment success banner", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
        });
      });

      it("shows the ticket card with ticket code", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("TKT-ABC123")).toBeInTheDocument();
        });
      });

      it("shows the event title on the ticket", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Football Match")).toBeInTheDocument();
        });
      });

      it("shows QR code on the ticket", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });
      });

      it("shows account registration prompt", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Want to view your tickets online?")).toBeInTheDocument();
        });
      });

      it("shows Create an Account button", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Create an Account")).toBeInTheDocument();
        });
      });

      it("shows Print Ticket button", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Print Ticket")).toBeInTheDocument();
        });
      });

      it("shows Browse More Events link", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Browse More Events")).toBeInTheDocument();
        });
      });
    });

    describe("when guest order has multiple tickets", () => {
      beforeEach(() => {
        global.fetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            tickets: [
              {
                _id: "t1",
                ticketCode: "TKT-AAA111",
                buyerEmail: "guest@example.com",
                eventId: { _id: "ev1", title: "Football", ticketPrice: 10 },
              },
              {
                _id: "t2",
                ticketCode: "TKT-BBB222",
                buyerEmail: "guest@example.com",
                eventId: { _id: "ev1", title: "Football", ticketPrice: 10 },
              },
            ],
            email: "guest@example.com",
            amountTotal: 20,
            quantity: 2,
          }),
        });
      });

      it("shows multi-ticket message", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText(/ticket 1 of 2/)).toBeInTheDocument();
          expect(screen.getByText(/All tickets were sent to your email/)).toBeInTheDocument();
        });
      });
    });

    describe("when guest order fetch fails", () => {
      beforeEach(() => {
        global.fetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({ error: "Not found" }),
        });
      });

      it("shows fallback payment success message", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
          expect(screen.getByText(/A confirmation email/)).toBeInTheDocument();
        });
      });

      it("shows Create an Account button in fallback", async () => {
        renderPage();
        await waitFor(() => {
          expect(screen.getByText("Create an Account")).toBeInTheDocument();
        });
      });
    });
  });

  describe("Authenticated user", () => {
    beforeEach(() => {
      mockAuth = { loggedIn: true, token: "fake.jwt.token" };
      // Ticket fetch fails — shows fallback
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "Forbidden" }),
      });
    });

    it("shows payment success message", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
      });
    });

    it("mentions profile for ticket visibility", async () => {
      renderPage();
      await waitFor(() => {
        expect(
          screen.getByText(/Your ticket will appear in your profile shortly/)
        ).toBeInTheDocument();
      });
    });

    it("shows View My Tickets button instead of Create an Account", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("View My Tickets")).toBeInTheDocument();
        expect(screen.queryByText("Create an Account")).not.toBeInTheDocument();
      });
    });

    it("does NOT show account registration prompt", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.queryByText("Want to view your tickets online?")).not.toBeInTheDocument();
      });
    });
  });
});
