import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import SessionExpiredBanner from "../../../src/components/common/SessionExpiredBanner";

let mockExpiredCallback = null;

jest.mock("../../../src/auth/auth", () => ({
  subscribeToSessionExpired: jest.fn((fn) => {
    mockExpiredCallback = fn;
    return () => {
      mockExpiredCallback = null;
    };
  }),
}));

function renderBanner() {
  return render(
    <MemoryRouter>
      <SessionExpiredBanner />
    </MemoryRouter>
  );
}

describe("SessionExpiredBanner", () => {
  beforeEach(() => {
    mockExpiredCallback = null;
  });

  it("renders nothing until a session-expired event fires", () => {
    renderBanner();
    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it("shows the notice when the session-expired event fires", () => {
    renderBanner();
    act(() => mockExpiredCallback());
    expect(screen.getAllByText(/session has expired/i)[0]).toBeInTheDocument();
  });

  it("dismisses without navigating away", () => {
    renderBanner();
    act(() => mockExpiredCallback());
    fireEvent.click(screen.getAllByLabelText("Dismiss")[0]);
    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it("links the login action to /login", () => {
    renderBanner();
    act(() => mockExpiredCallback());
    const link = screen.getAllByRole("link", { name: /log in/i })[0];
    expect(link).toHaveAttribute("href", "/login");
  });
});
