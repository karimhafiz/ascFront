import { useState } from "react";
import { fetchWithAuth } from "../../auth/auth";
import { Button } from "../ui";

const INTERVAL_LABELS = { week: "week", month: "month" };
const INTERVAL_ADJ = { week: "Weekly", month: "Monthly" };

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  past_due: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS = {
  active: "Active Subscription",
  past_due: "Past Due",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SubscribedPanel({ event, subscription, onChanged }) {
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [reactivatingSubscription, setReactivatingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");

  const isCancelled = subscription.subscriptionStatus === "cancelled";
  const interval = INTERVAL_LABELS[event.subscriptionInterval] || "month";

  const handleCancelSubscription = async () => {
    setSubscriptionError("");
    setCancellingSubscription(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}events/subscriptions/${subscription._id}/cancel`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel subscription");
      onChanged();
    } catch (err) {
      setSubscriptionError(err.message);
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setSubscriptionError("");
    setReactivatingSubscription(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}events/subscriptions/${subscription._id}/reactivate`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reactivate subscription");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      onChanged();
    } catch (err) {
      setSubscriptionError(err.message);
    } finally {
      setReactivatingSubscription(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-5">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-lg font-bold text-base-content">You're Subscribed</h2>

      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          isCancelled
            ? "bg-orange-100 text-orange-700"
            : STATUS_STYLES[subscription.status] || "bg-base-200 text-base-content"
        }`}
      >
        {isCancelled ? "Cancelled" : STATUS_LABELS[subscription.status] || subscription.status}
      </span>

      {subscription.subscriptionId && isCancelled && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700 w-full">
          <p className="font-semibold">Subscription cancelled</p>
          <p className="mt-1">
            Access until{" "}
            {subscription.currentPeriodEnd ? (
              <span className="font-medium text-orange-600">
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            ) : (
              "end of billing period"
            )}
          </p>
        </div>
      )}

      {subscription.subscriptionId && !isCancelled && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 w-full space-y-1">
          <p className="font-semibold">
            {INTERVAL_ADJ[event.subscriptionInterval] || "Monthly"} Subscription
          </p>
          <p>
            £{event.ticketPrice.toFixed(2)} / {interval}
          </p>
          {subscription.currentPeriodEnd && (
            <p className="text-blue-600">Renews {formatDate(subscription.currentPeriodEnd)}</p>
          )}
        </div>
      )}

      <div className="w-full border-t border-base-300/50 pt-4 space-y-3">
        {subscription.subscriptionId && (
          <>
            {isCancelled ? (
              <Button
                variant="primary"
                onClick={handleReactivateSubscription}
                disabled={reactivatingSubscription}
                className="text-sm w-full"
              >
                {reactivatingSubscription ? "Reactivating..." : "Reactivate Subscription"}
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={handleCancelSubscription}
                disabled={cancellingSubscription}
                className="text-sm w-full"
              >
                {cancellingSubscription ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            )}
            {subscriptionError && (
              <p className="text-red-500 text-xs" role="alert">
                {subscriptionError}
              </p>
            )}
          </>
        )}
        <Button variant="ghost" to="/profile" className="text-sm w-full">
          Manage in Profile
        </Button>
      </div>
    </div>
  );
}
