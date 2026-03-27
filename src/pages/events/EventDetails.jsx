import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import TeamSignupForm from "../../components/teams/TeamSignupForm";
import { parseJwt, getAuthToken } from "../../auth/auth";
import { slugToId } from "../../util/util";

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

  // ─── Stripe Checkout ──────────────────────────────────────────────────────
  // Calls our backend to create a Stripe Checkout Session.
  // The backend talks to Stripe using the secret key and returns a hosted
  // payment page URL. We then redirect the user there.
  // After payment, Stripe redirects to our backend /payments/success which
  // creates the ticket and redirects to /order-confirmation.
  // ─────────────────────────────────────────────────────────────────────────
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
      const response = await fetch(
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-purple-500 animate-spin" />
          <p className="text-sm text-purple-400">Loading event details…</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-red-100 text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{error.message}</p>
        </div>
      </div>
    );

  const isEventInPast = new Date(event.date) < new Date();

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen">
      <Helmet>
        <title>{event.title} | ASC Events</title>
        <meta
          name="description"
          content={event.shortDescription || event.longDescription?.slice(0, 155)}
        />
      </Helmet>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 md:p-12 shadow-lg backdrop-blur-sm">
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
          <button
            onClick={handleShare}
            className="btn btn-circle glass bg-gradient-to-br from-pink-400 to-purple-500 text-white hover:scale-110 transition-all duration-300 border-none shadow-md cursor-pointer"
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
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Event Details */}
          <div className="md:col-span-2 space-y-6">
            {event.images && event.images.length > 0 && (
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-auto object-cover rounded-2xl shadow-xl"
              />
            )}
            <div className="glass-card rounded-2xl shadow-xl border border-white/30 backdrop-blur-md">
              <div className="card-body">
                <h2 className="card-title text-xl text-pink-700">Event Details:</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-3 rounded-xl mr-4 shadow-md">
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
                      <h3 className="font-bold text-lg text-purple-900">Date & Time</h3>
                      <p className="text-purple-800">
                        {new Date(event.date).toLocaleDateString()}, {event.openingTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl mr-4 shadow-md">
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
                      <h3 className="font-bold text-lg text-purple-900">Location</h3>
                      <p className="text-purple-800">
                        {event.street}, {event.city}, {event.postCode}
                      </p>
                    </div>
                  </div>

                  {event.ticketPrice > 0 && (
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-3 rounded-xl mr-4 shadow-md">
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
                        <h3 className="font-bold text-lg text-purple-900">
                          {event.isTournament ? "Tournament Fee" : "Ticket Price"}
                        </h3>
                        <p className="text-purple-800">£{event.ticketPrice}</p>
                        {event.isTournament && (
                          <p className="text-xs text-purple-500 mt-0.5">
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
                        <h3 className="font-bold text-lg text-purple-900">Availability</h3>
                        <p className="text-purple-800">
                          {event.ticketsAvailable > 0
                            ? `${event.ticketsAvailable} tickets remaining`
                            : "Sold out"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl shadow-xl border border-white/30 backdrop-blur-md">
              <div className="card-body">
                <h2 className="card-title text-xl text-indigo-700">About This Event</h2>
                <div className="prose max-w-none text-purple-900">
                  <p>{event.longDescription}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Ticket Purchase */}
          <div className="md:col-span-1">
            {!isEventInPast && event.ticketPrice === 0 && !event.isTournament ? (
              <div className="glass-card shadow-xl border border-white/30 backdrop-blur-md rounded-2xl">
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
                  <p className="text-gray-500 text-sm">
                    This event is free to attend. Just show up!
                  </p>
                </div>
              </div>
            ) : !isEventInPast ? (
              <div className="glass-card shadow-xl border border-white/30 backdrop-blur-md rounded-2xl md:sticky md:top-20 hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  <h2 className="card-title text-xl text-pink-700">
                    {event.isTournament ? "Team Registration" : "Purchase Tickets"}
                  </h2>
                  <div className="space-y-4">
                    {event.isTournament && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                        💡 The tournament fee is charged <strong>per player</strong>. Spectators and
                        supporters are welcome to attend for free.
                      </div>
                    )}
                    <div>
                      <label className="block text-md font-medium mb-2 text-purple-700">
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
                        <label className="block text-md font-medium mb-2 text-purple-700">
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
                          <p className="text-sm text-purple-600 mt-1">
                            Total: £{(event.ticketPrice * (parseInt(quantity) || 1)).toFixed(2)}
                          </p>
                        )}
                        {awaitingConfirm && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-sm font-medium text-amber-700 mb-2">
                              ⚠️ You're buying {quantity} tickets — are you sure?
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
                      <button
                        className="btn bg-gradient-to-r from-pink-500 to-purple-600 w-full border-none text-white hover:scale-105 transition-all duration-300 shadow-md rounded-xl"
                        onClick={handleBuyTickets}
                        disabled={isProcessing || event.ticketsAvailable === 0}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Redirecting to payment...
                          </span>
                        ) : event.ticketsAvailable === 0 ? (
                          "Sold Out"
                        ) : event.isTournament ? (
                          "Register & Pay for Team"
                        ) : (
                          "Buy Tickets"
                        )}
                      </button>
                    </div>

                    {/* Stripe badge */}
                    {!event.isTournament && (
                      <p className="text-xs text-center text-gray-400 mt-2">
                        🔒 Secure payment via Stripe
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card bg-red-100/30 shadow-xl border border-red-300/50 rounded-2xl">
                <div className="card-body">
                  <h2 className="card-title text-xl text-red-600">Event Has Ended</h2>
                  <p className="text-red-500">
                    This event has already occurred. Ticket purchases are no longer available.
                  </p>
                </div>
              </div>
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
            }}
            onClose={() => setShowTeamSignup(false)}
          />
        )}

        {/* Back Button */}
        <div className="mt-8 mb-4">
          <button
            className="btn glass border border-purple-300 text-purple-700 hover:bg-purple-100/30 hover:scale-105 transition-all duration-300"
            onClick={handleBack}
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}
