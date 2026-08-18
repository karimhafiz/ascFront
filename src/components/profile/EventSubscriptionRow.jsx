import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useEventSubscriptionCancelMutation,
  useEventSubscriptionReactivateMutation,
} from "../../hooks/useEventSubscriptionMutation";
import { optimizeCloudinaryUrl, toSlug } from "../../util/util";
import ConfirmModal from "../common/ConfirmModal";
import { formatCurrency, INTERVAL_ADJ } from "./profileHelpers";
import { STRIPE_DOWN_MESSAGE } from "../../util/errorUtil";

export default function EventSubscriptionRow({ subscription, onAction }) {
  const [cancelDone, setCancelDone] = useState(subscription.subscriptionStatus === "cancelled");
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  // Hooks must run unconditionally on every render, so these are declared
  // before the `!event` early return below.
  const cancelMutation = useEventSubscriptionCancelMutation(subscription._id);
  const reactivateMutation = useEventSubscriptionReactivateMutation(subscription._id);

  const event = subscription.eventId;
  if (!event) return null;

  const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const interval = event.subscriptionInterval || "month";

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
      onConfirm: () => {
        setConfirm(null);
        cancelMutation.mutate(undefined, {
          onSuccess: () => {
            setCancelDone(true);
            onAction();
          },
          onError: (err) =>
            showToast(err.status === 502 ? STRIPE_DOWN_MESSAGE : err.message || "Failed to cancel"),
        });
      },
    });
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setCancelDone(false);
        onAction();
      },
      onError: (err) =>
        showToast(err.status === 502 ? STRIPE_DOWN_MESSAGE : err.message || "Failed to reactivate"),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-center">
        {event.images?.[0] ? (
          <img
            src={optimizeCloudinaryUrl(event.images[0])}
            alt={event.title}
            className="w-28 shrink-0 object-cover"
            width="112"
            height="88"
            style={{ minHeight: 88 }}
          />
        ) : (
          <div className="w-16 shrink-0 bg-linear-to-b from-primary to-primary/70 flex items-center justify-center py-6">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        )}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
          <p className="font-semibold text-base-content truncate text-base">{event.title}</p>
          <p className="text-sm text-base-content/50 mt-0.5">
            {event.dayOfWeek && (
              <span>{event.dayOfWeek.charAt(0).toUpperCase() + event.dayOfWeek.slice(1)}s</span>
            )}
            {event.openingTime && <span> · {event.openingTime}</span>}
            {event.city && <span> · {event.city}</span>}
          </p>
          <p className="text-xs text-base-content/50 mt-1 font-mono">
            {INTERVAL_ADJ[interval] || "Monthly"} · £{event.ticketPrice?.toFixed(2)}/{interval}
          </p>
        </div>
        <div className="flex flex-col items-end justify-center px-5 gap-2 shrink-0">
          <span className="text-sm font-semibold text-base-content">
            {formatCurrency(event.ticketPrice)}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              subscription.status === "active" && !cancelDone
                ? "bg-green-50 text-green-700 border-green-200"
                : subscription.status === "past_due"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-orange-50 text-orange-600 border-orange-200"
            }`}
          >
            {subscription.status === "active" && !cancelDone
              ? "✓ Subscribed"
              : subscription.status === "past_due"
                ? "⚠ Payment due"
                : "Cancelled"}
          </span>
        </div>
      </div>

      {/* Enrollment info bar */}
      <div
        className={`px-5 py-2.5 text-xs flex items-center justify-between border-t ${cancelDone ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"}`}
      >
        <div>
          {cancelDone ? (
            <span className="text-orange-600 font-medium">
              Cancelled — access until{" "}
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
              {INTERVAL_ADJ[interval] || "Monthly"} enrollment
              {periodEnd && (
                <span className="text-blue-400 ml-1">
                  · renews{" "}
                  {periodEnd.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </span>
          )}
        </div>
        {cancelDone ? (
          <button
            onClick={handleReactivate}
            disabled={reactivateMutation.isPending}
            className="text-xs text-green-600 hover:text-green-800 font-medium hover:underline transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {reactivateMutation.isPending ? "Reactivating..." : "Reactivate"}
          </button>
        ) : (
          <button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel subscription"}
          </button>
        )}
      </div>

      {/* Footer — view event */}
      <div className="flex items-center justify-end border-t border-base-100 px-5 py-2.5">
        <Link
          to={`/events/${toSlug(event.title, event._id)}`}
          aria-label={`View ${event.title} event`}
          className="text-xs font-medium text-base-content/70 hover:text-base-content flex items-center gap-1 transition-colors"
        >
          View Event
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmText}
        variant={confirm?.variant}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.2s_ease-out]">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
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
