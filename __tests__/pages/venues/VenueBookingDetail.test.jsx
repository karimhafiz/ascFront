import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import VenueBookingDetail from "../../../src/pages/venues/VenueBookingDetail";
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

let mockLoggedIn = true;
let mockVerified = true;
jest.mock("../../../src/auth/auth", () => ({
  isAuthenticated: () => mockLoggedIn,
  isVerified: () => mockVerified,
  getAuthToken: () => "fake.jwt.token",
  parseJwt: () => ({ email: "user@test.com" }),
}));

const mockFetchPublicJSON = jest.fn();
jest.mock("../../../src/api/apiClient", () => ({
  fetchPublicJSON: (...args) => mockFetchPublicJSON(...args),
}));

const mockCheckoutMutateAsync = jest.fn();
jest.mock("../../../src/hooks/useVenueMutation", () => ({
  useVenueBookingCheckoutMutation: jest.fn(() => ({ mutateAsync: mockCheckoutMutateAsync })),
}));

// VenueCalendar has its own date-grid/query logic — stub it to a single
// button that fires onSelectDate, so this suite stays scoped to
// VenueBookingDetail's own responsibility (venue/slot rendering, form
// validation, checkout submission).
jest.mock("../../../src/pages/venues/VenueCalendar", () => (props) => (
  <button onClick={() => props.onSelectDate("2026-09-10")}>PickDate</button>
));

const venueId = "a".repeat(24);
const venueSlug = `community-hall-${venueId}`;

const venue = {
  _id: venueId,
  name: "Community Hall",
  description: "A nice hall",
  capacity: 50,
  pricePerHour: 20,
  street: "1 Main St",
  city: "Leeds",
  postCode: "LS1 1AA",
  amenities: ["WiFi"],
  rules: "No smoking",
  cancellationPolicy: "48h notice",
};

const availableSlot = { _id: "slot1", startTime: "18:00", endTime: "22:00", isAvailable: true };

function mockLoadedVenueAndSlots(slots = [availableSlot]) {
  mockFetchPublicJSON.mockImplementation((url) => {
    if (url.includes("/slots")) return Promise.resolve(slots);
    return Promise.resolve(venue);
  });
}

// Fires the form's submit event directly rather than clicking the submit
// button — more reliable than click-to-submit delegation in this render
// tree, and it's the form's onSubmit logic under test here, not native
// button/form wiring.
function submitBookingForm() {
  fireEvent.submit(screen.getByText("Continue to Secure Checkout").closest("form"));
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <VenueBookingDetail />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe("VenueBookingDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { venueSlug };
    mockLoggedIn = true;
    mockVerified = true;
  });

  it("shows a spinner while the venue loads", () => {
    mockFetchPublicJSON.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.queryByText("Community Hall")).not.toBeInTheDocument();
  });

  it("shows the venue load error instead of the form", async () => {
    mockFetchPublicJSON.mockRejectedValue(new Error("Venue not found"));
    renderPage();
    expect(await screen.findByText("Venue not found")).toBeInTheDocument();
  });

  it("renders venue details once loaded", async () => {
    mockLoadedVenueAndSlots();
    renderPage();

    expect(await screen.findByText("Community Hall")).toBeInTheDocument();
    expect(screen.getByText("50 guests")).toBeInTheDocument();
    expect(screen.getByText("£20 per slot")).toBeInTheDocument();
    expect(screen.getByText("WiFi")).toBeInTheDocument();
    expect(screen.getByText("No smoking")).toBeInTheDocument();
  });

  it("shows the login prompt when not authenticated", async () => {
    mockLoggedIn = false;
    mockLoadedVenueAndSlots();
    renderPage();

    await screen.findByText("Community Hall");
    expect(screen.getByText(/before starting checkout/)).toBeInTheDocument();
  });

  it("loads and renders slots once a date is picked, showing the booking summary", async () => {
    mockLoadedVenueAndSlots();
    renderPage();
    await screen.findByText("Community Hall");

    fireEvent.click(screen.getByText("PickDate"));

    expect(await screen.findByText("18:00 – 22:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio"));

    expect(screen.getByText("Booking Summary")).toBeInTheDocument();
    expect(screen.getByText("18:00 - 22:00")).toBeInTheDocument();
  });

  it("shows an empty-slots message when the date has none", async () => {
    mockLoadedVenueAndSlots([]);
    renderPage();
    await screen.findByText("Community Hall");

    fireEvent.click(screen.getByText("PickDate"));
    expect(
      await screen.findByText("No available slots were found for this date.")
    ).toBeInTheDocument();
  });

  it("blocks submission behind a verify-email notice when authenticated but unverified", async () => {
    mockVerified = false;
    mockLoadedVenueAndSlots();
    renderPage();
    await screen.findByText("Community Hall");

    expect(screen.getByText("Verify your email to book a venue")).toBeInTheDocument();
    expect(screen.getByText("Continue to Secure Checkout").closest("button")).toBeDisabled();

    await act(async () => {
      submitBookingForm();
    });
    expect(mockCheckoutMutateAsync).not.toHaveBeenCalled();
  });

  it("redirects to login instead of submitting when not authenticated", async () => {
    mockLoggedIn = false;
    mockLoadedVenueAndSlots();
    renderPage();
    await screen.findByText("Community Hall");

    await act(async () => {
      submitBookingForm();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(mockCheckoutMutateAsync).not.toHaveBeenCalled();
  });

  it("requires a slot to be selected before submitting", async () => {
    mockLoadedVenueAndSlots();
    renderPage();
    await screen.findByText("Community Hall");

    fireEvent.change(screen.getByLabelText("Number of Attendees *"), {
      target: { value: "5" },
    });
    submitBookingForm();

    expect(
      await screen.findByText("Please select an available time slot before continuing.")
    ).toBeInTheDocument();
    expect(mockCheckoutMutateAsync).not.toHaveBeenCalled();
  });

  it("submits the checkout payload and redirects to the returned URL", async () => {
    mockLoadedVenueAndSlots();
    mockCheckoutMutateAsync.mockResolvedValue({ url: "https://checkout.stripe.com/session" });
    delete window.location;
    window.location = { href: "" };

    renderPage();
    await screen.findByText("Community Hall");

    fireEvent.click(screen.getByText("PickDate"));
    await screen.findByText("18:00 – 22:00");
    fireEvent.click(screen.getByRole("radio"));
    fireEvent.change(screen.getByLabelText("Number of Attendees *"), {
      target: { value: "5" },
    });

    await act(async () => {
      submitBookingForm();
    });

    expect(mockCheckoutMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ venueId, slotId: "slot1", numberOfAttendees: 5 })
    );
    expect(window.location.href).toBe("https://checkout.stripe.com/session");
  });

  it("shows the Stripe-down message for a 502 checkout failure", async () => {
    mockLoadedVenueAndSlots();
    const stripeDownError = new Error("Stripe unavailable");
    stripeDownError.status = 502;
    mockCheckoutMutateAsync.mockRejectedValue(stripeDownError);

    renderPage();
    await screen.findByText("Community Hall");

    fireEvent.click(screen.getByText("PickDate"));
    await screen.findByText("18:00 – 22:00");
    fireEvent.click(screen.getByRole("radio"));
    fireEvent.change(screen.getByLabelText("Number of Attendees *"), {
      target: { value: "5" },
    });

    await act(async () => {
      submitBookingForm();
    });

    expect(
      await screen.findByText(
        "Payment provider is temporarily unavailable. Please try again in a few minutes."
      )
    ).toBeInTheDocument();
  });
});
