import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import TeamEditForm from "../../../src/components/teams/TeamEditForm";

jest.mock("../../../src/hooks/useTeamMutation", () => ({
  useTeamEditMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

const { useTeamEditMutation } = require("../../../src/hooks/useTeamMutation");

const team = {
  _id: "team1",
  name: "Falcons",
  manager: { name: "Jane Doe", email: "jane@test.com", phone: "07123456789" },
};

describe("TeamEditForm", () => {
  beforeEach(() => {
    useTeamEditMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it("seeds inputs from the team prop", () => {
    render(<TeamEditForm team={team} onClose={jest.fn()} onSaved={jest.fn()} />);
    expect(screen.getByDisplayValue("Falcons")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("07123456789")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jane@test.com")).toBeDisabled();
  });

  it("blocks submit and shows an error for an invalid phone number", () => {
    const mutate = jest.fn();
    useTeamEditMutation.mockReturnValue({ mutate, isPending: false });
    render(<TeamEditForm team={team} onClose={jest.fn()} onSaved={jest.fn()} />);

    fireEvent.change(screen.getByDisplayValue("07123456789"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByText("Save Changes"));

    expect(screen.getByText(/valid UK phone number/i)).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("submits with trimmed phone when valid", () => {
    const mutate = jest.fn();
    useTeamEditMutation.mockReturnValue({ mutate, isPending: false });
    render(<TeamEditForm team={team} onClose={jest.fn()} onSaved={jest.fn()} />);

    fireEvent.change(screen.getByDisplayValue("Falcons"), { target: { value: "Eagles" } });
    fireEvent.click(screen.getByText("Save Changes"));

    expect(mutate).toHaveBeenCalledWith(
      {
        name: "Eagles",
        manager: { name: "Jane Doe", email: "jane@test.com", phone: "07123456789" },
      },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it("calls onSaved with the returned team on successful save", () => {
    const onSaved = jest.fn();
    let capturedOnSuccess;
    useTeamEditMutation.mockReturnValue({
      mutate: (data, { onSuccess }) => {
        capturedOnSuccess = onSuccess;
      },
      isPending: false,
    });
    render(<TeamEditForm team={team} onClose={jest.fn()} onSaved={onSaved} />);

    fireEvent.click(screen.getByText("Save Changes"));
    act(() => capturedOnSuccess({ team: { ...team, name: "Updated" } }));

    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated" }));
  });

  it("shows a mutation error message on failed save", () => {
    let capturedOnError;
    useTeamEditMutation.mockReturnValue({
      mutate: (data, { onError }) => {
        capturedOnError = onError;
      },
      isPending: false,
    });
    render(<TeamEditForm team={team} onClose={jest.fn()} onSaved={jest.fn()} />);

    fireEvent.click(screen.getByText("Save Changes"));
    act(() => capturedOnError(new Error("Team name already taken")));

    expect(screen.getByText("Team name already taken")).toBeInTheDocument();
  });

  it("shows a saving state and disables the button while pending", () => {
    useTeamEditMutation.mockReturnValue({ mutate: jest.fn(), isPending: true });
    render(<TeamEditForm team={team} onClose={jest.fn()} onSaved={jest.fn()} />);

    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.getByText("Saving...").closest("button")).toBeDisabled();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn();
    render(<TeamEditForm team={team} onClose={onClose} onSaved={jest.fn()} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
