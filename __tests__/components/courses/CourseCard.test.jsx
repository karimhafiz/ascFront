import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CourseCard from "../../../src/components/courses/CourseCard";
import "@testing-library/jest-dom";

jest.mock("../../../src/auth/auth", () => ({
  isAdmin: jest.fn(() => false),
  isModerator: jest.fn(() => false),
  getAuthToken: jest.fn(() => null),
}));

const { isAdmin, isModerator } = require("../../../src/auth/auth");

const mockCourse = {
  _id: "c1",
  title: "English Language",
  shortDescription: "Learn English basics",
  category: "Language",
  instructor: "John Doe",
  schedule: "Every Saturday 10-12",
  city: "London",
  price: 25,
  maxEnrollment: 30,
  currentEnrollment: 10,
  enrollmentOpen: true,
  images: [],
};

function renderCard(course = mockCourse) {
  return render(
    <MemoryRouter>
      <CourseCard course={course} />
    </MemoryRouter>
  );
}

describe("CourseCard", () => {
  beforeEach(() => {
    isAdmin.mockReturnValue(false);
    isModerator.mockReturnValue(false);
  });

  it("should display course title and description", () => {
    renderCard();
    expect(screen.getByText("English Language")).toBeInTheDocument();
    expect(screen.getByText("Learn English basics")).toBeInTheDocument();
  });

  it("should display price", () => {
    renderCard();
    expect(screen.getByText("£25")).toBeInTheDocument();
  });

  it("should display 'Free' for zero price", () => {
    renderCard({ ...mockCourse, price: 0 });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should display category badge", () => {
    renderCard();
    expect(screen.getByText("Language")).toBeInTheDocument();
  });

  it("should display spots left", () => {
    renderCard();
    expect(screen.getByText("20 spots left")).toBeInTheDocument();
  });

  it("should display 'Full' when no spots left", () => {
    renderCard({ ...mockCourse, currentEnrollment: 30 });
    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("should display enrollment closed badge", () => {
    renderCard({ ...mockCourse, enrollmentOpen: false });
    expect(screen.getByText("Enrollment closed")).toBeInTheDocument();
  });

  it("should display instructor", () => {
    renderCard();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should not show admin buttons for regular users", () => {
    renderCard();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("should show admin buttons for admin users", () => {
    isAdmin.mockReturnValue(true);
    renderCard();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should show admin buttons for moderators", () => {
    isModerator.mockReturnValue(true);
    renderCard();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should link to course details", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /English Language/i });
    expect(link).toHaveAttribute("href", "/courses/c1");
  });
});
