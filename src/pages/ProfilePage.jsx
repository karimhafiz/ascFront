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

const TABS = ["Orders", "Teams", "Courses"];

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

  const { user, tickets, teams, enrollments = [] } = data;
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
              <span><strong className="text-gray-800">{teams.length}</strong> team{teams.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span><strong className="text-gray-800">{enrollments.length}</strong> course{enrollments.length !== 1 ? "s" : ""}</span>
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
                  {tab === "Orders" ? tickets.length : tab === "Teams" ? teams.length : enrollments.length}
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
                {tickets.map(ticket => (
                  <TicketRow key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )
          )}

          {activeTab === "Courses" && (
            enrollments.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No course enrollments yet.</p>
                <Link to="/courses" className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-sm shadow-pink-200">
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map(enrollment => (
                  <EnrollmentRow key={enrollment._id} enrollment={enrollment} />
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

const CATEGORY_COLORS = {
  Language:  "from-blue-500 to-indigo-600",
  Religious: "from-emerald-500 to-teal-600",
  Academic:  "from-purple-500 to-violet-600",
  Arts:      "from-pink-500 to-rose-600",
  Other:     "from-amber-500 to-orange-600",
};

function EnrollmentRow({ enrollment }) {
  const [expanded, setExpanded] = useState(false);
  const course = enrollment.courseId;
  if (!course) return null;
  const gradient = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;
  const hasParticipants = enrollment.participants?.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-center">
        {course.images?.[0] ? (
          <img src={course.images[0]} alt={course.title} className="w-28 flex-shrink-0 object-cover" style={{ minHeight: 88 }} />
        ) : (
          <div className={`w-16 flex-shrink-0 bg-gradient-to-b ${gradient} flex items-center justify-center py-6`}>
            <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
          <p className="font-semibold text-gray-900 truncate text-base">{course.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {course.instructor && <span>{course.instructor}</span>}
            {course.city && <span> · {course.city}</span>}
          </p>
          {course.schedule && <p className="text-xs text-gray-400 mt-1">{course.schedule}</p>}
        </div>
        <div className="flex flex-col items-end justify-center px-5 gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">
            {course.price > 0 ? `£${course.price}` : "Free"}
          </span>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
            enrollment.status === "paid"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-600 border-blue-200"
          }`}>
            {enrollment.status === "paid" ? "✓ Enrolled" : "✓ Free"}
          </span>
        </div>
      </div>

      {/* Footer — participants toggle + view course */}
      <div className="flex items-center justify-between border-t border-gray-50 px-5 py-2.5">
        {hasParticipants ? (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-purple-500 hover:text-purple-700 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {expanded ? "Hide participants" : `${enrollment.participants.length} participant${enrollment.participants.length !== 1 ? "s" : ""}`}
          </button>
        ) : (
          <span className="text-xs text-gray-400">No participants recorded</span>
        )}
        <Link
          to={`/courses/${course._id}`}
          className="text-xs font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
        >
          View Course
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Participants list */}
      {expanded && hasParticipants && (
        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {enrollment.participants.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {p.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{p.name}</p>
                <div className="flex gap-2 text-[10px] text-gray-400">
                  {p.age && <span>Age {p.age}</span>}
                  {p.email && <span className="truncate">{p.email}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}