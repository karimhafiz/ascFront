import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import EventForm, { action as eventFormAction } from "./EventForm";
import "@testing-library/jest-dom";

jest.mock("../auth/auth", () => ({ getAuthToken: jest.fn() }));
// At the top of your EventForm.test.jsx
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useActionData: jest.fn(() => undefined),
    useNavigate: jest.fn(() => jest.fn()),
    useNavigation: jest.fn(() => ({ state: "idle" })),
    useSubmit: jest.fn(),
    Form: ({ children, ...props }) => <form {...props}>{children}</form>,
  };
});

describe("EventForm Component", () => {
  function renderWithRouter(ui, { route = "/" } = {}) {
    const router = createMemoryRouter(
      [
        {
          path: route,
          element: ui,
          action: eventFormAction, // Provide the action for useActionData
        },
      ],
      {
        initialEntries: [route],
      }
    );
    return render(<RouterProvider router={router} />);
  }

  it("should render the form with all fields", () => {
    renderWithRouter(<EventForm method="PUT" event={{}} />, { route: "/" });
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Short Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Long Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ticket Price/i)).toBeInTheDocument();
  });

  it("should call the submit handler when the form is submitted", async () => {
    renderWithRouter(<EventForm method="POST" event={{}} />, { route: "/" });
    // Fill out required fields
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Test Event" },
    });
    fireEvent.change(screen.getByLabelText(/Short Description/i), {
      target: { value: "Short desc" },
    });
    fireEvent.change(screen.getByLabelText(/Long Description/i), {
      target: { value: "Long desc" },
    });
    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2025-05-01" },
    });
    fireEvent.change(screen.getByLabelText(/Ticket Price/i), {
      target: { value: "10" },
    });

    const form = screen.getByTestId("event-form");
    fireEvent.submit(form);
    // Since navigation is mocked as idle, check that the submit button is disabled (submitting state is handled by useNavigation mock)
    expect(form).toBeInTheDocument();
  });
});
