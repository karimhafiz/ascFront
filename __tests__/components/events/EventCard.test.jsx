import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "../../../src/components/events/EventCard";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteLoaderData: jest.fn(() => ({ token: null })),
  useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock("../../../src/auth/auth", () => ({
  isAdmin: jest.fn(() => false),
  isModerator: jest.fn(() => false),
}));

const baseEvent = {
  _id: "evt1",
  title: "Community Meetup",
  shortDescription: "A fun community gathering",
  typeOfEvent: "ASC",
  date: "2026-06-15T18:00:00.000Z",
  city: "London",
  street: "123 Main St",
  images: [],
  isReoccurring: false,
  categories: ["Social"],
};

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <EventCard event={{ ...baseEvent, ...overrides }} />
    </MemoryRouter>
  );
}

describe("EventCard", () => {
  it("renders event title and description", () => {
    renderCard();
    expect(screen.getByText("Community Meetup")).toBeInTheDocument();
    expect(screen.getByText("A fun community gathering")).toBeInTheDocument();
  });

  it("displays ticket price when provided", () => {
    renderCard({ ticketPrice: 15 });
    expect(screen.getByText("£15.00")).toBeInTheDocument();
  });

  it("displays 'Free' when ticket price is 0", () => {
    renderCard({ ticketPrice: 0 });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("displays tickets available when provided", () => {
    renderCard({ ticketsAvailable: 42 });
    expect(screen.getByText("42 left")).toBeInTheDocument();
  });

  it("displays both price and tickets when both provided", () => {
    renderCard({ ticketPrice: 10, ticketsAvailable: 25 });
    expect(screen.getByText("£10.00")).toBeInTheDocument();
    expect(screen.getByText("25 left")).toBeInTheDocument();
  });

  it("does not display price or tickets row when neither is provided", () => {
    renderCard();
    expect(screen.queryByText(/£/)).not.toBeInTheDocument();
    expect(screen.queryByText(/left/)).not.toBeInTheDocument();
  });

  it("displays event type badge", () => {
    renderCard({ typeOfEvent: "Sports" });
    expect(screen.getByText("Sports")).toBeInTheDocument();
  });

  it("displays recurring badge for recurring events", () => {
    renderCard({ isReoccurring: true });
    expect(screen.getByText(/Recurring/)).toBeInTheDocument();
  });

  it("displays category tags", () => {
    renderCard({ categories: ["Music", "Outdoor"] });
    expect(screen.getByText("Music")).toBeInTheDocument();
    expect(screen.getByText("Outdoor")).toBeInTheDocument();
  });

  it("displays featured badge when event is featured", () => {
    renderCard({ featured: true });
    expect(screen.getByText(/Featured/)).toBeInTheDocument();
  });

  it("displays city and street", () => {
    renderCard();
    expect(screen.getByText("London: 123 Main St")).toBeInTheDocument();
  });
});
