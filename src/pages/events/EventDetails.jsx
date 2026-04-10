import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, ScrollRestoration } from "react-router-dom";
import TeamSignupForm from "../../components/teams/TeamSignupForm";
import TeamEditForm from "../../components/teams/TeamEditForm";
import { parseJwt, getAuthToken, fetchWithAuth, isAuthenticated } from "../../auth/auth";
import { slugToId } from "../../util/util";
import { Button, PageContainer, GlassCard, Spinner } from "../../components/ui";

export default function EventDetails() {
  const { eventSlug } = useParams();
  const eventId = slugToId(eventSlug);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState("1");
  const [email, setEmail] = useState(() => {
    const token = getAuthToken();
    if (!token) return "";
    const payload = parseJwt(token);
    return payload?.email || "";
  });
  const [showTeamSignup, setShowTeamSignup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const queryClient = useQueryClient();
  const loggedIn = isAuthenticated();

  const handleBack = () => {
    navigate(-1);
  };

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_DEV_URI}events/${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      return response.json();
    },
  });

  const isTournament = event && event.isTournament;

  const { data: myTeams = [] } = useQuery({
    queryKey: ["my-teams", eventId],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}teams/event/${eventId}/my-teams`
      );
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
    enabled: !!isTournament && loggedIn,
  });

  // ─── Stripe Checkout ──────────────────────────────────────────────────────
  const handleBuyTickets = async () => {
    setBuyError("");
    setAwaitingConfirm(false);

    if (isTournament) {
      if (!email) {
        setBuyError("Please enter your email to proceed.");
        return;
      }
      setShowTeamSignup(true);
      return;
    }

    if (parseInt(quantity) > 5 && !awaitingConfirm) {
      setAwaitingConfirm(true);
      return;
    }

    if (!email) {
      setBuyError("Please enter your email to proceed.");
      return;
    }

    if (!quantity || parseInt(quantity) < 1) {
      setBuyError("Please select at least 1 ticket.");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}payments/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            email,
            quantity: parseInt(quantity) || 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe's hosted checkout page
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setBuyError(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    window.open(`https://www.facebook.com/profile.php?id=100081705505202`, "_blank");
  };

  if (isLoading)
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/50">Loading event details...</p>
        </div>
      </PageContainer>
    );
  if (error)
    return (
      <PageContainer center>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-red-100 text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{error.message}</p>
        </div>
      </PageContainer>
    );

  const isEventInPast =
    event.isReoccurring && event.reoccurringEndDate
      ? new Date(event.reoccurringEndDate) < new Date()
      : new Date(event.date) < new Date();

  return (
    <PageContainer>
      <Helmet>
        <title>{event.title} | ASC Events</title>
        <meta
          name="description"
          content={event.shortDescription || event.longDescription?.slice(0, 155)}
        />
      </Helmet>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 md:p-12 shadow-lg backdrop-blur-sm">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-2">{event.title}</h1>
          {event.organizer && (
            <p className="text-center text-lg">
              <span className="flex items-center justify-center">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {event.organizer}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Social Share */}
        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant="circle"
            onClick={handleShare}
            className="bg-gradient-to-br from-primary to-secondary text-white hover:scale-110 border-none shadow-md"
            aria-label="Share on Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Event Details */}
          <div className="md:col-span-2 space-y-6">
            <GlassCard className="shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl text-base-content">Event Details:</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-primary to-secondary text-white p-3 rounded-xl mr-4 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-base-content">Date & Time</h3>
                      <p className="text-base-content/70">
                        {new Date(event.date).toLocaleDateString()}, {event.openingTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-primary to-secondary text-white p-3 rounded-xl mr-4 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-base-content">Location</h3>
                      <p className="text-base-content/70">
                        {event.street}, {event.city}, {event.postCode}
                      </p>
                    </div>
                  </div>

                  {event.ticketPrice > 0 && (
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-secondary to-primary text-white p-3 rounded-xl mr-4 shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-base-content">
                          {event.isTournament ? "Tournament Fee" : "Ticket Price"}
                        </h3>
                        <p className="text-base-content/70">£{event.ticketPrice}</p>
                        {event.isTournament && (
                          <p className="text-xs text-base-content/50 mt-0.5">
                            Per player — spectators enter free
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {event.ticketsAvailable !== undefined && (
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-3 rounded-xl mr-4 shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-base-content">Availability</h3>
                        <p className="text-base-content/70">
                          {event.ticketsAvailable > 0
                            ? `${event.ticketsAvailable} tickets remaining`
                            : "Sold out"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
            {event.images && event.images.length > 0 && (
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-3/8 object-cover rounded-2xl shadow-xl"
              />
            )}
            <GlassCard className="shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl text-base-content">About This Event</h2>
                <div className="prose max-w-none text-base-content/80">
                  <p>{event.longDescription}</p>
                </div>
              </div>
            </GlassCard>

            {/* My Teams */}
            {isTournament && myTeams.length > 0 && (
              <GlassCard className="shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-xl text-base-content">
                    My Teams ({myTeams.length})
                  </h2>
                  <div className="space-y-3 mt-2">
                    {myTeams.map((team) => (
                      <MyTeamRow
                        key={team._id}
                        team={team}
                        onTeamUpdated={() =>
                          queryClient.invalidateQueries({ queryKey: ["my-teams", eventId] })
                        }
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Right column: Ticket Purchase */}
          <div className="md:col-span-1">
            {!isEventInPast && event.ticketPrice === 0 && !event.isTournament ? (
              <GlassCard className="shadow-xl">
                <div className="card-body text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h2 className="card-title text-xl text-green-700 justify-center">Free Entry</h2>
                  <p className="text-base-content/50 text-sm">
                    This event is free to attend. Just show up!
                  </p>
                </div>
              </GlassCard>
            ) : !isEventInPast ? (
              <GlassCard className="shadow-xl md:sticky md:top-20 hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  <h2 className="card-title text-xl text-base-content">
                    {event.isTournament ? "Team Registration" : "Purchase Tickets"}
                  </h2>
                  <div className="space-y-4">
                    {event.isTournament && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                        The tournament fee is charged <strong>per player</strong>. Spectators and
                        supporters are welcome to attend for free.
                      </div>
                    )}
                    <div>
                      <label className="block text-md font-medium mb-2 text-base-content">
                        Your Email:
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="glass-input"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    {!event.isTournament && (
                      <div>
                        <label className="block text-md font-medium mb-2 text-base-content">
                          Ticket Quantity:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={event.ticketsAvailable || 99}
                          value={quantity}
                          onChange={(e) => {
                            setQuantity(e.target.value);
                            setAwaitingConfirm(false);
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setQuantity(String(isNaN(val) || val < 1 ? 1 : val));
                          }}
                          className="glass-input"
                        />
                        {event.ticketPrice > 0 && (
                          <p className="text-sm text-base-content/70 mt-1">
                            Total: £{(event.ticketPrice * (parseInt(quantity) || 1)).toFixed(2)}
                          </p>
                        )}
                        {awaitingConfirm && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-sm font-medium text-amber-700 mb-2">
                              You're buying {quantity} tickets — are you sure?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setAwaitingConfirm(false);
                                  setQuantity(1);
                                }}
                                className="flex-1 text-xs py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                              >
                                Change
                              </button>
                              <button
                                onClick={handleBuyTickets}
                                className="flex-1 text-xs py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all font-medium cursor-pointer"
                              >
                                Yes, continue
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {buyError && (
                      <p className="text-red-500 text-sm bg-red-50/50 rounded-xl p-2">{buyError}</p>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleBuyTickets}
                        disabled={isProcessing || event.ticketsAvailable === 0}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <Spinner size="sm" />
                            <span className="ml-3">Redirecting to payment...</span>
                          </span>
                        ) : event.ticketsAvailable === 0 ? (
                          "Sold Out"
                        ) : event.isTournament ? (
                          "Register & Pay for Team"
                        ) : (
                          "Buy Tickets"
                        )}
                      </Button>
                    </div>

                    {/* Stripe badge */}
                    {!event.isTournament && (
                      <p className="text-xs text-center text-base-content/50 mt-2">
                        Secure payment via Stripe
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="bg-red-100/30 shadow-xl border-red-300/50">
                <div className="card-body">
                  <h2 className="card-title text-xl text-red-600">Event Has Ended</h2>
                  <p className="text-red-500">
                    This event has already occurred.{" "}
                    {isTournament
                      ? "Team registration is no longer available."
                      : "Ticket purchases are no longer available."}
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* TeamSignupForm Modal */}
        {showTeamSignup && (
          <TeamSignupForm
            eventId={eventId}
            managerId={email}
            onSuccess={() => {
              setShowTeamSignup(false);
              queryClient.invalidateQueries({ queryKey: ["my-teams", eventId] });
            }}
            onClose={() => setShowTeamSignup(false)}
          />
        )}

        {/* Back Button */}
        <div className="mt-8 mb-4">
          <Button variant="secondary" onClick={handleBack}>
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Events
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

function MyTeamRow({ team, onTeamUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const hasMem = team.members?.length > 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div
          onClick={() => hasMem && setExpanded((v) => !v)}
          className={`flex items-center px-5 py-4 gap-4 transition-colors ${hasMem ? "cursor-pointer hover:bg-base-200/30" : ""}`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-primary"
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

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base-content truncate">{team.name}</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              {team.members?.length ?? 0} member{team.members?.length !== 1 ? "s" : ""}
              {team.manager?.phone && <span> · {team.manager.phone}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="btn btn-s bg-base-200/60 hover:bg-base-300/60 border border-base-300/60 text-base-content transition-all duration-300 rounded-lg"
              title="Edit team"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${team.paid ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}
            >
              {team.paid ? "Paid" : "Pending"}
            </span>
            {hasMem && (
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

        {hasMem && expanded && (
          <div className="px-5 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-base-100">
            {team.members.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-base-200/40 rounded-xl px-3 py-2"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {m.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-base-content truncate">{m.name}</p>
                  {m.email && (
                    <p className="text-[10px] text-base-content/50 truncate">{m.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <TeamEditForm
          team={team}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onTeamUpdated();
          }}
        />
      )}
    </>
  );
}
