import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TeamsTab from "../../../src/components/admin/TeamsTab";
import "@testing-library/jest-dom";

// Mock window.open for print
window.open = jest.fn(() => ({
  document: { write: jest.fn(), close: jest.fn() },
}));

const makeTeam = (overrides = {}) => ({
  _id: Math.random().toString(36).slice(2),
  name: "Test Team",
  paid: true,
  event: { title: "Cup Final", date: "2026-06-15T00:00:00Z" },
  manager: { name: "John", email: "john@test.com", phone: "07123456789" },
  members: [
    { name: "Alice", email: "alice@test.com" },
    { name: "Bob", email: "bob@test.com" },
  ],
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

  it("renders a team card with name and event", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    expect(screen.getByText("Test Team")).toBeInTheDocument();
    expect(screen.getByText(/Cup Final/)).toBeInTheDocument();
  });

  it("shows paid status badge", () => {
    render(<TeamsTab teams={[makeTeam({ paid: true })]} />);
    expect(screen.getByText("✓ Paid")).toBeInTheDocument();
  });

  it("shows pending status badge for unpaid teams", () => {
    render(<TeamsTab teams={[makeTeam({ paid: false })]} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows member count", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    expect(screen.getByText("2 members")).toBeInTheDocument();
  });

  it("expands members on 'Show members' click", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    fireEvent.click(screen.getByText("Show members"));
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("collapses members on 'Hide members' click", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    fireEvent.click(screen.getByText("Show members"));
    expect(screen.getByText("Alice")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hide members"));
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("filters teams by search", () => {
    const teams = [
      makeTeam({ _id: "1", name: "Alpha Squad" }),
      makeTeam({ _id: "2", name: "Beta Team" }),
    ];
    render(<TeamsTab teams={teams} />);

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "Alpha" },
    });

    expect(screen.getByText("Alpha Squad")).toBeInTheDocument();
    expect(screen.queryByText("Beta Team")).not.toBeInTheDocument();
  });

  it("has a print button that opens a new window", () => {
    render(<TeamsTab teams={[makeTeam()]} />);
    fireEvent.click(screen.getByTitle("Print team details"));
    expect(window.open).toHaveBeenCalledWith("", "_blank");
  });
});
