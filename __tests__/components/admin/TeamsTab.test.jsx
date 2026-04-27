import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TeamsTab from "../../../src/components/admin/TeamsTab";
import "@testing-library/jest-dom";

window.open = jest.fn(() => ({
  document: { write: jest.fn(), close: jest.fn() },
}));

const makeTeam = (overrides = {}) => ({
  _id: Math.random().toString(36).slice(2),
  name: "Test Team",
  paid: true,
  event: { _id: "ev1", title: "Cup Final", date: "2026-06-15T00:00:00Z" },
  manager: { name: "John", email: "john@test.com", phone: "07123456789" },
  createdAt: "2026-03-01T00:00:00Z",
  ...overrides,
});

describe("TeamsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'No team registrations found' when empty", () => {
    render(<TeamsTab teams={[]} />);
    expect(screen.getByText("No team registrations found")).toBeInTheDocument();
  });

  it("renders event group header in default By Event view", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    expect(screen.getByText("Cup Final")).toBeInTheDocument();
  });

  it("shows team count per event group", () => {
    const teams = [makeTeam({ _id: "t1", name: "Alpha" }), makeTeam({ _id: "t2", name: "Beta" })];
    render(<TeamsTab teams={teams} />);
    expect(screen.getByText("2 teams")).toBeInTheDocument();
  });

  it("event groups start collapsed", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    expect(screen.queryByText("Test Team")).not.toBeInTheDocument();
  });

  it("expands event group on click to show teams", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    fireEvent.click(screen.getByText("Cup Final"));
    expect(screen.getByText("Test Team")).toBeInTheDocument();
  });

  it("shows paid status badge when expanded", () => {
    render(<TeamsTab teams={[makeTeam({ paid: true })]} />);
    fireEvent.click(screen.getByText("Cup Final"));
    expect(screen.getByText("\u2713 Paid")).toBeInTheDocument();
  });

  it("shows pending status badge when expanded", () => {
    render(<TeamsTab teams={[makeTeam({ paid: false })]} />);
    fireEvent.click(screen.getByText("Cup Final"));
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("filters teams by search", () => {
    const teams = [
      makeTeam({ _id: "1", name: "Alpha Squad", event: { _id: "ev1", title: "Event A" } }),
      makeTeam({ _id: "2", name: "Beta Team", event: { _id: "ev2", title: "Event B" } }),
    ];
    render(<TeamsTab teams={teams} />);

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "Alpha" },
    });

    expect(screen.getByText("Event A")).toBeInTheDocument();
    expect(screen.queryByText("Event B")).not.toBeInTheDocument();
  });

  it("switches to All view and shows team cards", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    fireEvent.click(screen.getByText("All"));
    expect(screen.getByText("Test Team")).toBeInTheDocument();
    expect(screen.getByText(/Cup Final/)).toBeInTheDocument();
  });

  it("has a print button in All view", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    fireEvent.click(screen.getByText("All"));
    fireEvent.click(screen.getByTitle("Print team details"));
    expect(window.open).toHaveBeenCalledWith("", "_blank");
  });
});
