import React from "react";
import { render, screen } from "@testing-library/react";
import RevenueTab from "../../../src/components/admin/RevenueTab";
import "@testing-library/jest-dom";

// Mock chart.js Bar component — canvas isn't available in jsdom
jest.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="mock-chart">Chart</div>,
}));

const events = [
  { _id: "1", title: "Event A", totalRevenue: 500, ticketsAvailable: 10, ticketPrice: 25 },
  { _id: "2", title: "Event B", totalRevenue: 0, ticketsAvailable: 50, ticketPrice: 10 },
  { _id: "3", title: "Event C", totalRevenue: 150, ticketsAvailable: 0, ticketPrice: 30 },
];

describe("RevenueTab", () => {
  it("renders total revenue", () => {
    render(<RevenueTab events={events} />);
    expect(screen.getByText("£650.00")).toBeInTheDocument();
  });

  it("renders events with sales count", () => {
    render(<RevenueTab events={events} />);
    // 2 events have revenue > 0
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders total events count", () => {
    render(<RevenueTab events={events} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the chart", () => {
    render(<RevenueTab events={events} />);
    expect(screen.getByTestId("mock-chart")).toBeInTheDocument();
  });

  it("renders event rows in the table", () => {
    render(<RevenueTab events={events} />);
    expect(screen.getByText("Event A")).toBeInTheDocument();
    expect(screen.getByText("Event B")).toBeInTheDocument();
    expect(screen.getByText("Event C")).toBeInTheDocument();
  });

  it("shows empty state for no events", () => {
    render(<RevenueTab events={[]} />);
    expect(screen.getByText("£0.00")).toBeInTheDocument();
    // Both "Events with Sales" and "Total Events" show 0
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(2);
  });
});
