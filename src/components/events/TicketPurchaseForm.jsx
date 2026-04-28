import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseJwt, getAuthToken, fetchWithAuth, isAuthenticated } from "../../auth/auth";
import { Button, GlassCard, Spinner } from "../ui";

const INTERVAL_LABELS = { week: "week", month: "month" };

export default function TicketPurchaseForm({ event, eventId, onTournamentSignup, isModal }) {
  const isSubscription = event.isReoccurring && event.stripePriceId && event.ticketPrice > 0;
  const loggedIn = isAuthenticated();
  const navigate = useNavigate();
  const requiresAuth = isSubscription || event.isTournament;

  const [quantity, setQuantity] = useState("1");
  const [email, setEmail] = useState(() => {
    const token = getAuthToken();
    if (!token) return "";
    const payload = parseJwt(token);
    return payload?.email || "";
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const handleBuyTickets = async () => {
    setBuyError("");
    setAwaitingConfirm(false);

    if (event.isTournament) {
      if (!email) {
        setBuyError("Please enter your email to proceed.");
        return;
      }
      onTournamentSignup(email);
      return;
    }

    if (isSubscription && !loggedIn) {
      setBuyError("Please log in or create an account to subscribe.");
      return;
    }

    if (!isSubscription && parseInt(quantity) > 5 && !awaitingConfirm) {
      setAwaitingConfirm(true);
      return;
    }

    if (!email) {
      setBuyError("Please enter your email to proceed.");
      return;
    }

    if (!isSubscription && (!quantity || parseInt(quantity) < 1)) {
      setBuyError("Please select at least 1 ticket.");
      return;
    }

    try {
      setIsProcessing(true);

      const payload = {
        eventId,
        email,
        quantity: isSubscription ? 1 : parseInt(quantity) || 1,
      };

      let response;
      if (loggedIn) {
        response = await fetchWithAuth(
          `${import.meta.env.VITE_DEV_URI}payments/create-checkout-session`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(`${import.meta.env.VITE_DEV_URI}payments/guest-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setBuyError(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const interval = INTERVAL_LABELS[event.subscriptionInterval] || "month";

  const authLabel = event.isTournament ? "Log in to register your team" : "Log in to subscribe";

  const content = (
    <div className="card-body">
      {!isModal && (
        <h2 className="card-title text-xl text-base-content">
          {event.isTournament
            ? "Team Registration"
            : isSubscription
              ? "Subscribe"
              : "Purchase Tickets"}
        </h2>
      )}
      <div className="space-y-4">
        {event.isTournament && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            The tournament fee is a <strong>one-off team payment</strong> made by the team manager.
            Spectators and supporters are welcome to attend for free.
          </div>
        )}

        {isSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            <p className="font-semibold mb-1">Recurring {interval}ly subscription</p>
            <p>
              £{event.ticketPrice.toFixed(2)} / {interval} — cancel anytime from your profile.
            </p>
          </div>
        )}

        {/* Auth-required flows: show login CTA instead of form */}
        {requiresAuth && !loggedIn ? (
          <>
            <p className="text-sm text-base-content/70 text-center">
              {event.isTournament
                ? "You need an account to register a team."
                : "You need an account to manage your subscription."}
            </p>
            <Button variant="primary" className="w-full" onClick={() => navigate("/login")}>
              {authLabel}
            </Button>
            <p className="text-xs text-center text-base-content/50">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <div>
              <label
                htmlFor="ticket-email"
                className="block text-md font-medium mb-2 text-base-content"
              >
                Your Email:
              </label>
              <div className={loggedIn ? "relative" : ""}>
                <input
                  id="ticket-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loggedIn}
                  className="glass-input"
                  style={loggedIn ? { paddingRight: "2.5rem" } : undefined}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
                {loggedIn && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
                    title="Using your account email"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
              {!loggedIn && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 text-xs text-amber-700">
                  <p className="font-semibold mb-0.5">Double-check your email</p>
                  <p>
                    Your tickets and receipt will be sent to this address. This cannot be changed
                    after purchase.
                  </p>
                </div>
              )}
            </div>

            {!event.isTournament && !isSubscription && (
              <div>
                <label
                  htmlFor="ticket-quantity"
                  className="block text-md font-medium mb-2 text-base-content"
                >
                  Ticket Quantity:
                </label>
                <input
                  id="ticket-quantity"
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
                        className="flex-1 text-sm py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        onClick={handleBuyTickets}
                        className="flex-1 text-sm py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all font-medium cursor-pointer"
                      >
                        Yes, continue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {buyError && (
              <p className="text-red-500 text-sm bg-red-50/50 rounded-xl p-2" role="alert">
                {buyError}
              </p>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleBuyTickets}
                disabled={isProcessing || (!isSubscription && event.ticketsAvailable === 0)}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" />
                    <span className="ml-3">Redirecting to payment...</span>
                  </span>
                ) : !isSubscription && event.ticketsAvailable === 0 ? (
                  "Sold Out"
                ) : event.isTournament ? (
                  "Register & Pay for Team"
                ) : isSubscription ? (
                  `Subscribe £${event.ticketPrice.toFixed(2)}/${interval}`
                ) : (
                  "Buy Tickets"
                )}
              </Button>
            </div>

            {!event.isTournament && (
              <p className="text-xs text-center text-base-content/50 mt-2">
                Secure payment via Stripe
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (isModal) return content;

  return (
    <GlassCard className="rounded-[1.75rem] shadow-xl h-full md:sticky md:top-20 hover:shadow-2xl transition-all duration-300">
      {content}
    </GlassCard>
  );
}
