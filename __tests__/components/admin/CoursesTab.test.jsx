import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CoursesTab from "../../../src/components/admin/CoursesTab";
import "@testing-library/jest-dom";

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
    courseId: { _id: "c1", title: "Yoga 101", instructor: "Sarah", category: "Fitness", price: 30 },
  },
  {
    _id: "e2",
    buyerEmail: "learner@test.com",
    buyerPhone: "07444555666",
    status: "pending",
    createdAt: "2026-03-12T10:00:00Z",
    courseId: { _id: "c2", title: "Swimming", instructor: "Mike", category: "Sports", price: 0 },
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

  it("renders enrollments grouped by course by default", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    expect(screen.getByText("Yoga 101")).toBeInTheDocument();
    expect(screen.getByText("Swimming")).toBeInTheDocument();
  });

  it("shows enrollment count per course group", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    expect(screen.getAllByText("1 enrollment").length).toBe(2);
  });

  it("course groups start collapsed", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    expect(screen.queryByText("student@test.com")).not.toBeInTheDocument();
  });

  it("expands course group to show enrollments", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("Yoga 101"));
    expect(screen.getByText("student@test.com")).toBeInTheDocument();
  });

  it("shows enrollment status badges when expanded", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("Yoga 101"));
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("shows 'No enrollments found' when empty", () => {
    render(<CoursesTab enrollments={[]} courses={courses} />);
    expect(screen.getByText("No enrollments found")).toBeInTheDocument();
  });

  it("switches to ungrouped view and shows flat table", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("Ungrouped"));
    expect(screen.getAllByText("student@test.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("learner@test.com").length).toBeGreaterThanOrEqual(1);
  });

  it("switches to courses view", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("Courses"));
    expect(screen.getByText("Sarah")).toBeInTheDocument();
    expect(screen.getByText("Mike")).toBeInTheDocument();
  });

  it("shows course enrollment status in courses view", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("Courses"));
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("shows 'Free' for zero-price courses", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("Courses"));
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("filters enrollments by search", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "student" },
    });
    // Only the Yoga 101 group should remain (student@test.com matches)
    expect(screen.getByText("Yoga 101")).toBeInTheDocument();
    expect(screen.queryByText("Swimming")).not.toBeInTheDocument();
  });

  it("has a print button when enrollment group is expanded", () => {
    render(<CoursesTab enrollments={enrollments} courses={courses} />);
    fireEvent.click(screen.getByText("Yoga 101"));
    const printBtn = screen.getByTitle("Print enrollment");
    fireEvent.click(printBtn);
    expect(window.open).toHaveBeenCalledWith("", "_blank");
  });
});
