import React from "react";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import "@testing-library/jest-dom";
import ErrorPage from "../../src/pages/Errorpage";

function renderWithRouteError(loader) {
  const router = createMemoryRouter([{ path: "/", loader, errorElement: <ErrorPage /> }], {
    initialEntries: ["/"],
  });
  return render(<RouterProvider router={router} />);
}

describe("ErrorPage", () => {
  it("shows the thrown error's message via useRouteError, not props", async () => {
    renderWithRouteError(() => {
      throw new Error("Something specific broke");
    });

    expect(await screen.findByText("Something specific broke")).toBeInTheDocument();
  });

  it("shows the status and status text for a thrown Response", async () => {
    renderWithRouteError(() => {
      throw new Response("Not Found", { status: 404, statusText: "Not Found" });
    });

    expect(await screen.findByText("404 Not Found")).toBeInTheDocument();
  });
});
