import React, { useState } from "react";
import { Link } from "react-router-dom";
import { optimizeCloudinaryUrl } from "../../util/util";
import { formatDate, formatCurrency } from "./profileHelpers";

export default function OrderRow({ tickets }) {
  const [expanded, setExpanded] = useState(false);
  const firstTicket = tickets[0];
  const event = firstTicket.eventId;
  const qty = tickets.length;
  const totalPaid = (event?.ticketPrice ?? 0) * qty;

  return (
    <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Main row */}
      <div className="flex">
        {/* Date block */}
        <div className="w-16 shrink-0 bg-linear-to-b from-primary to-primary/70 flex flex-col items-center justify-center text-white py-4">
          <span className="text-xs font-semibold uppercase opacity-80">
            {event?.date ? new Date(event.date).toLocaleString("en-GB", { month: "short" }) : "—"}
          </span>
          <span className="text-2xl font-bold leading-tight">
            {event?.date ? new Date(event.date).getDate() : "—"}
          </span>
        </div>

        {/* Event image */}
        {event?.images?.[0] ? (
          <img
            src={optimizeCloudinaryUrl(event.images[0])}
            alt={event.title}
            className="w-28 object-cover shrink-0"
            width="112"
            height="88"
          />
        ) : (
          <div className="w-28 bg-linear-to-br from-base-200 to-base-200 flex items-center justify-center shrink-0">
            <svg
              className="w-8 h-8 text-base-content/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
          <p className="font-semibold text-base-content truncate text-base">
            {event?.title ?? "Unknown Event"}
          </p>
          <p className="text-sm text-base-content/50 mt-0.5">
            {formatDate(event?.date)}
            {event?.city && <span> · {event.city}</span>}
          </p>
          <p className="text-xs text-base-content/50 mt-1 font-mono">
            {qty} ticket{qty !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Price + status */}
        <div className="flex flex-col items-end justify-center px-5 gap-2 shrink-0">
          <span className="text-sm font-semibold text-base-content">
            {formatCurrency(totalPaid)}
          </span>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            ✓ Paid
          </span>
        </div>
      </div>

      {/* Expand toggle for individual tickets */}
      <div className="border-t border-base-100 px-5 py-2.5 flex items-center justify-between">
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
          {expanded ? "Hide tickets" : `View ${qty} ticket${qty !== 1 ? "s" : ""}`}
        </button>
        <Link
          to={
            qty > 1
              ? `/tickets/${firstTicket.ticketCode}?codes=${tickets
                  .map((t) => t.ticketCode)
                  .filter(Boolean)
                  .join(",")}`
              : `/tickets/${firstTicket.ticketCode}`
          }
          className="text-xs font-medium text-base-content/70 hover:text-base-content flex items-center gap-1 transition-colors"
        >
          View Order
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Expanded ticket list */}
      {expanded && (
        <div className="px-5 pb-4 space-y-2">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket.ticketCode}`}
              className="flex items-center gap-3 bg-base-100 rounded-xl px-4 py-3 hover:bg-base-200/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-base-content font-mono">
                  {ticket.ticketCode}
                </p>
                <p className="text-[10px] text-base-content/50">
                  {formatCurrency(event?.ticketPrice ?? 0)}
                  {ticket.checkedIn && " · Checked in"}
                </p>
              </div>
              {ticket.checkedIn && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ✓ Checked In
                </span>
              )}
              <svg
                className="w-3.5 h-3.5 text-base-content/30 group-hover:text-base-content/50 transition-colors shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
