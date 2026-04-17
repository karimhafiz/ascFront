import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CoursesTab from "../../../src/components/admin/CoursesTab";
import "@testing-library/jest-dom";

// Mock window.open for print
window.open = jest.fn(() => ({
  document: { write: jest.fn(), close: jest.fn() },
}));

const enrollments = [
  {
    _id: "e1",
    buyerEmail: "student@test.com",
    buyerPhone: "07111222333",
    status: "paid",
    createdAt: "2026-03-10T10:00:00Z",
    courseId: { title: "Yoga 101" },
    participants: [{ name: "Jane", email: "jane@test.com" }],
  },
  {
    _id: "e2",
    buyerEmail: "learner@test.com",
    buyerPhone: "07444555666",
    status: "pending",
    createdAt: "2026-03-12T10:00:00Z",
    courseId: { title: "Swimming" },
    participants: [],
  },
];

const courses = [
  {
    _id: "c1",
    title: "Yoga 101",
    instructor: "Sarah",
    category: "Fitness",
    price: 30,
    currentEnrollment: 5,
    maxEnrollment: 20,
    enrollmentOpen: true,
  },
  {
    _id: "c2",
    title: "Swimming",
    instructor: "Mike",
    category: "Sports",
    price: 0,
    currentEnrollment: 12,
    maxEnrollment: null,
    enrollmentOpen: false,
  },
];

describe("CoursesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders enrollments view by default", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    expect(screen.getByText("student@test.com")).toBeInTheDocument();
    expect(screen.getByText("Yoga 101")).toBeInTheDocument();
  });

  it("shows enrollment status badges", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows 'No enrollments found' when empty", () => {
    render(<CoursesTab enrollments={[]} courses={courses} />);
    expect(screen.getByText("No enrollments found")).toBeInTheDocument();
  });

  it("switches to courses view", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("courses"));
    expect(screen.getByText("Sarah")).toBeInTheDocument();
    expect(screen.getByText("Mike")).toBeInTheDocument();
  });

  it("shows course enrollment status", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("courses"));
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("shows 'Free' for zero-price courses", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("courses"));
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("filters enrollments by search", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "student" },
    });
    expect(screen.getByText("student@test.com")).toBeInTheDocument();
    expect(screen.queryByText("learner@test.com")).not.toBeInTheDocument();
  });

  it("has a print button on enrollment rows", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    const printBtns = screen.getAllByTitle("Print enrollment");
    expect(printBtns.length).toBe(2);
    fireEvent.click(printBtns[0]);
    expect(window.open).toHaveBeenCalledWith("", "_blank");
  });
});
