import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatCurrency(amount) {
  return "£" + Number(amount ?? 0).toFixed(2);
}

const TABS = ["Orders", "Teams"];

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Orders");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    const token = localStorage.getItem("token");
    fetch(import.meta.env.VITE_DEV_URI + "users/profile", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading your profile…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center max-w-sm">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <Link to="/" className="text-sm text-purple-600 hover:underline">Go home</Link>
      </div>
    </div>
  );

  const { user, tickets, teams } = data;
  const initials = user.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-pink-200 flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                user.role === "admin"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : user.role === "moderator"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                {user.role}
              </span>
            </div>
            <div className="flex gap-4 mt-1 text-sm text-gray-500">
              <span><strong className="text-gray-800">{tickets.length}</strong> order{tickets.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span><strong className="text-gray-800">{teams.length}</strong> team registration{teams.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {tab === "Orders" ? tickets.length : teams.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="pb-16">
          {activeTab === "Orders" && (
            tickets.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No ticket orders yet.</p>
                <Link
                  to="/events/asc"
                  className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-sm shadow-pink-200"
                >
                  Browse events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {groupTicketsByPaymentId(tickets).map(order => (
                  <PaymentOrderRow key={order.paymentId} order={order} />
                ))}
              </div>
            )
          )}

          {activeTab === "Teams" && (
            teams.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No team registrations yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map(team => (
                  <TeamRow key={team._id} team={team} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function TicketRow({ ticket }) {
  const event = ticket.eventId;
  const paid = (event?.ticketPrice ?? 0) * (ticket.quantity || 1);

  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden flex group"
    >
      {/* Date block */}
      <div className="w-16 flex-shrink-0 bg-gradient-to-b from-pink-500 to-purple-600 flex flex-col items-center justify-center text-white py-4">
        <span className="text-xs font-semibold uppercase opacity-80">
          {event?.date ? new Date(event.date).toLocaleString("en-GB", { month: "short" }) : "—"}
        </span>
        <span className="text-2xl font-bold leading-tight">
          {event?.date ? new Date(event.date).getDate() : "—"}
        </span>
      </div>

      {/* Event image */}
      {event?.images?.[0] ? (
        <img src={event.images[0]} alt={event.title} className="w-28 h-full object-fill flex-shrink-0" />
      ) : (
        <div className="w-28 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
        <p className="font-semibold text-gray-900 truncate text-base group-hover:text-purple-700 transition-colors">
          {event?.title ?? "Unknown Event"}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatDate(event?.date)}
          {event?.city && <span> · {event.city}</span>}
        </p>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          {ticket.ticketCode ?? "—"} · {ticket.quantity || 1} ticket{(ticket.quantity || 1) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Price + status + arrow */}
      <div className="flex flex-col items-end justify-center px-5 gap-2 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800">{formatCurrency(paid)}</span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
          ✓ Paid
        </span>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function TeamRow({ team }) {
  const [expanded, setExpanded] = useState(false);
  const event = team.event;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-center px-5 py-4 gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{team.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {event?.title ?? "Unknown Event"}
            {event?.date && <span> · {formatDate(event.date)}</span>}
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
            team.paid
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-orange-50 text-orange-600 border-orange-200"
          }`}>
            {team.paid ? "✓ Paid" : "Pending"}
          </span>
          <span className="text-xs text-gray-400">
            {team.members?.length ?? 0} member{team.members?.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Members toggle */}
      {team.members?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium text-purple-500 hover:text-purple-700 border-t border-gray-50 hover:bg-purple-50/40 transition-all"
          >
            <span>{expanded ? "Hide members" : `Show ${team.members.length} member${team.members.length !== 1 ? "s" : ""}`}</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {team.members.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {m.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{m.name}</p>
                    {m.email && <p className="text-[10px] text-gray-400 truncate">{m.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper function to group tickets by paymentId
function groupTicketsByPaymentId(tickets) {
  const grouped = {};
  tickets.forEach(ticket => {
    const paymentId = ticket.paymentId || ticket._id; // fallback to ticket ID if no paymentId
    if (!grouped[paymentId]) {
      grouped[paymentId] = {
        paymentId,
        tickets: [],
        totalQuantity: 0,
        totalAmount: 0,
        createdAt: null,
      };
    }
    grouped[paymentId].tickets.push(ticket);
    grouped[paymentId].totalQuantity += (ticket.quantity || 1);
    grouped[paymentId].createdAt = ticket.createdAt || grouped[paymentId].createdAt;
    
    // Calculate total amount
    const event = ticket.eventId;
    const ticketPrice = event?.ticketPrice ?? 0;
    grouped[paymentId].totalAmount += ticketPrice * (ticket.quantity || 1);
  });

  return Object.values(grouped).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // newest first
  });
}

// Component to display a payment order (grouped tickets)
function PaymentOrderRow({ order }) {
  const [expanded, setExpanded] = useState(false);
  const firstTicket = order.tickets[0];
  const event = firstTicket?.eventId;
  const isSingleTicket = order.totalQuantity === 1;

  // For single tickets, render as a direct link
  if (isSingleTicket) {
    return (
      <Link
        to={`/tickets/${firstTicket._id}`}
        className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden text-left"
      >
        <div className="flex items-center">
          {/* Date block */}
          <div className="w-16 flex-shrink-0 bg-gradient-to-b from-pink-500 to-purple-600 flex flex-col items-center justify-center text-white py-4">
            <span className="text-xs font-semibold uppercase opacity-80">
              {event?.date ? new Date(event.date).toLocaleString("en-GB", { month: "short" }) : "—"}
            </span>
            <span className="text-2xl font-bold leading-tight">
              {event?.date ? new Date(event.date).getDate() : "—"}
            </span>
          </div>

          {/* Event image */}
          {event?.images?.[0] ? (
            <img src={event.images[0]} alt={event.title} className="w-28 h-full object-fill flex-shrink-0" />
          ) : (
            <div className="w-28 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
            <p className="font-semibold text-gray-900 truncate text-base group-hover:text-purple-700 transition-colors">
              {event?.title ?? "Unknown Event"}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDate(event?.date)}
              {event?.city && <span> · {event.city}</span>}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              {firstTicket.ticketCode || "—"}
            </p>
          </div>

          {/* Price + status */}
          <div className="flex flex-col items-end justify-center px-5 gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-800">£{order.totalAmount.toFixed(2)}</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              ✓ Paid
            </span>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  // For multiple tickets, render as expandable
  return (
    <div>
      {/* Order Summary */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden text-left"
      >
        <div className="flex items-center">
          {/* Date block */}
          <div className="w-16 flex-shrink-0 bg-gradient-to-b from-pink-500 to-purple-600 flex flex-col items-center justify-center text-white py-4">
            <span className="text-xs font-semibold uppercase opacity-80">
              {event?.date ? new Date(event.date).toLocaleString("en-GB", { month: "short" }) : "—"}
            </span>
            <span className="text-2xl font-bold leading-tight">
              {event?.date ? new Date(event.date).getDate() : "—"}
            </span>
          </div>

          {/* Event image */}
          {event?.images?.[0] ? (
            <img src={event.images[0]} alt={event.title} className="w-28 h-full object-fill flex-shrink-0" />
          ) : (
            <div className="w-28 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
            <p className="font-semibold text-gray-900 truncate text-base">
              {event?.title ?? "Unknown Event"}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDate(event?.date)}
              {event?.city && <span> · {event.city}</span>}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {order.totalQuantity} tickets · Payment ID: {order.paymentId.slice(-8)}
            </p>
          </div>

          {/* Price + status + arrow */}
          <div className="flex flex-col items-end justify-center px-5 gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-800">£{order.totalAmount.toFixed(2)}</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              ✓ Paid
            </span>
            <svg className={`w-4 h-4 text-gray-300 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded: Show all tickets in this order */}
      {expanded && (
        <div className="mt-2 space-y-2 ml-2">
          {order.tickets.map((ticket, idx) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden p-4"
            >
              <div className="flex items-center gap-4">
                {/* Ticket number */}
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 text-sm font-bold text-purple-600">
                  #{idx + 1}
                </div>

                {/* Ticket info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Ticket {idx + 1} of {order.tickets.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    ID: {ticket.ticketCode || ticket._id.slice(-8)}
                  </p>
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}