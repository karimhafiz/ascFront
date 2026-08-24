import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ScheduleEditor from "../../../src/pages/venues/venueSlots/ScheduleEditor";
import "@testing-library/jest-dom";

function renderEditor(props = {}) {
  const defaultProps = {
    schedule: [{ dayOfWeek: "monday", startTime: "09:00", endTime: "13:00" }],
    setSchedule: jest.fn(),
    onSave: jest.fn(),
    saving: false,
    onGenerate: jest.fn(),
    ...props,
  };
  return render(<ScheduleEditor {...defaultProps} />);
}

async function submitGenerateForm() {
  fireEvent.change(screen.getByLabelText("From *"), { target: { value: "2026-09-01" } });
  fireEvent.change(screen.getByLabelText("To *"), { target: { value: "2026-09-08" } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Generate Slots" }));
  });
}

describe("ScheduleEditor — slot generation horizon", () => {
  it("states the general rule when there are no generated slots, without any state/tracking claim", () => {
    renderEditor({ slotHorizon: null });
    expect(
      screen.getByText(/A venue with no generated slots can't be booked/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/right now/i)).not.toBeInTheDocument();
  });

  it("shows the generated-through date when the horizon is comfortably in the future", () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 30);
    renderEditor({ slotHorizon: farFuture.toISOString() });

    expect(screen.getByText(/Slots generated through/i)).toBeInTheDocument();
    expect(screen.queryByText(/generate more soon/i)).not.toBeInTheDocument();
  });

  it("shows an urgent warning when the horizon is within a week", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    renderEditor({ slotHorizon: soon.toISOString() });

    expect(screen.getByText(/generate more soon/i)).toBeInTheDocument();
  });

  it("always states that generation is the admin/moderator's responsibility", () => {
    renderEditor({ slotHorizon: null });
    expect(screen.getByText(/admin\/moderator's responsibility/i)).toBeInTheDocument();
  });
});

describe("ScheduleEditor — Generate Slots result messaging", () => {
  it("shows a clean success in green when nothing was skipped", async () => {
    const onGenerate = jest.fn().mockResolvedValue("6 slot(s) generated");
    renderEditor({ onGenerate });

    await submitGenerateForm();

    const message = await screen.findByText("6 slot(s) generated");
    expect(message).toHaveClass("text-green-600");
  });

  it("flags a partial result in amber when some slots were skipped as occupied", async () => {
    const onGenerate = jest
      .fn()
      .mockResolvedValue("4 slot(s) generated (2 skipped — already occupied)");
    renderEditor({ onGenerate });

    await submitGenerateForm();

    const message = await screen.findByText("4 slot(s) generated (2 skipped — already occupied)");
    expect(message).toHaveClass("text-amber-600");
  });

  it("shows the backend's error when every matching slot is already occupied", async () => {
    const onGenerate = jest
      .fn()
      .mockRejectedValue(
        new Error("All 3 matching slot(s) in this range are already occupied — nothing generated.")
      );
    renderEditor({ onGenerate });

    await submitGenerateForm();

    expect(
      await screen.findByText(
        "All 3 matching slot(s) in this range are already occupied — nothing generated."
      )
    ).toBeInTheDocument();
  });
});
