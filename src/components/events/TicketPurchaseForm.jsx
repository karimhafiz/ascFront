import { useState } from "react";
import { parseJwt, getAuthToken, fetchWithAuth } from "../../auth/auth";
import { Button, GlassCard, Spinner } from "../ui";

export default function TicketPurchaseForm({ event, eventId, onTournamentSignup }) {
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

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setBuyError(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <GlassCard className="shadow-xl md:sticky md:top-20 hover:shadow-2xl transition-all duration-300">
      <div className="card-body">
        <h2 className="card-title text-xl text-base-content">
          {event.isTournament ? "Team Registration" : "Purchase Tickets"}
        </h2>
        <div className="space-y-4">
          {event.isTournament && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              The tournament fee is charged <strong>per player</strong>. Spectators and supporters
              are welcome to attend for free.
            </div>
          )}
          <div>
            <label className="block text-md font-medium mb-2 text-base-content">Your Email:</label>
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

          {!event.isTournament && (
            <p className="text-xs text-center text-base-content/50 mt-2">
              Secure payment via Stripe
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
