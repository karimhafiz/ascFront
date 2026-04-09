import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TicketsTab from "../../../src/components/admin/TicketsTab";
import "@testing-library/jest-dom";

const makeTicket = (overrides = {}) => ({
  _id: Math.random().toString(36).slice(2),
  buyerEmail: "buyer@test.com",
  ticketCode: "TKT-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  paymentId: "pay_abc123",
  createdAt: "2026-03-01T10:00:00Z",
  checkedIn: false,
  eventId: { title: "Test Event", ticketPrice: 10 },
  ...overrides,
});

// Mock window.open
const mockOpen = jest.fn();
window.open = mockOpen;

describe("TicketsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'No tickets found' when tickets array is empty", () => {
    render(<TicketsTab tickets={[]} />);
    expect(screen.getByText("No tickets found")).toBeInTheDocument();
  });

  it("renders a single ticket row", () => {
    const ticket = makeTicket({ buyerEmail: "john@example.com" });
    render(<TicketsTab tickets={[ticket]} />);
    expect(screen.getByText("Test Event")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("groups tickets by paymentId and shows quantity", () => {
    const paymentId = "pay_group1";
    const tickets = [
      makeTicket({ paymentId, ticketCode: "TKT-AAA001" }),
      makeTicket({ paymentId, ticketCode: "TKT-AAA002" }),
      makeTicket({ paymentId, ticketCode: "TKT-AAA003" }),
    ];
    render(<TicketsTab tickets={tickets} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("tickets")).toBeInTheDocument();
  });

  it("expands a multi-ticket group on row click", () => {
    const paymentId = "pay_expand";
    const tickets = [
      makeTicket({ paymentId, ticketCode: "TKT-EXP001" }),
      makeTicket({ paymentId, ticketCode: "TKT-EXP002" }),
    ];
    render(<TicketsTab tickets={tickets} />);

    // Before expand, individual codes shouldn't be visible
    expect(screen.queryByText("TKT-EXP001")).not.toBeInTheDocument();

    // Click the group row to expand
    const rows = screen.getAllByRole("row");
    // rows[0] is header, rows[1] is the group row
    fireEvent.click(rows[1]);

    // After expand, individual ticket codes should show
    expect(screen.getByText("TKT-EXP001")).toBeInTheDocument();
    expect(screen.getByText("TKT-EXP002")).toBeInTheDocument();
  });

  it("opens ticket page on single-ticket row click", () => {
    const ticket = makeTicket({ ticketCode: "TKT-SINGLE" });
    render(<TicketsTab tickets={[ticket]} />);

    const rows = screen.getAllByRole("row");
    fireEvent.click(rows[1]);
    expect(mockOpen).toHaveBeenCalledWith("/tickets/TKT-SINGLE", "_blank");
  });

  it("filters tickets by search input", () => {
    const tickets = [
      makeTicket({ buyerEmail: "alice@test.com", paymentId: "p1" }),
      makeTicket({ buyerEmail: "bob@test.com", paymentId: "p2" }),
    ];
    render(<TicketsTab tickets={tickets} />);

    const search = screen.getByPlaceholderText(/search/i);
    fireEvent.change(search, { target: { value: "alice" } });

    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.queryByText("bob@test.com")).not.toBeInTheDocument();
  });

  it("shows print button for single-ticket orders", () => {
    const ticket = makeTicket({ ticketCode: "TKT-PRINT1" });
    render(<TicketsTab tickets={[ticket]} />);
    expect(screen.getByTitle("Print ticket")).toBeInTheDocument();
  });
});
