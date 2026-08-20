import React from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaBuilding, FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { Button, GlassCard, PageContainer, Spinner } from "../../components/ui";
import { fetchWithAuth } from "../../auth/auth";
import { queryKeys } from "../../api/queryKeys";

const API = import.meta.env.VITE_DEV_URI;

export default function VenueBookingConfirmation() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.venues.booking(bookingId),
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}venues/booking/${bookingId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to load booking details.");
      return data;
    },
    enabled: Boolean(bookingId),
  });

  const venue = booking?.venue;
  const slot = booking?.slot;

  const slotDate = slot?.date
    ? new Date(slot.date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  if (!bookingId || error) {
    return (
      <PageContainer center>
        <GlassCard className="max-w-md w-full p-8 text-center">
          <p className="text-red-600 mb-4">{error?.message || "Booking ID not found."}</p>
          <Button variant="primary" to="/venues/booking">
            Browse Venues
          </Button>
        </GlassCard>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-base-content/70">Loading booking details...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Booking Confirmed | Ayendah Sazan</title>
      </Helmet>

      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-base-content">Booking Confirmed!</h1>
          <p className="text-base-content/70 mt-2">
            Your venue has been reserved and payment received. A confirmation email is on its way.
          </p>
        </div>

        <div className="space-y-4">
          {/* Venue & slot details */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FaBuilding className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-base-content">Booking Details</h2>
            </div>
            <div className="space-y-2 text-sm text-base-content/70">
              {venue?.name && (
                <p>
                  <span className="font-semibold text-base-content">Venue:</span> {venue.name}
                </p>
              )}
              {[venue?.street, venue?.city, venue?.postCode].filter(Boolean).length > 0 && (
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-base-content/40 shrink-0" />
                  <p>{[venue.street, venue.city, venue.postCode].filter(Boolean).join(", ")}</p>
                </div>
              )}
              {slotDate && (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-base-content/40 shrink-0" />
                  <p>{slotDate}</p>
                </div>
              )}
              {slot?.startTime && (
                <div className="flex items-center gap-2">
                  <FaClock className="text-base-content/40 shrink-0" />
                  <p>
                    {slot.startTime} – {slot.endTime}
                  </p>
                </div>
              )}
              {booking?.numberOfAttendees && (
                <p>
                  <span className="font-semibold text-base-content">Attendees:</span>{" "}
                  {booking.numberOfAttendees}
                </p>
              )}
              {booking?.eventName && booking.eventName !== "N/A" && (
                <p>
                  <span className="font-semibold text-base-content">Event:</span>{" "}
                  {booking.eventName}
                </p>
              )}
              {booking?.totalPrice != null && (
                <p>
                  <span className="font-semibold text-base-content">Total Paid:</span> £
                  {booking.totalPrice.toFixed(2)}
                </p>
              )}
            </div>
          </GlassCard>

          {/* What's next */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-base-content mb-3">What&apos;s Next?</h2>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li className="flex items-start gap-2">
                <span className="text-base-content/50 mt-0.5">•</span>
                Check your email for a booking confirmation with all details
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base-content/50 mt-0.5">•</span>
                Arrive 15 minutes before your booking time
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base-content/50 mt-0.5">•</span>
                You can view or cancel your booking from your profile
              </li>
            </ul>
          </GlassCard>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="primary" to="/profile" className="flex-1">
              View My Bookings
            </Button>
            <Button variant="ghost" to="/venues/booking" className="flex-1">
              Browse Venues
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
