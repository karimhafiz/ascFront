import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../../auth/auth";
import { Button, PageContainer, Spinner, GlassCard } from "../../components/ui";

const TICKET_CODE_RE = /^TKT-[A-Z2-9]{6}$/;

const fetchTicket = async (ticketCode) => {
  const response = await fetch(`${import.meta.env.VITE_DEV_URI}tickets/verify/${ticketCode}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("AUTH_REQUIRED");
    if (response.status === 404) throw new Error("INVALID");
    throw new Error("Failed to fetch ticket");
  }
  return response.json();
};

const checkInTicket = async (ticketCode) => {
  const response = await fetch(
    `${import.meta.env.VITE_DEV_URI}tickets/verify/${ticketCode}/checkin`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    }
  );
  if (!response.ok) throw new Error("Failed to check in ticket");
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
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const invalidFormat = !TICKET_CODE_RE.test(ticketCode);

  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["verify-ticket", ticketCode],
    queryFn: () => fetchTicket(ticketCode),
    enabled: !invalidFormat,
  });

  const checkInMutation = useMutation({
    mutationFn: () => checkInTicket(ticketCode),
    onSuccess: (data) => {
      setCheckedInTicket(data);
      setJustCheckedIn(!data.wasAlreadyCheckedIn);
      queryClient.invalidateQueries({ queryKey: ["verify-ticket", ticketCode] });
    },
  });

  const displayTicket = checkedInTicket || ticket;

  const isAuthError = error?.message === "AUTH_REQUIRED";

  let status = "invalid";
  let statusColor = "bg-red-500";
  let statusIcon = "❌";
  let statusText = "Invalid Ticket";

  if (invalidFormat) {
    statusText = "Invalid Code Format";
  } else if (isAuthError) {
    statusColor = "bg-amber-500";
    statusIcon = "🔒";
    statusText = "Authentication Required";
  } else if (displayTicket && !error) {
    if (justCheckedIn) {
      status = "just-checked-in";
      statusColor = "bg-green-500";
      statusIcon = "✅";
      statusText = "Checked In Successfully!";
    } else if (displayTicket.checkedIn) {
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
    <PageContainer center>
      <div className="w-full max-w-md">
        {isLoading ? (
          <GlassCard className="p-8 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-base-content/70">Loading ticket...</p>
          </GlassCard>
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-white/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/70 px-6 py-6 text-white text-center">
              <p className="text-sm font-semibold uppercase tracking-widest opacity-75 mb-2">
                Ticket Verification
              </p>
              <div
                className={`inline-flex items-center justify-center gap-2 ${statusColor} text-white font-bold py-3 px-6 rounded-full text-lg w-full`}
              >
                <span>{statusIcon}</span>
                <span>{statusText}</span>
              </div>
            </div>

            {/* Content */}
            {invalidFormat ? (
              <div className="px-6 py-8 text-center">
                <p className="text-lg font-semibold text-base-content mb-2">Invalid Code Format</p>
                <p className="text-base-content/70">
                  Ticket codes must follow the format <span className="font-mono">TKT-XXXXXX</span>.
                </p>
              </div>
            ) : isAuthError ? (
              <div className="px-6 py-8 text-center">
                <p className="text-lg font-semibold text-base-content mb-2">
                  Authentication Required
                </p>
                <p className="text-base-content/70">
                  Please log in as staff (admin or moderator) to verify tickets.
                </p>
              </div>
            ) : status === "invalid" ? (
              <div className="px-6 py-8 text-center">
                <p className="text-lg font-semibold text-base-content mb-2">Ticket Not Found</p>
                <p className="text-base-content/70">
                  The ticket code &quot;{ticketCode}&quot; could not be found in the system.
                </p>
              </div>
            ) : (
              <div className="px-6 py-8 space-y-6">
                {/* Event Info */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2">
                    Event
                  </p>
                  <h1 className="text-2xl font-bold text-base-content">
                    {displayTicket?.eventId?.title || "—"}
                  </h1>
                  <p className="text-sm text-base-content/70 mt-1">
                    {formatDate(displayTicket?.eventId?.date)}
                  </p>
                  {displayTicket?.eventId?.openingTime && (
                    <p className="text-sm text-base-content/70">
                      Opens at {displayTicket.eventId.openingTime}
                    </p>
                  )}
                  {displayTicket?.eventId?.street && (
                    <p className="text-sm text-base-content/70 mt-1">
                      📍 {displayTicket.eventId.street}, {displayTicket.eventId.city}
                    </p>
                  )}
                </div>

                <hr className="border-base-200" />

                {/* Attendee */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2">
                    Attendee
                  </p>
                  <p className="text-lg font-semibold text-base-content">
                    {displayTicket?.user?.name || displayTicket?.buyerEmail || "—"}
                  </p>
                  {displayTicket?.user?.email && (
                    <p className="text-sm text-base-content/70 mt-0.5">
                      {displayTicket.user.email}
                    </p>
                  )}
                  {!displayTicket?.user?.email &&
                    displayTicket?.buyerEmail &&
                    displayTicket?.user?.name && (
                      <p className="text-sm text-base-content/70 mt-0.5">
                        {displayTicket.buyerEmail}
                      </p>
                    )}
                </div>

                {/* Already checked in warning */}
                {status === "already-checked-in" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Checked in on:</span>{" "}
                      {formatDateTime(
                        displayTicket?.checkedInAt || displayTicket?.originalCheckedInAt
                      )}
                    </p>
                  </div>
                )}

                {/* Just checked in success */}
                {status === "just-checked-in" && (
                  <>
                    <hr className="border-base-200" />
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                      <p className="text-4xl mb-2">🎉</p>
                      <p className="text-lg font-bold text-green-800">Welcome!</p>
                      <p className="text-sm text-green-700 mt-1">
                        {displayTicket?.user?.name || displayTicket?.buyerEmail} has been checked
                        in.
                      </p>
                    </div>
                  </>
                )}

                {/* Check in button */}
                {status === "valid" && (
                  <>
                    <hr className="border-base-200" />
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => checkInMutation.mutate()}
                      disabled={checkInMutation.isPending}
                      className="w-full py-4 text-lg"
                    >
                      {checkInMutation.isPending ? "Checking In..." : "✓ Check In"}
                    </Button>
                  </>
                )}

                {checkInMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-900">Failed to check in. Please try again.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-6 text-sm text-base-content/70">
          <p>
            Ticket Code:{" "}
            <span className="font-mono font-semibold text-base-content">{ticketCode}</span>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
