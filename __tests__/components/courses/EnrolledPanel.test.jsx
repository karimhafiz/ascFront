import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EnrolledPanel from "../../../src/components/courses/EnrolledPanel";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  fetchWithAuth: jest.fn(),
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

describe("EnrolledPanel — Phone display", () => {
  it("displays the phone number with an Edit in Profile link", () => {
    renderPanel();
    expect(screen.getByText("07123456789")).toBeInTheDocument();
    const link = screen.getByText("Edit in Profile");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/profile");
  });

  it("does not show phone section when buyerPhone is absent", () => {
    renderPanel({ enrollment: { ...baseEnrollment, buyerPhone: "" } });
    expect(screen.queryByText("Phone")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit in Profile")).not.toBeInTheDocument();
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
