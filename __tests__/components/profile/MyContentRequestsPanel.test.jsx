import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import MyContentRequestsPanel from "../../../src/components/profile/MyContentRequestsPanel";

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: jest.fn(),
}));

const { fetchWithAuth } = require("../../../src/auth/auth");

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MyContentRequestsPanel />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("MyContentRequestsPanel", () => {
  it("shows a loading state initially", () => {
    fetchWithAuth.mockReturnValue(new Promise(() => {}));
    renderPanel();
    expect(screen.getByText(/loading your requests/i)).toBeInTheDocument();
  });

  it("shows an error message when the fetch fails", async () => {
    fetchWithAuth.mockResolvedValue({ ok: false });
    renderPanel();
    await waitFor(() =>
      expect(screen.getByText("Failed to load your requests")).toBeInTheDocument()
    );
  });

  it("shows an empty state when there are no requests", async () => {
    fetchWithAuth.mockResolvedValue({ ok: true, json: async () => [] });
    renderPanel();
    await waitFor(() =>
      expect(screen.getByText("No change requests submitted yet.")).toBeInTheDocument()
    );
  });

  it("renders a list of requests with status and page", async () => {
    fetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => [
        { _id: "r1", page: "home", status: "pending", createdAt: "2026-01-05T00:00:00.000Z" },
      ],
    });
    renderPanel();

    await waitFor(() => expect(screen.getByText("home page")).toBeInTheDocument());
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("shows the decline reason only for declined requests that have one", async () => {
    fetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          _id: "r1",
          page: "about",
          status: "declined",
          declineReason: "Needs more detail",
          createdAt: "2026-01-05T00:00:00.000Z",
        },
        { _id: "r2", page: "home", status: "approved", createdAt: "2026-01-05T00:00:00.000Z" },
      ],
    });
    renderPanel();

    await waitFor(() => expect(screen.getByText(/Needs more detail/)).toBeInTheDocument());
    // only the declined request should show a reason line, not the approved one
    const reasons = screen.getAllByText(/Reason:/);
    expect(reasons).toHaveLength(1);
  });
});
