import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, GlassCard, PageContainer, Spinner } from "../../components/ui";
import { fetchWithAuth, isAuthenticated } from "../../auth/auth";

const API = import.meta.env.VITE_DEV_URI;
const DEFAULT_VENUE_ID = import.meta.env.VITE_COMMUNITY_CENTRE_VENUE_ID || "";

const INITIAL_FORM = {
  numberOfAttendees: "",
  eventName: "",
  eventDescription: "",
};

export default function VenueBooking() {
  const { venueId: routeVenueId } = useParams();
  const navigate = useNavigate();
  const venueId = routeVenueId || DEFAULT_VENUE_ID;
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const {
    data: venue,
    isLoading: venueLoading,
    error: venueError,
  } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: async () => {
      const response = await fetch(`${API}venues/${venueId}`);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load venue details.");
      }
      return data;
    },
    enabled: !!venueId,
  });

  const {
    data: slots = [],
    isLoading: slotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ["venue-slots", venueId, selectedDate],
    queryFn: async () => {
      const response = await fetch(
        `${API}venues/${venueId}/slots?date=${encodeURIComponent(selectedDate)}`
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load available slots.");
      }
      return data;
    },
    enabled: !!venueId && !!selectedDate,
  });

  const selectedSlot = slots.find((slot) => slot._id === selectedSlotId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage("Please select an available time slot before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`${API}venues/booking/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueId,
          slotId: selectedSlotId,
          numberOfAttendees: Number(formData.numberOfAttendees),
          eventName: formData.eventName,
          eventDescription: formData.eventDescription,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Failed to create checkout session.");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Checkout URL was not returned by the server.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to start venue booking checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!venueId) {
    return (
      <PageContainer className="pb-12">
        <section className="page-section pt-8">
          <GlassCard className="rounded-[2rem] p-8 text-center">
            <h1 className="mb-4 text-3xl font-semibold text-base-content">Venue Booking</h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-base-content/70">
              A venue ID is required before we can load the community centre booking page. Set
              `VITE_COMMUNITY_CENTRE_VENUE_ID` or open the route as `/venues/book/:venueId`.
            </p>
          </GlassCard>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-12">
      <Helmet>
        <title>Venue Booking | Ayendah Sazan</title>
        <meta
          name="description"
          content="View the community centre venue details, choose an available slot, and continue to secure checkout."
        />
      </Helmet>

      <section className="page-section pt-6 md:pt-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="hero-panel rounded-[2rem] p-8 sm:p-10">
              <span className="section-kicker mb-5 border-white/10 bg-white/8 text-white">
                Community Centre Hire
              </span>
              {venueLoading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <Spinner />
                </div>
              ) : venueError ? (
                <div className="rounded-2xl border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {venueError.message}
                </div>
              ) : (
                <>
                  <h1 className="mb-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                    {venue?.name || "Venue Booking"}
                  </h1>
                  <p className="mb-6 text-base leading-8 text-neutral-content/82">
                    {venue?.description ||
                      "Choose a date, review available 4-hour slots, and continue to secure checkout for your booking."}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-content/60">
                        Capacity
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {venue?.capacity ? `${venue.capacity} guests` : "TBC"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-content/60">
                        Price
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {venue?.pricePerHour ? `£${venue.pricePerHour} per slot` : "Contact us"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {venue && (
              <GlassCard className="rounded-[2rem] p-6 sm:p-8">
                <span className="section-kicker mb-4">Venue Details</span>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/50">
                      Address
                    </p>
                    <p className="mt-2 text-base leading-7 text-base-content/78">
                      {[venue.street, venue.city, venue.postCode].filter(Boolean).join(", ")}
                    </p>
                  </div>

                  {venue.amenities?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/50">
                        Amenities
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {venue.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full border border-base-300 bg-base-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-base-content/70"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {venue.rules && (
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/50">
                        Venue Rules
                      </p>
                      <p className="mt-2 text-base leading-7 text-base-content/72">{venue.rules}</p>
                    </div>
                  )}

                  {venue.cancellationPolicy && (
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/50">
                        Cancellation Policy
                      </p>
                      <p className="mt-2 text-base leading-7 text-base-content/72">
                        {venue.cancellationPolicy}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>

          <GlassCard className="rounded-[2rem] p-6 sm:p-8">
            <div className="mb-6">
              <span className="section-kicker mb-4">Booking Flow</span>
              <h2 className="mb-2 text-3xl font-semibold tracking-[-0.03em] text-base-content">
                Choose a slot and continue to checkout
              </h2>
              <p className="text-base leading-7 text-base-content/70">
                Each slot is a 4-hour booking window. You will be redirected to secure Stripe
                checkout after submitting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="glass-label" htmlFor="selectedDate">
                  Preferred Date *
                </label>
                <input
                  id="selectedDate"
                  type="date"
                  min={minDate}
                  className="glass-input"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedSlotId("");
                  }}
                  required
                />
              </div>

              <div>
                <label className="glass-label">Available Slots *</label>
                {!selectedDate ? (
                  <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-4 text-sm text-base-content/60">
                    Choose a date to see available slots.
                  </div>
                ) : slotsLoading ? (
                  <div className="flex items-center justify-center rounded-2xl border border-base-300 bg-base-100 px-4 py-8">
                    <Spinner />
                  </div>
                ) : slotsError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                    {slotsError.message}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-4 text-sm text-base-content/60">
                    No available slots were found for this date.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {slots.map((slot) => {
                      const checked = selectedSlotId === slot._id;
                      return (
                        <label
                          key={slot._id}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition-all ${
                            checked
                              ? "border-primary bg-primary/6 shadow-sm shadow-primary/10"
                              : "border-base-300 bg-white hover:border-primary/20"
                          }`}
                        >
                          <div>
                            <p className="text-base font-semibold text-base-content">
                              {slot.startTime} - {slot.endTime}
                            </p>
                            <p className="text-sm text-base-content/60">4-hour booking window</p>
                          </div>
                          <input
                            type="radio"
                            name="slot"
                            className="radio radio-primary"
                            checked={checked}
                            onChange={() => setSelectedSlotId(slot._id)}
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="glass-label" htmlFor="numberOfAttendees">
                    Number of Attendees *
                  </label>
                  <input
                    id="numberOfAttendees"
                    type="number"
                    min="1"
                    max={venue?.capacity || undefined}
                    className="glass-input"
                    value={formData.numberOfAttendees}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        numberOfAttendees: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="glass-label" htmlFor="eventName">
                    Event Name
                  </label>
                  <input
                    id="eventName"
                    type="text"
                    className="glass-input"
                    value={formData.eventName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        eventName: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="glass-label" htmlFor="eventDescription">
                  Event Description
                </label>
                <textarea
                  id="eventDescription"
                  rows="4"
                  className="glass-input"
                  placeholder="Briefly describe the purpose of your booking."
                  value={formData.eventDescription}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventDescription: event.target.value,
                    }))
                  }
                />
              </div>

              {selectedSlot && venue?.pricePerHour ? (
                <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-base-content/50">
                    Booking Summary
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-base-content/72">
                    <p>
                      <span className="font-semibold text-base-content">Slot:</span>{" "}
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </p>
                    <p>
                      <span className="font-semibold text-base-content">Price:</span> £
                      {venue.pricePerHour}
                    </p>
                  </div>
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting || venueLoading}>
                {isSubmitting ? "Redirecting to Checkout..." : "Continue to Secure Checkout"}
              </Button>

              {!isAuthenticated() && (
                <p className="text-sm leading-6 text-base-content/60">
                  You will need to{" "}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    log in
                  </Link>{" "}
                  before starting checkout.
                </p>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}
            </form>
          </GlassCard>
        </div>
      </section>
    </PageContainer>
  );
}
