import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import RequestsTab from "../../../src/components/admin/RequestsTab";

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: jest.fn(),
}));

const { fetchWithAuth } = require("../../../src/auth/auth");

const requests = [
  {
    _id: "r1",
    page: "home",
    status: "pending",
    createdAt: "2026-01-05T00:00:00.000Z",
    requestedBy: { name: "Alice", email: "alice@test.com" },
  },
  {
    _id: "r2",
    page: "about",
    status: "pending",
    createdAt: "2026-01-10T00:00:00.000Z",
    requestedBy: { name: "Bob", email: "bob@test.com" },
  },
  {
    _id: "r3",
    page: "home",
    status: "approved",
    createdAt: "2026-01-01T00:00:00.000Z",
    requestedBy: { name: "Carol", email: "carol@test.com" },
  },
];

function renderTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RequestsTab />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("RequestsTab", () => {
  beforeEach(() => {
    fetchWithAuth.mockResolvedValue({ ok: true, json: async () => requests });
  });

  it("defaults to showing only pending requests", async () => {
    renderTab();
    await waitFor(() => expect(screen.getByText(/Alice/)).toBeInTheDocument());
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.queryByText(/Carol/)).not.toBeInTheDocument();
  });

  it("switches to reviewed requests when the Reviewed toggle is clicked", async () => {
    renderTab();
    await waitFor(() => expect(screen.getByText(/Alice/)).toBeInTheDocument());

    fireEvent.click(screen.getByText("Reviewed (1)"));

    expect(screen.getByText(/Carol/)).toBeInTheDocument();
    expect(screen.queryByText(/Alice/)).not.toBeInTheDocument();
    // Reviewed requests shouldn't offer approve/decline
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
  });

  it("filters the active list by search term", async () => {
    renderTab();
    await waitFor(() => expect(screen.getByText(/Alice/)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/search by page or requester/i), {
      target: { value: "bob" },
    });

    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.queryByText(/Alice/)).not.toBeInTheDocument();
  });

  it("sorts the active list by submitted date", async () => {
    renderTab();
    await waitFor(() => expect(screen.getByText(/Alice/)).toBeInTheDocument());

    fireEvent.click(screen.getByText("Submitted"));

    const names = screen
      .getAllByText(/Alice|Bob/)
      .map((el) => el.textContent.match(/Alice|Bob/)[0]);
    expect(names).toEqual(["Alice", "Bob"]); // ascending — Alice submitted first
  });

  it("shows a not-found message when search matches nothing in the active list", async () => {
    renderTab();
    await waitFor(() => expect(screen.getByText(/Alice/)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/search by page or requester/i), {
      target: { value: "nobody" },
    });

    expect(screen.getByText("No matching requests")).toBeInTheDocument();
  });
});
