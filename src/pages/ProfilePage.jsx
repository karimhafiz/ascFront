import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, getAuthToken } from "../auth/auth";
import { optimizeCloudinaryUrl, toSlug } from "../util/util";
import { Button, Spinner } from "../components/ui";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return "£" + Number(amount ?? 0).toFixed(2);
}

const INTERVAL_ADJ = { month: "Monthly", year: "Yearly" };

const TABS = ["Orders", "Teams", "Courses"];

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Orders");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const token = getAuthToken();
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-white to-base-200">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/50">Loading your profile…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-white to-base-200">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link to="/" className="text-sm text-base-content/70 hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );

  const { user, tickets, teams, enrollments = [] } = data;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-white to-base-200">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-primary/20 flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-base-content">{user.name}</h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                  user.role === "admin"
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : user.role === "moderator"
                      ? "bg-base-200 text-base-content border border-base-300"
                      : "bg-base-200 text-base-content/50 border border-base-300"
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="flex gap-4 mt-1 text-sm text-base-content/50">
              <span>
                <strong className="text-base-content">{tickets.length}</strong> order
                {tickets.length !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                <strong className="text-base-content">{teams.length}</strong> team
                {teams.length !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                <strong className="text-base-content">{enrollments.length}</strong> course
                {enrollments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-base-300 mb-6">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/50 hover:text-base-content hover:border-base-300"
                }`}
              >
                {tab}
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab
                      ? "bg-base-200 text-primary"
                      : "bg-base-200 text-base-content/50"
                  }`}
                >
                  {tab === "Orders"
                    ? tickets.length
                    : tab === "Teams"
                      ? teams.length
                      : enrollments.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="pb-16">
          {activeTab === "Orders" &&
            (tickets.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-primary/30"
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
                <p className="text-base-content/50 mb-4">No ticket orders yet.</p>
                <Button variant="primary" size="sm" to="/events/asc">
                  Browse events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <TicketRow key={ticket._id} ticket={ticket} />
                ))}
              </div>
            ))}

          {activeTab === "Courses" &&
            (enrollments.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-base-content/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p className="text-base-content/50 mb-4">No course enrollments yet.</p>
                <Button variant="primary" size="sm" to="/courses">
                  Browse courses
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <EnrollmentRow key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            ))}

          {activeTab === "Teams" &&
            (teams.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-base-content/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-base-content/50">No team registrations yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <TeamRow key={team._id} team={team} />
                ))}
              </div>
            ))}
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
      to={`/tickets/${ticket.ticketCode}`}
      className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md hover:border-base-300 transition-all duration-200 overflow-hidden flex group"
    >
      {/* Date block */}
      <div className="w-16 flex-shrink-0 bg-gradient-to-b from-primary to-primary/70 flex flex-col items-center justify-center text-white py-4">
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
          className="w-28 h-full object-fill flex-shrink-0"
          width="112"
          height="88"
        />
      ) : (
        <div className="w-28 bg-gradient-to-br from-base-200 to-base-200 flex items-center justify-center flex-shrink-0">
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
        <p className="font-semibold text-base-content truncate text-base group-hover:text-base-content transition-colors">
          {event?.title ?? "Unknown Event"}
        </p>
        <p className="text-sm text-base-content/50 mt-0.5">
          {formatDate(event?.date)}
          {event?.city && <span> · {event.city}</span>}
        </p>
        <p className="text-xs text-base-content/50 mt-1 font-mono">
          {ticket.ticketCode ?? "—"} · {ticket.quantity || 1} ticket
          {(ticket.quantity || 1) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Price + status + arrow */}
      <div className="flex flex-col items-end justify-center px-5 gap-2 flex-shrink-0">
        <span className="text-sm font-semibold text-base-content">{formatCurrency(paid)}</span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
          ✓ Paid
        </span>
        {ticket.checkedIn && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            ✓ Checked In
          </span>
        )}
        <svg
          className="w-4 h-4 text-base-content/40 group-hover:text-base-content/50 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
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
    <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div
        onClick={() => team.members?.length > 0 && setExpanded((v) => !v)}
        className={`flex items-center px-5 py-4 gap-4 transition-colors ${team.members?.length > 0 ? "cursor-pointer hover:bg-base-200/30" : ""}`}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-base-200 to-base-200 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-base-content/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base-content truncate">{team.name}</p>
          <p className="text-sm text-base-content/50 mt-0.5">
            {event?.title ?? "Unknown Event"}
            {event?.date && <span> · {formatDate(event.date)}</span>}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                team.paid
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-orange-50 text-orange-600 border-orange-200"
              }`}
            >
              {team.paid ? "✓ Paid" : "Pending"}
            </span>
            <span className="text-xs text-base-content/50">
              {team.members?.length ?? 0} member{team.members?.length !== 1 ? "s" : ""}
            </span>
          </div>
          {team.members?.length > 0 && (
            <svg
              className={`w-4 h-4 text-base-content/50 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Members list */}
      {team.members?.length > 0 && expanded && (
        <div className="px-5 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-base-100">
          {team.members.map((m, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-base-200/40 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {m.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-base-content truncate">{m.name}</p>
                {m.email && <p className="text-[10px] text-base-content/50 truncate">{m.email}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORY_COLORS = {
  Language: "from-blue-500 to-primary/70",
  Religious: "from-emerald-500 to-teal-600",
  Academic: "from-primary to-primary/70",
  Arts: "from-primary to-primary/70",
  Other: "from-amber-500 to-orange-600",
};

function EnrollmentRow({ enrollment }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState(enrollment.subscriptionStatus === "cancelled");
  const [participants, setParticipants] = useState(enrollment.participants || []);
  const [removingIdx, setRemovingIdx] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const course = enrollment.courseId;
  if (!course) return null;
  const gradient = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;
  const hasParticipants = participants.length > 0;
  const isSubscription = !!enrollment.subscriptionId;
  const periodEnd = enrollment.currentPeriodEnd ? new Date(enrollment.currentPeriodEnd) : null;

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCancel = () => {
    setConfirm({
      title: "Cancel subscription",
      message: periodEnd
        ? `Are you sure you want to cancel? You'll keep access until ${periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.`
        : "Are you sure you want to cancel? You'll keep access until the end of your current billing period.",
      confirmText: "Yes, cancel",
      variant: "danger",
      onConfirm: async () => {
        setConfirm(null);
        setCancelling(true);
        try {
          const token = getAuthToken();
          const res = await fetch(
            `${import.meta.env.VITE_DEV_URI}courses/enrollments/${enrollment._id}/cancel`,
            { method: "POST", headers: { Authorization: "Bearer " + token } }
          );
          const data = await res.json();
          if (res.ok) setCancelDone(true);
          else showToast(data.error || "Failed to cancel");
        } catch {
          showToast("Something went wrong");
        }
        setCancelling(false);
      },
    });
  };

  const handleRemoveParticipant = (index) => {
    const name = participants[index]?.name || "this participant";
    setConfirm({
      title: "Remove participant",
      message: `Remove ${name} from this course? This cannot be undone.`,
      confirmText: "Remove",
      variant: "danger",
      onConfirm: async () => {
        setConfirm(null);
        setRemovingIdx(index);
        try {
          const token = getAuthToken();
          const res = await fetch(
            `${import.meta.env.VITE_DEV_URI}courses/enrollments/${enrollment._id}/remove-participant`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ participantIndex: index }),
            }
          );
          const data = await res.json();
          if (res.ok) {
            setParticipants(data.participants);
          } else {
            showToast(data.error || "Failed to remove participant");
          }
        } catch {
          showToast("Something went wrong");
        }
        setRemovingIdx(null);
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-center">
        {course.images?.[0] ? (
          <img
            src={optimizeCloudinaryUrl(course.images[0])}
            alt={course.title}
            className="w-28 flex-shrink-0 object-cover"
            width="112"
            height="88"
            style={{ minHeight: 88 }}
          />
        ) : (
          <div
            className={`w-16 flex-shrink-0 bg-gradient-to-b ${gradient} flex items-center justify-center py-6`}
          >
            <svg
              className="w-6 h-6 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
          <p className="font-semibold text-base-content truncate text-base">{course.title}</p>
          <p className="text-sm text-base-content/50 mt-0.5">
            {course.instructor && <span>{course.instructor}</span>}
            {course.city && <span> · {course.city}</span>}
          </p>
          {course.schedule && (
            <p className="text-xs text-base-content/50 mt-1">{course.schedule}</p>
          )}
          <p className="text-xs text-base-content/50 mt-1 font-mono">
            {enrollment._id.slice(-8).toUpperCase()}
            {" · "}
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
            {isSubscription && ` · ${INTERVAL_ADJ[course.billingInterval] || "Monthly"}`}
          </p>
        </div>
        <div className="flex flex-col items-end justify-center px-5 gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-base-content">
            {course.price > 0 ? formatCurrency(course.price * participants.length) : "Free"}
          </span>
          {course.price > 0 && participants.length > 1 && (
            <span className="text-[10px] text-base-content/50">
              {formatCurrency(course.price)} x {participants.length}
            </span>
          )}
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              enrollment.status === "active"
                ? "bg-green-50 text-green-700 border-green-200"
                : enrollment.status === "paid"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : enrollment.status === "free"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : enrollment.status === "cancelled"
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : enrollment.status === "past_due"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-base-100 text-base-content/50 border-base-300"
            }`}
          >
            {enrollment.status === "active"
              ? "✓ Subscribed"
              : enrollment.status === "paid"
                ? "✓ Enrolled"
                : enrollment.status === "free"
                  ? "✓ Free"
                  : enrollment.status === "cancelled"
                    ? "Cancelled"
                    : enrollment.status === "past_due"
                      ? "⚠ Payment due"
                      : enrollment.status}
          </span>
        </div>
      </div>

      {/* Subscription info bar */}
      {isSubscription && (
        <div
          className={`px-5 py-2.5 text-xs flex items-center justify-between border-t ${cancelDone ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"}`}
        >
          <div>
            {cancelDone ? (
              <span className="text-orange-600 font-medium">
                ⏳ Cancelled — access until{" "}
                {periodEnd
                  ? periodEnd.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "end of period"}
              </span>
            ) : (
              <span className="text-blue-600">
                🔄 {INTERVAL_ADJ[course.billingInterval] || "Monthly"} subscription
                {periodEnd && (
                  <span className="text-blue-400 ml-1">
                    · renews{" "}
                    {periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                )}
              </span>
            )}
          </div>
          {!cancelDone && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelling..." : "Cancel subscription"}
            </button>
          )}
        </div>
      )}

      {/* Footer — participants toggle + view course */}
      <div className="flex items-center justify-between border-t border-base-100 px-5 py-2.5">
        {hasParticipants ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-base-content/70 hover:text-base-content transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {expanded
              ? "Hide participants"
              : `${participants.length} participant${participants.length !== 1 ? "s" : ""}`}
          </button>
        ) : (
          <span className="text-xs text-base-content/50">No participants recorded</span>
        )}
        <Link
          to={`/courses/${toSlug(course.title, course._id)}`}
          aria-label={`View ${course.title} course`}
          className="text-xs font-medium text-base-content/70 hover:text-base-content flex items-center gap-1 transition-colors"
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
          {participants.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-base-100 rounded-xl px-3 py-2 group/participant"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {p.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-base-content truncate">{p.name}</p>
                <div className="flex gap-2 text-[10px] text-base-content/50">
                  {p.age && <span>Age {p.age}</span>}
                  {p.email && <span className="truncate">{p.email}</span>}
                </div>
              </div>
              {participants.length > 1 && (
                <button
                  onClick={() => handleRemoveParticipant(i)}
                  disabled={removingIdx !== null}
                  title={`Remove ${p.name}`}
                  className="opacity-0 group-hover/participant:opacity-100 transition-opacity text-red-400 hover:text-red-600 disabled:opacity-30 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  {removingIdx === i ? (
                    <div className="w-4 h-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-base-300 max-w-sm w-full mx-4 p-6 animate-[scaleIn_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  confirm.variant === "danger" ? "bg-red-50" : "bg-base-200"
                }`}
              >
                {confirm.variant === "danger" ? (
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-base-content/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-base font-semibold text-base-content">{confirm.title}</h3>
            </div>
            <p className="text-sm text-base-content/50 mb-6 ml-[52px]">{confirm.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-base-content/70 bg-base-200 hover:bg-base-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirm.onConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors cursor-pointer ${
                  confirm.variant === "danger"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/80"
                }`}
              >
                {confirm.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.2s_ease-out]">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {toast.type === "error" ? (
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 flex-shrink-0"
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
            )}
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current opacity-50 hover:opacity-100 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
