import React from "react";
import { QRCodeSVG } from "qrcode.react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Shared ticket card used by TicketPage and OrderConfirmation.
 * Props:
 *   ticket — full ticket object with populated eventId and user
 *   ticketsInGroup — optional prop with number of tickets in the same payment group (for display on order confirmation)
 */
export default function TicketCard({ ticket, ticketsInGroup }) {
  const event = ticket.eventId;
  const amountPaid = (event?.ticketPrice ?? 0).toFixed(2);
  const qrValue = ticket.ticketCode
    ? `${import.meta.env.VITE_FRONT_END_URL}tickets/verify/${ticket.ticketCode}`
    : `${import.meta.env.VITE_FRONT_END_URL}tickets/verify/${ticket._id}`;

  const buyerName = ticket.user?.name ?? null;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">
              {event?.typeOfEvent === "Sports" ? "Sports Event" : "ASC Event"}
            </p>
            <h2 className="text-2xl font-bold leading-tight">{event?.title ?? "Event"}</h2>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shrink-0 ml-3">
            ✓ Paid
          </span>
        </div>
      </div>

      {/* Event image */}
      {event?.images?.[0] && (
        <img src={event.images[0]} alt={event.title} className="w-full h-48 object-fill" />
      )}

      {/* Ticket code + QR */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-dashed border-gray-200">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ticket ID</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 tracking-widest font-mono">
            {ticket.ticketCode ?? "—"}
          </p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <QRCodeSVG value={qrValue} size={80} fgColor="#7c3aed" level="M" />
        </div>
      </div>

      {/* Tear line */}
      <div className="relative flex items-center">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-50 via-white to-purple-50 border border-gray-100 -ml-3 shrink-0" />
        <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-2" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-50 via-white to-purple-50 border border-gray-100 -mr-3 shrink-0" />
      </div>

      {/* Details grid */}
      <div className="px-6 py-6 grid grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
          <p className="text-sm font-semibold text-gray-800">{formatDate(event?.date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Time</p>
          <p className="text-sm font-semibold text-gray-800">{event?.openingTime ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Venue</p>
          <p className="text-sm font-semibold text-gray-800">
            {event?.street ? `${event.street}, ${event.city}` : (event?.city ?? "—")}
          </p>
          {event?.postCode && <p className="text-xs text-gray-400">{event.postCode}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {buyerName ? "Name" : "Email"}
          </p>
          <p className="text-sm font-semibold text-gray-800">{buyerName ?? ticket.buyerEmail}</p>
          {buyerName && <p className="text-xs text-gray-400 truncate">{ticket.buyerEmail}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount Paid</p>
          <p className="text-sm font-bold text-purple-700">£{amountPaid}</p>
        </div>
        {ticketsInGroup && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Quantity</p>
            <p className="text-sm font-semibold text-gray-800">
              {ticketsInGroup} ticket{ticketsInGroup !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="bg-purple-50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <svg
            className="w-4 h-4 text-purple-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-purple-600">
            Present this QR code at the entrance. Screenshot or print for offline access.
          </p>
        </div>
      </div>
    </div>
  );
}
