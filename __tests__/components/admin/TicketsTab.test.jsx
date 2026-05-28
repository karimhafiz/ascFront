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
  eventId: { _id: "ev1", title: "Test Event", ticketPrice: 10 },
  ...overrides,
});

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

  it("renders event group header in default By Event view", () => {
    const ticket = makeTicket();
    render(<TicketsTab tickets={[ticket]} />);
    expect(screen.getByText("Test Event")).toBeInTheDocument();
  });

  it("shows ticket count per event group", () => {
    const tickets = [
      makeTicket({ _id: "t1", paymentId: "p1" }),
      makeTicket({ _id: "t2", paymentId: "p2" }),
    ];
    render(<TicketsTab tickets={tickets} />);
    expect(screen.getByText("2 tickets")).toBeInTheDocument();
  });

  it("event groups start collapsed", () => {
    const ticket = makeTicket({ buyerEmail: "hidden@test.com" });
    render(<TicketsTab tickets={[ticket]} />);
    // Email should not be visible when collapsed
    expect(screen.queryByText("hidden@test.com")).not.toBeInTheDocument();
  });

  it("expands event group on click to show tickets", () => {
    const ticket = makeTicket({ buyerEmail: "visible@test.com" });
    render(<TicketsTab tickets={[ticket]} />);

    // Click the event group header
    fireEvent.click(screen.getByText("Test Event"));

    expect(screen.getByText("visible@test.com")).toBeInTheDocument();
  });

  it("filters tickets by search", () => {
    const tickets = [
      makeTicket({
        _id: "t1",
        buyerEmail: "alice@test.com",
        eventId: { _id: "ev1", title: "Event A" },
      }),
      makeTicket({
        _id: "t2",
        buyerEmail: "bob@test.com",
        eventId: { _id: "ev2", title: "Event B" },
      }),
    ];
    render(<TicketsTab tickets={tickets} />);

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "alice" },
    });

    expect(screen.getByText("Event A")).toBeInTheDocument();
    expect(screen.queryByText("Event B")).not.toBeInTheDocument();
  });

  it("switches to All view and shows flat table", () => {
    const ticket = makeTicket({ buyerEmail: "flat@test.com" });
    render(<TicketsTab tickets={[ticket]} />);

    fireEvent.click(screen.getByText("All"));

    expect(screen.getAllByText("flat@test.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Test Event").length).toBeGreaterThanOrEqual(1);
  });

  it("shows print button in All view", () => {
    const ticket = makeTicket();
    render(<TicketsTab tickets={[ticket]} />);
    fireEvent.click(screen.getByText("All"));
    expect(screen.getByTitle("Print ticket")).toBeInTheDocument();
  });

  it("groups by paymentId in All view and shows quantity", () => {
    const paymentId = "pay_group1";
    const tickets = [
      makeTicket({ paymentId, ticketCode: "TKT-AAA001" }),
      makeTicket({ paymentId, ticketCode: "TKT-AAA002" }),
      makeTicket({ paymentId, ticketCode: "TKT-AAA003" }),
    ];
    render(<TicketsTab tickets={tickets} />);
    fireEvent.click(screen.getByText("All"));
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("tickets")).toBeInTheDocument();
  });
});
