import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AnalyticsTab from "../../../src/components/admin/AnalyticsTab";
import "@testing-library/jest-dom";

// Mock chart.js components — canvas isn't available in jsdom
jest.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="mock-line-chart">Line Chart</div>,
}));

const statsPayload = {
  revenue: { events: 500, eventSubscriptions: 80, courses: 70, venues: 100, total: 750 },
  counts: {
    users: 42,
    ticketsSold: 10,
    courseEnrollments: 5,
    eventSubscriptions: 2,
    venueBookings: 3,
    teams: 1,
  },
  topEvents: [{ eventId: "1", title: "Event A", ticketsSold: 10 }],
  topCourses: [{ courseId: "c1", title: "Course A", enrollments: 5 }],
  userGrowth: [{ month: "2026-08", count: 4 }],
  revenueByCourse: [
    { courseId: "c1", title: "Pottery Basics", revenue: 65 },
    { courseId: "c2", title: "Advanced Pottery", revenue: 0 },
  ],
  revenueByVenue: [{ venueId: "v1", name: "Venue A", revenue: 100 }],
  revenueByEventSubscription: [{ eventId: "e1", title: "Reoccurring Event A", revenue: 80 }],
};

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(statsPayload),
    })
  ),
}));

const events = [
  { _id: "1", title: "Event A", totalRevenue: 500, ticketsAvailable: 10, ticketPrice: 25 },
  { _id: "2", title: "Event B", totalRevenue: 0, ticketsAvailable: 50, ticketPrice: 10 },
  { _id: "3", title: "Event C", totalRevenue: 150, ticketsAvailable: 0, ticketPrice: 30 },
];

function renderWithClient(ui) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("AnalyticsTab", () => {
  it("renders events with sales and total events counts from props immediately", () => {
    renderWithClient(<AnalyticsTab events={events} />);
    // 2 events have revenue > 0
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders org-wide total revenue from the admin stats endpoint", async () => {
    renderWithClient(<AnalyticsTab events={events} />);
    expect(await screen.findByText("£750.00")).toBeInTheDocument();
  });

  it("renders the revenue breakdown by source", async () => {
    renderWithClient(<AnalyticsTab events={events} />);
    expect(await screen.findByText("Revenue by Source")).toBeInTheDocument();
    expect(screen.getByText("Ticket Sales")).toBeInTheDocument();
    expect(screen.getByText("£80.00")).toBeInTheDocument(); // event subscriptions
    expect(screen.getByText("£70.00")).toBeInTheDocument(); // courses
  });

  it("renders cross-resource counts once loaded", async () => {
    renderWithClient(<AnalyticsTab events={events} />);
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
    expect(screen.getByText("Total Users")).toBeInTheDocument();
  });

  it("renders top events and top courses", async () => {
    renderWithClient(<AnalyticsTab events={events} />);
    expect(await screen.findByText("10 sold")).toBeInTheDocument();
    expect(screen.getByText("5 enrolled")).toBeInTheDocument();
  });

  it("renders the per-event revenue chart and table once expanded", async () => {
    renderWithClient(<AnalyticsTab events={events} />);
    await screen.findByTestId("mock-line-chart"); // User Growth isn't collapsible

    expect(screen.queryByTestId("mock-bar-chart")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Revenue by Event"));

    expect(await screen.findByTestId("mock-bar-chart")).toBeInTheDocument();
    // £150.00 (Event C) is unique to this table — £500.00/"Event A" also
    // appear in the always-visible Most Popular Events / Revenue by Source.
    expect(screen.getByText("£150.00")).toBeInTheDocument();
    expect(screen.getByText("Tickets Left")).toBeInTheDocument();
  });

  it("keeps per-resource revenue panels collapsed until clicked", async () => {
    renderWithClient(<AnalyticsTab events={events} />);
    const coursePanelToggle = await screen.findByText("Revenue by Course");

    // Collapsed by default — chart/list content isn't in the DOM yet
    expect(screen.queryByText("Pottery Basics")).not.toBeInTheDocument();

    fireEvent.click(coursePanelToggle);

    expect(await screen.findByText("Pottery Basics")).toBeInTheDocument();
    expect(screen.getByText("£65.00")).toBeInTheDocument();
  });

  it("renders the other resource revenue panels once expanded", async () => {
    renderWithClient(<AnalyticsTab events={events} />);

    fireEvent.click(await screen.findByText("Revenue by Venue"));
    expect(await screen.findByText("Venue A")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Revenue by Event Subscriptions"));
    expect(await screen.findByText("Reoccurring Event A")).toBeInTheDocument();
  });
});
