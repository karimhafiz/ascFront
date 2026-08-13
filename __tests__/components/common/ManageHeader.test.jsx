import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import ManageHeader from "../../../src/components/common/ManageHeader";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: jest.fn(() => false),
  isAdmin: jest.fn(() => false),
  isModerator: jest.fn(() => false),
}));

const { useLocation } = require("react-router-dom");
const { isAuthenticated, isAdmin, isModerator } = require("../../../src/auth/auth");

function renderHeader(props = {}) {
  return render(
    <MemoryRouter>
      <ManageHeader
        label="Event Management"
        createTo="/events/new"
        createLabel="Create Event"
        {...props}
      />
    </MemoryRouter>
  );
}

describe("ManageHeader", () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: "/events" });
    isAuthenticated.mockReturnValue(true);
    isAdmin.mockReturnValue(true);
    isModerator.mockReturnValue(false);
  });

  it("renders for an authenticated admin", () => {
    renderHeader();
    // FloatingBar renders an invisible layout clone alongside the real bar
    expect(screen.getAllByText("Event Management")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Create Event")[0]).toBeInTheDocument();
  });

  it("renders for an authenticated moderator", () => {
    isAdmin.mockReturnValue(false);
    isModerator.mockReturnValue(true);
    renderHeader();
    expect(screen.getAllByText("Event Management")[0]).toBeInTheDocument();
  });

  it("renders nothing for an unauthenticated visitor", () => {
    isAuthenticated.mockReturnValue(false);
    const { container } = renderHeader();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an authenticated regular user (not admin/moderator)", () => {
    isAdmin.mockReturnValue(false);
    isModerator.mockReturnValue(false);
    const { container } = renderHeader();
    expect(container).toBeEmptyDOMElement();
  });

  it("hides the bar when the current path matches hideOnPaths", () => {
    useLocation.mockReturnValue({ pathname: "/events/new" });
    const { container } = renderHeader({ hideOnPaths: /\/new$/ });
    expect(container).toBeEmptyDOMElement();
  });

  it("still renders when the path does not match hideOnPaths", () => {
    useLocation.mockReturnValue({ pathname: "/events" });
    renderHeader({ hideOnPaths: /\/new$/ });
    expect(screen.getAllByText("Event Management")[0]).toBeInTheDocument();
  });

  it("renders an edit button only when editTo is provided", () => {
    renderHeader({ editTo: "/events/1/edit", editLabel: "Edit Event" });
    expect(screen.getAllByText("Edit Event")[0]).toBeInTheDocument();
  });

  it("does not render a create button when createTo is omitted", () => {
    renderHeader({ createTo: undefined, createLabel: undefined });
    expect(screen.queryByText("Create Event")).not.toBeInTheDocument();
  });
});
