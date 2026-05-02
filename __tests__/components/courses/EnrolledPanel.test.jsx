import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EnrolledPanel from "../../../src/components/courses/EnrolledPanel";
import "@testing-library/jest-dom";

const mockFetchWithAuth = jest.fn();

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

const baseCourse = {
  _id: "c1",
  title: "Test Course",
  price: 10,
  isSubscription: false,
};

const baseEnrollment = {
  _id: "e1",
  status: "paid",
  buyerPhone: "07123456789",
  buyerEmail: "test@example.com",
  participants: [{ _id: "p1", name: "Alice", age: 25 }],
};

function renderPanel(props = {}) {
  const defaultProps = {
    course: baseCourse,
    enrollment: baseEnrollment,
    onChanged: jest.fn(),
    ...props,
  };
  return render(
    <MemoryRouter>
      <EnrolledPanel {...defaultProps} />
    </MemoryRouter>
  );
}

describe("EnrolledPanel — Phone editing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays the phone number with an Edit button", () => {
    renderPanel();
    expect(screen.getByText("07123456789")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("does not show phone section when buyerPhone is absent", () => {
    renderPanel({ enrollment: { ...baseEnrollment, buyerPhone: "" } });
    expect(screen.queryByText("Phone")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("shows input field when Edit is clicked", () => {
    renderPanel();
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByPlaceholderText("Phone (07...)")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("cancels editing and restores original value", () => {
    renderPanel();
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByPlaceholderText("Phone (07...)");
    fireEvent.change(input, { target: { value: "07999999999" } });
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("07123456789")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Phone (07...)")).not.toBeInTheDocument();
  });

  it("shows error for empty phone", async () => {
    renderPanel();
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByPlaceholderText("Phone (07...)");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
  });

  it("shows error for invalid UK phone", async () => {
    renderPanel();
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByPlaceholderText("Phone (07...)");
    fireEvent.change(input, { target: { value: "12345" } });
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Please enter a valid UK phone number.")).toBeInTheDocument();
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
  });

  it("saves valid phone and calls onChanged", async () => {
    const onChanged = jest.fn();
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          message: "Enrollment updated successfully.",
          enrollment: { ...baseEnrollment, buyerPhone: "07999888777" },
        }),
    });

    renderPanel({ onChanged });
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByPlaceholderText("Phone (07...)");
    fireEvent.change(input, { target: { value: "07999888777" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining("courses/enrollments/e1"),
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyerPhone: "07999888777" }),
        })
      );
    });
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("shows backend error message on failure", async () => {
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Something went wrong" }),
    });

    renderPanel();
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByPlaceholderText("Phone (07...)");
    fireEvent.change(input, { target: { value: "07111222333" } });
    fireEvent.click(screen.getByText("Save"));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});

describe("EnrolledPanel — General display", () => {
  it("shows enrolled status and participants", () => {
    renderPanel();
    expect(screen.getByText("You're Enrolled")).toBeInTheDocument();
    expect(screen.getByText("Enrolled")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("(25)")).toBeInTheDocument();
  });

  it("shows Add Participant button for active enrollment", () => {
    renderPanel();
    expect(screen.getByText("Add Participant")).toBeInTheDocument();
  });

  it("hides Add Participant for cancelled subscription", () => {
    renderPanel({
      enrollment: { ...baseEnrollment, subscriptionStatus: "cancelled", subscriptionId: "sub_1" },
    });
    expect(screen.queryByText("Add Participant")).not.toBeInTheDocument();
  });
});
