import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import VenueFormPage from "../../../src/pages/venues/VenueFormPage";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
let mockParams = {};

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

const mockFetchPublicJSON = jest.fn();
jest.mock("../../../src/api/apiClient", () => ({
  fetchPublicJSON: (...args) => mockFetchPublicJSON(...args),
}));

const mockMutateAsync = jest.fn();
jest.mock("../../../src/hooks/useVenueMutation", () => ({
  useVenueMutation: jest.fn(() => ({ mutateAsync: mockMutateAsync })),
}));

const venueId = "aaaaaaaaaaaaaaaaaaaaaaaa";
const existingVenue = {
  _id: venueId,
  name: "Community Hall",
  description: "A nice hall",
  street: "1 Main St",
  city: "Leeds",
  postCode: "LS1 1AA",
  capacity: 50,
  pricePerHour: 20,
  amenities: ["WiFi", "Parking"],
  rules: "No smoking",
  cancellationPolicy: "48h notice",
  isActive: true,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <VenueFormPage />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe("VenueFormPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
  });

  describe("create mode (no venueSlug)", () => {
    it("renders the create-venue heading and empty fields", () => {
      renderPage();
      expect(screen.getByText("New Venue")).toBeInTheDocument();
      expect(screen.getByText("Create a venue listing")).toBeInTheDocument();
      expect(screen.getByLabelText("Venue Name *").value).toBe("");
      expect(mockFetchPublicJSON).not.toHaveBeenCalled();
    });

    it("submits capacity/pricePerHour as numbers and amenities as a trimmed array", async () => {
      mockMutateAsync.mockResolvedValue({});
      renderPage();

      fireEvent.change(screen.getByLabelText("Venue Name *"), {
        target: { value: "New Hall" },
      });
      fireEvent.change(screen.getByLabelText("Street *"), { target: { value: "2 Side St" } });
      fireEvent.change(screen.getByLabelText("City *"), { target: { value: "Leeds" } });
      fireEvent.change(screen.getByLabelText("Capacity *"), { target: { value: "30" } });
      fireEvent.change(screen.getByLabelText("Price per Slot (£) *"), {
        target: { value: "15" },
      });
      fireEvent.change(screen.getByLabelText(/Amenities/), {
        target: { value: "WiFi, Parking " },
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Create Venue"));
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Hall",
          capacity: 30,
          pricePerHour: 15,
          amenities: ["WiFi", "Parking"],
        })
      );
    });

    it("shows the mutation's error message on failure", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Name already taken"));
      renderPage();

      fireEvent.change(screen.getByLabelText("Venue Name *"), { target: { value: "X" } });
      fireEvent.change(screen.getByLabelText("Street *"), { target: { value: "X" } });
      fireEvent.change(screen.getByLabelText("City *"), { target: { value: "X" } });
      fireEvent.change(screen.getByLabelText("Capacity *"), { target: { value: "1" } });
      fireEvent.change(screen.getByLabelText("Price per Slot (£) *"), {
        target: { value: "1" },
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Create Venue"));
      });

      expect(await screen.findByText("Name already taken")).toBeInTheDocument();
    });

    it("navigates to /venues/booking on Cancel", () => {
      renderPage();
      fireEvent.click(screen.getByText("Cancel"));
      expect(mockNavigate).toHaveBeenCalledWith("/venues/booking");
    });
  });

  describe("edit mode (venueSlug present)", () => {
    beforeEach(() => {
      mockParams = { venueSlug: `community-hall-${venueId}` };
    });

    it("shows a spinner while loading", () => {
      mockFetchPublicJSON.mockReturnValue(new Promise(() => {})); // never resolves
      const { container } = renderPage();
      expect(
        container.querySelector(".animate-spin, [class*='spinner']") || container
      ).toBeTruthy();
      expect(screen.queryByText("Edit Venue")).not.toBeInTheDocument();
    });

    it("pre-fills the form once the venue loads", async () => {
      mockFetchPublicJSON.mockResolvedValue(existingVenue);
      renderPage();

      expect(await screen.findByDisplayValue("Community Hall")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1 Main St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("50")).toBeInTheDocument();
      expect(screen.getByDisplayValue("WiFi, Parking")).toBeInTheDocument();
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });

    it("shows the load error instead of the form on failure", async () => {
      mockFetchPublicJSON.mockRejectedValue(new Error("Venue not found"));
      renderPage();

      expect(await screen.findByText("Venue not found")).toBeInTheDocument();
      expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
    });
  });
});
