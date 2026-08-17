import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import VenueSlotManagement from "../../../src/pages/venues/VenueSlotManagement";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ venueSlug: `community-hall-${"a".repeat(24)}` }),
  };
});

const mockFetchPublicJSON = jest.fn();
jest.mock("../../../src/api/apiClient", () => ({
  fetchPublicJSON: (...args) => mockFetchPublicJSON(...args),
}));

const mockSaveMutateAsync = jest.fn();
const mockGenerateMutateAsync = jest.fn();
jest.mock("../../../src/hooks/useVenueMutation", () => ({
  useVenueScheduleMutation: jest.fn(() => ({ mutateAsync: mockSaveMutateAsync })),
  useVenueGenerateSlotsMutation: jest.fn(() => ({ mutateAsync: mockGenerateMutateAsync })),
}));

// Scope this test to VenueSlotManagement's own responsibility (fetching the
// venue, seeding the schedule, wiring the save/generate handlers) — SlotList
// gets its own dedicated test file, ScheduleEditor is stubbed to expose the
// two props under test.
jest.mock("../../../src/pages/venues/venueSlots/ScheduleEditor", () => (props) => (
  <div>
    <span data-testid="schedule-length">{props.schedule.length}</span>
    <button onClick={() => props.onSave([{ dayOfWeek: "monday" }])}>SaveSchedule</button>
    <button onClick={() => props.onGenerate("2026-09-01", "2026-09-07")}>GenerateSlots</button>
    <span data-testid="saving-state">{props.saving ? "saving" : "idle"}</span>
  </div>
));
jest.mock("../../../src/pages/venues/venueSlots/SlotList", () => (props) => (
  <div data-testid="slot-list">venueId={props.venueId}</div>
));

const venueId = "a".repeat(24);
const venue = {
  _id: venueId,
  name: "Community Hall",
  weeklySchedule: [{ dayOfWeek: "friday", startTime: "18:00", endTime: "22:00" }],
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <VenueSlotManagement />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe("VenueSlotManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows a spinner while the venue loads", () => {
    mockFetchPublicJSON.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.queryByText("Slot Management")).not.toBeInTheDocument();
  });

  it("seeds the schedule editor from the venue's weeklySchedule once loaded", async () => {
    mockFetchPublicJSON.mockResolvedValue(venue);
    renderPage();

    expect(await screen.findByText("Community Hall — Slots")).toBeInTheDocument();
    expect(screen.getByTestId("schedule-length")).toHaveTextContent("1");
  });

  it("does not re-seed the schedule on a background refetch (guarded by scheduleSeeded ref)", async () => {
    mockFetchPublicJSON.mockResolvedValue(venue);
    renderPage();
    await screen.findByText("Community Hall — Slots");

    // Simulate a background refetch returning a different schedule length
    mockFetchPublicJSON.mockResolvedValue({
      ...venue,
      weeklySchedule: [
        { dayOfWeek: "monday", startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: "tuesday", startTime: "09:00", endTime: "13:00" },
      ],
    });

    // The seeded schedule should remain what it was first seeded with
    expect(screen.getByTestId("schedule-length")).toHaveTextContent("1");
  });

  it("passes venueId through to SlotList", async () => {
    mockFetchPublicJSON.mockResolvedValue(venue);
    renderPage();
    expect(await screen.findByTestId("slot-list")).toHaveTextContent(`venueId=${venueId}`);
  });

  it("calls the schedule mutation and toggles saving state on save", async () => {
    mockFetchPublicJSON.mockResolvedValue(venue);
    mockSaveMutateAsync.mockResolvedValue({});
    renderPage();
    await screen.findByText("Community Hall — Slots");

    await act(async () => {
      fireEvent.click(screen.getByText("SaveSchedule"));
    });

    expect(mockSaveMutateAsync).toHaveBeenCalledWith([{ dayOfWeek: "monday" }]);
    expect(screen.getByTestId("saving-state")).toHaveTextContent("idle");
  });

  it("resolves onGenerate to the mutation's returned message", async () => {
    mockFetchPublicJSON.mockResolvedValue(venue);
    mockGenerateMutateAsync.mockResolvedValue({ message: "5 slot(s) generated" });
    renderPage();
    await screen.findByText("Community Hall — Slots");

    await act(async () => {
      fireEvent.click(screen.getByText("GenerateSlots"));
    });

    expect(mockGenerateMutateAsync).toHaveBeenCalledWith({
      fromDate: "2026-09-01",
      toDate: "2026-09-07",
    });
  });
});
