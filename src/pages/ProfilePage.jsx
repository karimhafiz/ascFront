import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatCurrency(amount) {
    return "£" + Number(amount ?? 0).toFixed(2);
}

const roleBadge = {
    admin: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    user: "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, count }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-200">
                {icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            {count !== undefined && (
                <span className="ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
                    {count}
                </span>
            )}
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}

function TicketCard({ ticket }) {
    const event = ticket.eventId;

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400 to-purple-500 rounded-l-2xl" />
            <div className="pl-5 pr-4 py-4 flex items-start gap-4">
                {event && event.image ? (
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                        {event ? event.title : "Unknown Event"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(event && event.date)}
                        {event && event.location && (
                            <span> &middot; <span className="text-gray-400">{event.location}</span></span>
                        )}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {ticket.quantity || 1} {(ticket.quantity || 1) === 1 ? "ticket" : "tickets"}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatCurrency((event && event.ticketPrice ? event.ticketPrice : 0) * (ticket.quantity || 1))} paid
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                        ✓ Paid
                    </span>
                    {ticket.paymentId && (
                        <span
                            className="text-[10px] text-gray-300 font-mono truncate max-w-[90px]"
                            title={ticket.paymentId}
                        >
                            ref: …{ticket.paymentId.slice(-8)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function TeamCard({ team }) {
    const [expanded, setExpanded] = useState(false);
    const event = team.event;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{team.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {event ? event.title : "Unknown Event"}
                            {event && event.date && (
                                <span> &middot; {formatDate(event.date)}</span>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={"text-xs font-medium px-2 py-0.5 rounded-full border " + (
                            team.paid
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-orange-50 text-orange-600 border-orange-200"
                        )}>
                            {team.paid ? "✓ Paid" : "Pending"}
                        </span>
                        <span className="text-xs text-gray-400">
                            {team.members ? team.members.length : 0} member{(!team.members || team.members.length !== 1) ? "s" : ""}
                        </span>
                    </div>
                </div>

                {team.members && team.members.length > 0 && (
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="mt-3 text-xs text-purple-500 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
                    >
                        {expanded ? "Hide members" : "Show members"}
                        <svg className={"w-3.5 h-3.5 transition-transform " + (expanded ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}

                {expanded && team.members && (
                    <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {team.members.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                                    {m.name ? m.name[0].toUpperCase() : "?"}
                                </span>
                                <span className="truncate">{m.name}</span>
                                {m.email && <span className="text-gray-400 truncate"> · {m.email}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
                    <p className="text-sm text-gray-400">Loading your profile…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center max-w-sm">
                    <p className="text-red-500 font-medium mb-4">{error}</p>
                    <Link to="/" className="text-sm text-purple-600 hover:underline">Go home</Link>
                </div>
            </div>
        );
    }

    const { user, tickets, teams } = data;
    const initials = user.name
        ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* ── User Info Card ── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-pink-200 flex-shrink-0">
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                            <span className={"text-xs font-medium px-2 py-0.5 rounded-full capitalize " + (roleBadge[user.role] || roleBadge.user)}>
                                {user.role}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{user.email}</p>

                        <div className="flex gap-4 mt-3 text-xs text-gray-400">
                            <span>
                                <span className="font-semibold text-gray-700">{tickets.length}</span> ticket order{tickets.length !== 1 ? "s" : ""}
                            </span>
                            <span>
                                <span className="font-semibold text-gray-700">{teams.length}</span> team registration{teams.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Tickets Section ── */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        count={tickets.length}
                        title="My Tickets"
                        icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        }
                    />
                    {tickets.length === 0 ? (
                        <>
                            <EmptyState message="You haven't bought any tickets yet." />
                            <div className="text-center mt-2">
                                <Link
                                    to="/events"
                                    className="inline-block text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-5 py-2 rounded-full shadow-sm shadow-pink-200 transition-all"
                                >
                                    Browse events
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <TicketCard key={ticket._id} ticket={ticket} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Teams Section ── */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        count={teams.length}
                        title="My Team Registrations"
                        icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                    {teams.length === 0 ? (
                        <EmptyState message="You haven't registered any teams yet." />
                    ) : (
                        <div className="space-y-3">
                            {teams.map((team) => (
                                <TeamCard key={team._id} team={team} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}