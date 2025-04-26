import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecurringEventsCalendar from "./RecurringEventsCalendar";

// Mock react-big-calendar
jest.mock("react-big-calendar", () => ({
  Calendar: ({ events }) => (
    <div>
      {/* Only render event titles, not a header */}
      {events.map((event) => (
        <div key={event._id}>{event.title}</div>
      ))}
    </div>
  ),
  momentLocalizer: jest.fn(),
}));

jest.mock("../util/util", () => ({
  generateRecurringEvents: (event) => [event], // Mock: return the event as-is
}));

describe("Recurring Events Calendar Component", () => {
  it("should render the calendar", () => {
    const events = [
      {
        _id: "1",
        title: "Football",
        date: "2025-05-03T00:00:00.000Z",
        isReoccurring: true,
        dayOfWeek: "friday",
      },
    ];

    render(
      <MemoryRouter>
        <RecurringEventsCalendar events={events} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Recurring Events/i)).toBeInTheDocument();
    expect(screen.getByText(/Football/i)).toBeInTheDocument();
  });

  it("should render multiple recurring events", () => {
    const events = [
      {
        _id: "1",
        title: "Football",
        date: "2025-05-03T00:00:00.000Z",
        isReoccurring: true,
        dayOfWeek: "friday",
      },
      {
        _id: "2",
        title: "Basketball",
        date: "2025-05-10T00:00:00.000Z",
        isReoccurring: true,
        dayOfWeek: "saturday",
      },
    ];
    render(
      <MemoryRouter>
        <RecurringEventsCalendar events={events} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Football/i)).toBeInTheDocument();
    expect(screen.getByText(/Basketball/i)).toBeInTheDocument();
  });

  it("should render nothing but the header if no events are provided", () => {
    render(
      <MemoryRouter>
        <RecurringEventsCalendar events={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Recurring Events/i)).toBeInTheDocument();
  });
});
