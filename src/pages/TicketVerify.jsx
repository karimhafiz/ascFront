import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch ticket data from backend
const fetchTicket = async (ticketCode) => {
    const response = await fetch(
        `${import.meta.env.VITE_BACK_END_URL}tickets/verify/${ticketCode}`
    );
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("INVALID");
        }
        throw new Error("Failed to fetch ticket");
    }
    return response.json();
};

// Check in ticket
const checkInTicket = async (ticketCode) => {
    const response = await fetch(
        `${import.meta.env.VITE_BACK_END_URL}tickets/verify/${ticketCode}/checkin`,
        { method: "POST" }
    );
    if (!response.ok) {
        throw new Error("Failed to check in ticket");
    }
    return response.json();
};

function formatDateTime(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function TicketVerify() {
    const { ticketCode } = useParams();
    const queryClient = useQueryClient();
    const [checkedInTicket, setCheckedInTicket] = useState(null);

    // Fetch ticket query
    const { data: ticket, isLoading, error } = useQuery({
        queryKey: ["verify-ticket", ticketCode],
        queryFn: () => fetchTicket(ticketCode),
    });

    // Check in mutation
    const checkInMutation = useMutation({
        mutationFn: () => checkInTicket(ticketCode),
        onSuccess: (data) => {
            // Update local state to show immediately
            setCheckedInTicket(data);
            // Invalidate the query to sync with backend
            queryClient.invalidateQueries({ queryKey: ["verify-ticket", ticketCode] });
        },
    });

    const handleCheckin = async () => {
        checkInMutation.mutate();
    };

    // Determine status
    let status = "invalid";
    let statusColor = "bg-red-500";
    let statusIcon = "❌";
    let statusText = "Invalid Ticket";

    const displayTicket = checkedInTicket || ticket;

    if (displayTicket && !error) {
        if (displayTicket.checkedIn) {
            status = "already-checked-in";
            statusColor = "bg-amber-500";
            statusIcon = "⚠️";
            statusText = "Already Checked In";
        } else {
            status = "valid";
            statusColor = "bg-green-500";
            statusIcon = "✅";
            statusText = "Valid — Ready to Check In";
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 px-4 py-6 flex items-center justify-center">
            <div className="w-full max-w-md">
                {isLoading ? (
                    // Loading state
                    <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                        <p className="mt-4 text-gray-600">Loading ticket...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Header with status badge */}
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-6 text-white text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest opacity-75 mb-2">
                                Ticket Verification
                            </p>
                            <div className={`inline-block ${statusColor} text-white font-bold py-3 px-6 rounded-full text-lg mb-3 w-full`}>
                                <span className="mr-2">{statusIcon}</span>
                                {statusText}
                            </div>
                        </div>

                        {/* Content */}
                        {status === "invalid" ? (
                            <div className="px-6 py-8 text-center">
                                <p className="text-lg font-semibold text-gray-800 mb-2">
                                    Ticket Not Found
                                </p>
                                <p className="text-gray-600">
                                    The ticket code "{ticketCode}" could not be found in the system.
                                </p>
                            </div>
                        ) : (
                            <div className="px-6 py-8 space-y-6">
                                {/* Event Info */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                                        Event
                                    </p>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {displayTicket?.eventId?.title || "—"}
                                    </h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatDate(displayTicket?.eventId?.date)}
                                    </p>
                                    {displayTicket?.eventId?.openingTime && (
                                        <p className="text-sm text-gray-600">
                                            Opens at {new Date(displayTicket.eventId.openingTime).toLocaleTimeString("en-GB", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    )}
                                    {displayTicket?.eventId?.street && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            📍 {displayTicket.eventId.street}, {displayTicket.eventId.city}
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <hr className="border-gray-200" />

                                {/* Buyer Info */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                                        Attendee
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {displayTicket?.user?.name || displayTicket?.buyerEmail || "—"}
                                    </p>
                                </div>

                                {/* Check-in status */}
                                {status === "already-checked-in" && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                        <p className="text-sm text-amber-900">
                                            <span className="font-semibold">Checked in on:</span>
                                            {" "}
                                            {formatDateTime(
                                                displayTicket?.checkedInAt || displayTicket?.originalCheckedInAt
                                            )}
                                        </p>
                                    </div>
                                )}

                                {/* Divider for buttons */}
                                {status === "valid" && <hr className="border-gray-200" />}

                                {/* Check In Button */}
                                {status === "valid" && (
                                    <button
                                        onClick={handleCheckin}
                                        disabled={checkInMutation.isPending}
                                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                                    >
                                        {checkInMutation.isPending ? "Checking In..." : "✓ Check In"}
                                    </button>
                                )}

                                {/* Error message for check-in */}
                                {checkInMutation.isError && (
                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                        <p className="text-sm text-red-900">
                                            Failed to check in. Please try again.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer text */}
                <div className="text-center mt-6 text-sm text-gray-600">
                    <p>Ticket Code: <span className="font-mono font-semibold text-gray-800">{ticketCode}</span></p>
                </div>
            </div>
        </div>
    );
}
