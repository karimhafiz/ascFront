import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import VenuesTab from "../../../src/components/admin/VenuesTab";

const bookings = [
  {
    _id: "b1",
    venue: { _id: "v1", name: "Sports Hall", city: "London" },
    user: { name: "Alice", email: "alice@test.com" },
    eventName: "Birthday Party",
    slot: { date: "2026-02-10T00:00:00.000Z" },
    totalPrice: 100,
    status: "confirmed",
  },
  {
    _id: "b2",
    venue: { _id: "v1", name: "Sports Hall", city: "London" },
    user: { name: "Bob", email: "bob@test.com" },
    eventName: "Team Practice",
    slot: { date: "2026-02-05T00:00:00.000Z" },
    totalPrice: 50,
    status: "pending",
  },
  {
    _id: "b3",
    venue: { _id: "v2", name: "Community Centre", city: "Leeds" },
    user: { name: "Carol", email: "carol@test.com" },
    eventName: "Workshop",
    slot: { date: "2026-02-15T00:00:00.000Z" },
    totalPrice: 200,
    status: "cancelled",
  },
];

describe("VenuesTab", () => {
  it("groups bookings by venue in the default 'By Venue' view", () => {
    render(<VenuesTab venueBookings={bookings} />);
    expect(screen.getByText("Sports Hall")).toBeInTheDocument();
    expect(screen.getByText("Community Centre")).toBeInTheDocument();
    expect(screen.getByText("2 bookings")).toBeInTheDocument();
    expect(screen.getByText("1 booking")).toBeInTheDocument();
  });

  it("excludes cancelled bookings from a venue group's revenue total", () => {
    render(<VenuesTab venueBookings={bookings} />);
    // Sports Hall: 100 (confirmed) + 50 (pending) = 150, cancelled Community Centre booking excluded from its own total (200 cancelled -> £0.00)
    expect(screen.getByText("£150.00")).toBeInTheDocument();
    expect(screen.getByText("£0.00")).toBeInTheDocument();
  });

  it("expands a venue group to show its bookings on click", () => {
    render(<VenuesTab venueBookings={bookings} />);
    expect(screen.queryByText("Birthday Party")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Sports Hall"));

    expect(screen.getByText("Birthday Party")).toBeInTheDocument();
    expect(screen.getByText("Team Practice")).toBeInTheDocument();
  });

  it("collapses an expanded venue group on a second click", () => {
    render(<VenuesTab venueBookings={bookings} />);
    fireEvent.click(screen.getByText("Sports Hall"));
    expect(screen.getByText("Birthday Party")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Sports Hall"));
    expect(screen.queryByText("Birthday Party")).not.toBeInTheDocument();
  });

  it("filters bookings by search term across venue, user, and event name", () => {
    render(<VenuesTab venueBookings={bookings} />);
    fireEvent.change(screen.getByPlaceholderText(/search by venue, user, or event name/i), {
      target: { value: "workshop" },
    });

    expect(screen.getByText("Community Centre")).toBeInTheDocument();
    expect(screen.queryByText("Sports Hall")).not.toBeInTheDocument();
  });

  it("switches to the flat 'All' view showing a sortable table", () => {
    render(<VenuesTab venueBookings={bookings} />);
    fireEvent.click(screen.getByText("All"));

    // Flat view lists every booking's event name directly, no expand step needed
    expect(screen.getByText("Birthday Party")).toBeInTheDocument();
    expect(screen.getByText("Team Practice")).toBeInTheDocument();
    expect(screen.getByText("Workshop")).toBeInTheDocument();
  });

  it("sorts the flat view by price", () => {
    render(<VenuesTab venueBookings={bookings} />);
    fireEvent.click(screen.getByText("All"));
    fireEvent.click(screen.getByText("Price"));

    const rows = screen.getAllByText(/^£\d+\.00$/);
    // ascending: 50, 100, 200
    expect(rows.map((el) => el.textContent)).toEqual(["£50.00", "£100.00", "£200.00"]);
  });

  it("shows a not-found message when search matches nothing", () => {
    render(<VenuesTab venueBookings={bookings} />);
    fireEvent.change(screen.getByPlaceholderText(/search by venue, user, or event name/i), {
      target: { value: "nonexistent" },
    });

    expect(screen.getByText("No bookings found")).toBeInTheDocument();
  });
});
