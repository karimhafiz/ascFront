import React from "react";
import { render, screen } from "@testing-library/react";
import ScheduleEditor from "../../../src/pages/venues/venueSlots/ScheduleEditor";
import "@testing-library/jest-dom";

function renderEditor(props = {}) {
  const defaultProps = {
    schedule: [],
    setSchedule: jest.fn(),
    onSave: jest.fn(),
    saving: false,
    onGenerate: jest.fn(),
    ...props,
  };
  return render(<ScheduleEditor {...defaultProps} />);
}

describe("ScheduleEditor — slot generation horizon", () => {
  it("warns when no slots have been generated yet", () => {
    renderEditor({ slotHorizon: null });
    expect(screen.getByText(/No slots generated yet/i)).toBeInTheDocument();
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
