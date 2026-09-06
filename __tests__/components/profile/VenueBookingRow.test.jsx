import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VenueBookingRow from "../../../src/components/profile/VenueBookingRow";
import { fetchWithAuth } from "../../../src/auth/auth";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: jest.fn(),
}));

const baseBooking = {
  _id: "b1",
  bookingCode: "VBK-ABC123",
  status: "confirmed",
  totalPrice: 150,
  numberOfAttendees: 20,
  venue: { name: "Community Centre", city: "London" },
  slot: { date: "2026-06-01T00:00:00.000Z", startTime: "09:00", endTime: "13:00" },
};

function renderRow(props = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const defaultProps = { booking: baseBooking, onAction: jest.fn(), ...props };
  return {
    onAction: defaultProps.onAction,
    ...render(
      <QueryClientProvider client={queryClient}>
        <VenueBookingRow {...defaultProps} />
      </QueryClientProvider>
    ),
  };
}

describe("VenueBookingRow — Cancel booking", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a Cancel booking button for a confirmed booking", () => {
    renderRow();
    expect(screen.getByText("Cancel booking")).toBeInTheDocument();
  });

  it("does not show a Cancel booking button for a cancelled booking", () => {
    renderRow({ booking: { ...baseBooking, status: "cancelled" } });
    expect(screen.queryByText("Cancel booking")).not.toBeInTheDocument();
  });

  it("does not show a Cancel booking button for a completed booking", () => {
    renderRow({ booking: { ...baseBooking, status: "completed" } });
    expect(screen.queryByText("Cancel booking")).not.toBeInTheDocument();
  });

  it("asks for confirmation before cancelling", () => {
    renderRow();
    fireEvent.click(screen.getByText("Cancel booking"));
    expect(screen.getByRole("heading", { name: "Cancel booking" })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel this booking/i)).toBeInTheDocument();
    // Not yet sent to the server just by opening the confirmation
    expect(fetchWithAuth).not.toHaveBeenCalled();
  });

  it("cancels the booking on confirm, flips the badge, and notifies the parent", async () => {
    fetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Booking cancelled successfully" }),
    });
    const { onAction } = renderRow();

    fireEvent.click(screen.getByText("Cancel booking"));
    fireEvent.click(screen.getByText("Yes, cancel"));

    await waitFor(() => expect(onAction).toHaveBeenCalled());
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("venues/booking/b1/cancel"),
      expect.objectContaining({ method: "POST" })
    );
    expect(screen.getAllByText("cancelled").length).toBeGreaterThan(0);
    expect(screen.queryByText("Cancel booking")).not.toBeInTheDocument();
  });

  it("shows an error message if cancellation fails", async () => {
    fetchWithAuth.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Cannot cancel a completed booking" }),
    });
    renderRow();

    fireEvent.click(screen.getByText("Cancel booking"));
    fireEvent.click(screen.getByText("Yes, cancel"));

    await waitFor(() =>
      expect(screen.getByText("Cannot cancel a completed booking")).toBeInTheDocument()
    );
    // Booking stays confirmed — the button should still be there to retry
    expect(screen.getByText("Cancel booking")).toBeInTheDocument();
  });
});
