import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TicketVerify from "../../../src/pages/tickets/TicketVerify";
import "@testing-library/jest-dom";

let mockAuth = { isAdmin: false, isModerator: false };
const mockFetchWithAuth = jest.fn();

jest.mock("../../../src/auth/auth", () => ({
  isAdmin: () => mockAuth.isAdmin,
  isModerator: () => mockAuth.isModerator,
  fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

function renderPage(ticketCode = "TKT-ABC234") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/tickets/verify/${ticketCode}`]}>
        <Routes>
          <Route path="/tickets/verify/:ticketCode" element={<TicketVerify />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("TicketVerify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = { isAdmin: false, isModerator: false };
  });

  describe("Authorization check", () => {
    it("shows auth required for regular users without calling backend", () => {
      renderPage();
      expect(
        screen.getByText("Please log in as staff (admin or moderator) to verify tickets.")
      ).toBeInTheDocument();
      expect(screen.getAllByText("Authentication Required")).toHaveLength(2);
      expect(mockFetchWithAuth).not.toHaveBeenCalled();
    });

    it("shows auth required for unauthenticated users without calling backend", () => {
      mockAuth = { isAdmin: false, isModerator: false };
      renderPage();
      expect(screen.getAllByText("Authentication Required")).toHaveLength(2);
      expect(mockFetchWithAuth).not.toHaveBeenCalled();
    });

    it("fetches ticket for admin users", async () => {
      mockAuth = { isAdmin: true, isModerator: false };
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            _id: "t1",
            checkedIn: false,
            eventId: { title: "Test Event", date: "2026-06-01T10:00:00Z" },
            user: { name: "John Doe", email: "john@example.com" },
          }),
      });

      renderPage();
      await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledTimes(1));
      expect(await screen.findByText("Test Event")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("fetches ticket for moderator users", async () => {
      mockAuth = { isAdmin: false, isModerator: true };
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            _id: "t1",
            checkedIn: false,
            eventId: { title: "Mod Event" },
            user: { name: "Jane Doe" },
          }),
      });

      renderPage();
      await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledTimes(1));
      expect(await screen.findByText("Mod Event")).toBeInTheDocument();
    });
  });

  describe("Invalid ticket code format", () => {
    it("shows invalid format for bad ticket code without calling backend", () => {
      renderPage("BADCODE");
      expect(screen.getAllByText("Invalid Code Format")).toHaveLength(2);
      expect(mockFetchWithAuth).not.toHaveBeenCalled();
    });

    it("shows invalid format for lowercase codes", () => {
      renderPage("TKT-abc");
      expect(screen.getAllByText("Invalid Code Format")).toHaveLength(2);
      expect(mockFetchWithAuth).not.toHaveBeenCalled();
    });
  });

  describe("Valid ticket display", () => {
    it("shows valid status and check-in button for unchecked ticket", async () => {
      mockAuth = { isAdmin: true, isModerator: false };
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            _id: "t1",
            checkedIn: false,
            eventId: { title: "Concert", date: "2026-07-01T18:00:00Z" },
            user: { name: "Alice", email: "alice@test.com" },
          }),
      });

      renderPage();
      expect(await screen.findByText(/Valid — Ready to Check In/)).toBeInTheDocument();
      expect(screen.getByText("✓ Check In")).toBeInTheDocument();
    });

    it("shows already checked in for a checked-in ticket", async () => {
      mockAuth = { isAdmin: true, isModerator: false };
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            _id: "t1",
            checkedIn: true,
            checkedInAt: "2026-07-01T19:00:00Z",
            eventId: { title: "Concert" },
            user: { name: "Bob" },
          }),
      });

      renderPage();
      expect(await screen.findByText("Already Checked In")).toBeInTheDocument();
      expect(screen.queryByText("✓ Check In")).not.toBeInTheDocument();
    });
  });

  describe("Check-in flow", () => {
    it("checks in a valid ticket and shows success", async () => {
      mockAuth = { isAdmin: true, isModerator: false };
      const ticketData = {
        _id: "t1",
        checkedIn: false,
        eventId: { title: "Concert" },
        user: { name: "Alice" },
      };
      mockFetchWithAuth
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(ticketData),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              ...ticketData,
              checkedIn: true,
              wasAlreadyCheckedIn: false,
            }),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ ...ticketData, checkedIn: true }),
        });

      renderPage();
      const checkInBtn = await screen.findByText("✓ Check In");
      fireEvent.click(checkInBtn);
      expect(await screen.findByText("Checked In Successfully!")).toBeInTheDocument();
      expect(screen.getByText("Welcome!")).toBeInTheDocument();
    });
  });

  describe("Backend auth error fallback", () => {
    it("shows auth required when backend returns 401", async () => {
      mockAuth = { isAdmin: true, isModerator: false };
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderPage();
      await waitFor(() => {
        expect(screen.getAllByText("Authentication Required")).toHaveLength(2);
      });
      expect(
        screen.getByText("Please log in as staff (admin or moderator) to verify tickets.")
      ).toBeInTheDocument();
    });

    it("shows auth required when backend returns 403", async () => {
      mockAuth = { isAdmin: true, isModerator: false };
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      renderPage();
      await waitFor(() => {
        expect(screen.getAllByText("Authentication Required")).toHaveLength(2);
      });
    });
  });

  describe("Ticket not found", () => {
    it("shows ticket not found for 404 response", async () => {
      mockAuth = { isAdmin: true, isModerator: false };
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      renderPage();
      expect(await screen.findByText("Ticket Not Found")).toBeInTheDocument();
    });
  });
});
