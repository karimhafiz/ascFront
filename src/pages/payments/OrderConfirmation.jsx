import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "../../auth/auth";
import TicketCard from "../../components/tickets/TicketCard";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const ticketId = searchParams.get("ticket_id");

  const {
    data: ticket,
    error: ticketError,
    isLoading: ticketLoading,
  } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}tickets/${ticketId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch ticket details");
      return res.json();
    },
    enabled: !!ticketId,
    retry: 1,
  });

  // Fetch sibling tickets to get total count for this payment
  const { data: groupTickets } = useQuery({
    queryKey: ["tickets-by-payment", ticket?.paymentId],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(
        `${import.meta.env.VITE_DEV_URI}tickets/by-payment/${ticket.paymentId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) return [ticket];
      return res.json();
    },
    enabled: !!ticket?.paymentId,
    retry: 0,
  });

  const groupCount = groupTickets?.length ?? 1;

  // Fallback receipt if no ticket_id
  const { data: receipt } = useQuery({
    queryKey: ["receipt", sessionId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}payments/session/${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch receipt");
      return res.json();
    },
    enabled: !!sessionId && !ticketId,
    retry: 1,
  });

  const handleAddToCalendar = () => {
    if (!ticket) return;
    const event = ticket.eventId;
    const eventDate = event?.date || new Date();
    const dtStart = new Date(eventDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtEnd =
      new Date(new Date(eventDate).getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ASC//EN",
      "BEGIN:VEVENT",
      `UID:${ticket._id}`,
      `DTSTAMP:${dtStart}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${event?.title || "Event"}`,
      `DESCRIPTION:Ticket ID: ${ticket.ticketCode || ticket._id}`,
      `LOCATION:${event?.street ? `${event.street}, ${event.city}` : event?.city || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (ticketLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-purple-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading your ticket…</p>
        </div>
      </div>
    );

  // Fallback — payment confirmed but ticket couldn't load
  if (ticketError || !ticket)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-green-100 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100/50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your payment was processed. Your ticket will appear in your profile shortly.
          </p>
          {receipt && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Amount:</span> £{receipt.amountTotal}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Quantity:</span> {receipt.quantity} ticket
                {receipt.quantity !== "1" ? "s" : ""}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {receipt.customerEmail}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <Link
              to="/profile"
              className="block w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all font-medium"
            >
              View My Tickets
            </Link>
            <Link
              to="/events"
              className="block w-full px-6 py-3 glass border border-purple-300 text-purple-700 rounded-xl hover:bg-purple-100/30 transition-all font-medium"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Success banner */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100/50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-1">Payment Successful!</h1>
          <p className="text-sm text-gray-500">Your ticket is confirmed. See details below.</p>
        </div>

        <div className="mb-6">
          <TicketCard ticket={ticket} />
          {groupCount > 1 && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-500">
                This is{" "}
                <span className="font-semibold text-purple-600">ticket 1 of {groupCount}</span> from
                this order.{" "}
                <Link
                  to="/profile"
                  className="text-purple-600 underline underline-offset-2 hover:text-purple-800"
                >
                  View all tickets →
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.print()}
            className="w-full btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Ticket
          </button>
          <button
            onClick={handleAddToCalendar}
            className="w-full btn glass border border-purple-300 text-purple-700 hover:bg-purple-100/30 hover:scale-105 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Add to Calendar
          </button>
          <Link
            to="/profile"
            className="block text-center w-full btn glass border border-gray-300 text-gray-700 hover:bg-gray-100/30 hover:scale-105 transition-all duration-300"
          >
            View All Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
