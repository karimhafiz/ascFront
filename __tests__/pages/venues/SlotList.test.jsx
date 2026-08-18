import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SlotList from "../../../src/pages/venues/venueSlots/SlotList";
import "@testing-library/jest-dom";

const mockFetchWithAuth = jest.fn();
jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

const mockCreateMutateAsync = jest.fn();
const mockDeleteMutateAsync = jest.fn();
jest.mock("../../../src/hooks/useVenueMutation", () => ({
  useVenueSlotCreateMutation: jest.fn(() => ({ mutateAsync: mockCreateMutateAsync })),
  useVenueSlotDeleteMutation: jest.fn(() => ({ mutateAsync: mockDeleteMutateAsync })),
}));

const venueId = "a".repeat(24);

const availableSlot = {
  _id: "slot1",
  date: "2026-09-05T00:00:00.000Z",
  startTime: "18:00",
  endTime: "22:00",
  isAvailable: true,
  source: "manual",
};
const bookedSlot = {
  _id: "slot2",
  date: "2026-09-06T00:00:00.000Z",
  startTime: "10:00",
  endTime: "14:00",
  isAvailable: false,
  source: "schedule",
};

function mockFetchOk(data) {
  mockFetchWithAuth.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function renderList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SlotList venueId={venueId} />
    </QueryClientProvider>
  );
}

describe("SlotList", () => {
  const originalAlert = window.alert;

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  afterAll(() => {
    window.alert = originalAlert;
  });

  it("shows a spinner while slots load", () => {
    mockFetchWithAuth.mockReturnValue(new Promise(() => {}));
    renderList();
    expect(screen.queryByText("No slots for this week.")).not.toBeInTheDocument();
  });

  it("shows the empty state when there are no slots", async () => {
    mockFetchOk([]);
    renderList();
    expect(await screen.findByText("No slots for this week.")).toBeInTheDocument();
  });

  it("renders slots with a Delete button only for available ones", async () => {
    mockFetchOk([availableSlot, bookedSlot]);
    renderList();

    expect(await screen.findByText("18:00 — 22:00")).toBeInTheDocument();
    expect(screen.getByText("10:00 — 14:00")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Booked")).toBeInTheDocument();
    expect(screen.getByText("recurring")).toBeInTheDocument(); // schedule-sourced slot
    expect(screen.getAllByText("Delete")).toHaveLength(1); // only the available slot
  });

  it("rejects adding a one-off slot when end time is not after start time", async () => {
    mockFetchOk([]);
    renderList();
    await screen.findByText("No slots for this week.");

    fireEvent.change(screen.getByLabelText("Date *"), { target: { value: "2026-09-10" } });
    fireEvent.change(screen.getByLabelText("Start *"), { target: { value: "18:00" } });
    fireEvent.change(screen.getByLabelText("End"), { target: { value: "17:00" } });

    fireEvent.click(screen.getByText("Add Slot"));

    expect(await screen.findByText("End time must be after start time.")).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("submits a valid one-off slot and clears the form on success", async () => {
    mockFetchOk([]);
    mockCreateMutateAsync.mockResolvedValue({});
    renderList();
    await screen.findByText("No slots for this week.");

    fireEvent.change(screen.getByLabelText("Date *"), { target: { value: "2026-09-10" } });
    fireEvent.change(screen.getByLabelText("Start *"), { target: { value: "18:00" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Slot"));
    });

    expect(mockCreateMutateAsync).toHaveBeenCalledWith({
      date: "2026-09-10",
      startTime: "18:00",
    });
    expect(screen.getByLabelText("Date *").value).toBe("");
  });

  it("shows the mutation's error message inline when creating a slot fails", async () => {
    mockFetchOk([]);
    mockCreateMutateAsync.mockRejectedValue(new Error("Slot already exists"));
    renderList();
    await screen.findByText("No slots for this week.");

    fireEvent.change(screen.getByLabelText("Date *"), { target: { value: "2026-09-10" } });
    fireEvent.change(screen.getByLabelText("Start *"), { target: { value: "18:00" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Add Slot"));
    });

    expect(await screen.findByText("Slot already exists")).toBeInTheDocument();
  });

  it("deletes a slot and alerts on failure instead of crashing", async () => {
    mockFetchOk([availableSlot]);
    mockDeleteMutateAsync.mockRejectedValue(new Error("Cannot delete slot with active bookings."));
    renderList();

    const deleteButton = await screen.findByText("Delete");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockDeleteMutateAsync).toHaveBeenCalledWith("slot1");
    expect(window.alert).toHaveBeenCalledWith("Cannot delete slot with active bookings.");
  });

  it("requests a new week range when Prev/Next is clicked", async () => {
    mockFetchOk([]);
    renderList();
    await screen.findByText("No slots for this week.");

    const firstCallUrl = mockFetchWithAuth.mock.calls[0][0];
    mockFetchWithAuth.mockClear();
    mockFetchOk([]);

    fireEvent.click(screen.getByText("Next →"));

    await act(async () => {});
    expect(mockFetchWithAuth).toHaveBeenCalled();
    const nextCallUrl = mockFetchWithAuth.mock.calls[0][0];
    expect(nextCallUrl).not.toBe(firstCallUrl);
  });
});
