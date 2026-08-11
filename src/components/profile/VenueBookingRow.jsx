import React, { useState } from "react";
import { formatCurrency, BOOKING_STATUS_STYLES } from "./profileHelpers";

export default function VenueBookingRow({ booking }) {
  const [expanded, setExpanded] = useState(false);
  const slot = booking.slot;
  const venue = booking.venue;
  const status = booking.status;

  const slotDateStr = slot?.date
    ? new Date(slot.date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex">
        {/* Date block */}
        <div className="w-16 shrink-0 bg-linear-to-b from-primary to-primary/70 flex flex-col items-center justify-center text-white py-4">
          <span className="text-xs font-semibold uppercase opacity-80">
            {slot?.date ? new Date(slot.date).toLocaleString("en-GB", { month: "short" }) : "—"}
          </span>
          <span className="text-2xl font-bold leading-tight">
            {slot?.date ? new Date(slot.date).getDate() : "—"}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
          <p className="font-semibold text-base-content truncate text-base">
            {venue?.name ?? "Venue"}
          </p>
          <p className="text-sm text-base-content/50 mt-0.5">
            {slotDateStr}
            {slot?.startTime && slot?.endTime && (
              <span>
                {" "}
                · {slot.startTime}–{slot.endTime}
              </span>
            )}
            {venue?.city && <span> · {venue.city}</span>}
          </p>
          {booking.eventName && booking.eventName !== "N/A" && (
            <p className="text-xs text-base-content/50 mt-1">{booking.eventName}</p>
          )}
          <p className="text-xs text-base-content/50 mt-1 font-mono">
            {booking.bookingCode ?? `#${booking._id.slice(-8).toUpperCase()}`} ·{" "}
            {booking.numberOfAttendees} attendee{booking.numberOfAttendees !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Price + status */}
        <div className="flex flex-col items-end justify-center px-5 gap-2 shrink-0">
          <span className="text-sm font-semibold text-base-content">
            {formatCurrency(booking.totalPrice)}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${
              BOOKING_STATUS_STYLES[status] ?? "bg-base-200 text-base-content/50 border-base-300"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Expand toggle */}
      <div className="border-t border-base-100 px-5 py-2.5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-base-content/70 hover:text-base-content transition-colors cursor-pointer"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? "Hide details" : "View details"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                Venue
              </p>
              <p className="text-base-content font-medium">{venue?.name ?? "—"}</p>
              {(venue?.street || venue?.city) && (
                <p className="text-xs text-base-content/50">
                  {[venue.street, venue.city].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                Date &amp; Time
              </p>
              <p className="text-base-content">{slotDateStr}</p>
              {slot?.startTime && slot?.endTime && (
                <p className="text-xs text-base-content/50">
                  {slot.startTime} – {slot.endTime}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                Attendees
              </p>
              <p className="text-base-content">{booking.numberOfAttendees}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                Total Paid
              </p>
              <p className="text-base-content font-medium">{formatCurrency(booking.totalPrice)}</p>
            </div>
            {booking.eventName && booking.eventName !== "N/A" && (
              <div>
                <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                  Event Name
                </p>
                <p className="text-base-content">{booking.eventName}</p>
              </div>
            )}
            {booking.eventDescription && (
              <div className="col-span-2">
                <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                  Description
                </p>
                <p className="text-base-content/70 text-xs">{booking.eventDescription}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                Status
              </p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${
                  BOOKING_STATUS_STYLES[status] ??
                  "bg-base-200 text-base-content/50 border-base-300"
                }`}
              >
                {status}
              </span>
            </div>
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-wide font-medium mb-0.5">
                Reference
              </p>
              <p className="font-mono text-xs text-base-content/70">
                {booking.bookingCode ?? `#${booking._id.slice(-8).toUpperCase()}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
