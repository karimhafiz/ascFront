import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventPage from "../../../src/pages/events/Event";
import "@testing-library/jest-dom";

const mockEvents = [
  {
    _id: "1",
    title: "Cheap Early",
    shortDescription: "First event",
    typeOfEvent: "ASC",
    date: "2026-05-01T10:00:00.000Z",
    ticketPrice: 5,
    ticketsAvailable: 100,
    isReoccurring: false,
    images: [],
    categories: [],
  },
  {
    _id: "2",
    title: "Expensive Late",
    shortDescription: "Second event",
    typeOfEvent: "Sports",
    date: "2026-08-15T10:00:00.000Z",
    ticketPrice: 50,
    ticketsAvailable: 10,
    isReoccurring: false,
    images: [],
    categories: [],
  },
  {
    _id: "3",
    title: "Mid Price",
    shortDescription: "Third event",
    typeOfEvent: "ASC",
    date: "2026-06-20T10:00:00.000Z",
    ticketPrice: 20,
    ticketsAvailable: 50,
    isReoccurring: false,
    images: [],
    categories: [],
  },
];

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteLoaderData: jest.fn(() => ({ events: mockEvents, token: null })),
  useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock("../../../src/auth/auth", () => ({
  isAdmin: jest.fn(() => false),
  isModerator: jest.fn(() => false),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <EventPage />
    </MemoryRouter>
  );
}

describe("EventPage", () => {
  it("renders all events by default", () => {
    renderPage();
    expect(screen.getByText("Cheap Early")).toBeInTheDocument();
    expect(screen.getByText("Expensive Late")).toBeInTheDocument();
    expect(screen.getByText("Mid Price")).toBeInTheDocument();
  });

  it("filters by event type when tab is clicked", () => {
    renderPage();
    fireEvent.click(screen.getByText("Sports Events"));
    expect(screen.getByText("Expensive Late")).toBeInTheDocument();
    expect(screen.queryByText("Cheap Early")).not.toBeInTheDocument();
    expect(screen.queryByText("Mid Price")).not.toBeInTheDocument();
  });

  it("filters by search text", () => {
    renderPage();
    const searchInput = screen.getByPlaceholderText("Search events...");
    fireEvent.change(searchInput, { target: { value: "Cheap" } });
    expect(screen.getByText("Cheap Early")).toBeInTheDocument();
    expect(screen.queryByText("Expensive Late")).not.toBeInTheDocument();
  });

  it("renders sort buttons (Date, Price, Tickets)", () => {
    renderPage();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Tickets")).toBeInTheDocument();
  });

  it("renders view toggle buttons (Cards, Calendar)", () => {
    renderPage();
    expect(screen.getByText("Cards")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
  });

  it("hides sort controls in calendar view", () => {
    renderPage();
    fireEvent.click(screen.getByText("Calendar"));
    expect(screen.queryByPlaceholderText("Search events...")).not.toBeInTheDocument();
    expect(screen.queryByText("Price")).not.toBeInTheDocument();
    expect(screen.queryByText("Tickets")).not.toBeInTheDocument();
  });

  it("renders type filter tabs", () => {
    renderPage();
    expect(screen.getByText("All Events")).toBeInTheDocument();
    expect(screen.getByText("ASC Events")).toBeInTheDocument();
    expect(screen.getByText("Sports Events")).toBeInTheDocument();
  });
});
