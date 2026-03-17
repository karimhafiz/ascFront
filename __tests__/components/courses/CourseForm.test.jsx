import React from "react";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import CourseForm from "../../../src/components/courses/CourseForm";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useActionData: jest.fn(() => undefined),
    useNavigate: jest.fn(() => jest.fn()),
    useNavigation: jest.fn(() => ({ state: "idle" })),
  };
});

function renderForm(props = {}) {
  const router = createMemoryRouter(
    [{ path: "/", element: <CourseForm method="POST" course={{}} {...props} /> }],
    { initialEntries: ["/"] }
  );
  return render(<RouterProvider router={router} />);
}

describe("CourseForm", () => {
  it("should render with Create title for POST", () => {
    renderForm({ method: "POST" });
    expect(screen.getByText("Create New Course")).toBeInTheDocument();
  });

  it("should render with Edit title for PUT", () => {
    renderForm({ method: "PUT" });
    expect(screen.getByText("Edit Course")).toBeInTheDocument();
  });

  it("should render all form fields", () => {
    renderForm();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Full Description")).toBeInTheDocument();
    expect(screen.getByText("Instructor")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText(/Price/)).toBeInTheDocument();
    expect(screen.getByText("Billing Type")).toBeInTheDocument();
    expect(screen.getByText("Street")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Post Code")).toBeInTheDocument();
  });

  it("should pre-fill values from course prop", () => {
    renderForm({
      method: "PUT",
      course: {
        title: "English",
        instructor: "John",
        price: 25,
        category: "Language",
      },
    });
    expect(screen.getByDisplayValue("English")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("25")).toBeInTheDocument();
  });

  it("should have Cancel and Save buttons", () => {
    renderForm();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save Course")).toBeInTheDocument();
  });

  it("should show category options", () => {
    renderForm();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Academic")).toBeInTheDocument();
    expect(screen.getByText("Arts")).toBeInTheDocument();
  });
});
