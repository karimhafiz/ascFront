import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../auth/auth";
import { Button } from "../ui";

const INTERVAL_LABELS = { month: "month", year: "year" };
const INTERVAL_ADJ = { month: "Monthly", year: "Yearly" };

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  paid: "bg-blue-100 text-blue-700",
  free: "bg-teal-100 text-teal-700",
  past_due: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS = {
  active: "Active Subscription",
  paid: "Enrolled",
  free: "Enrolled (Free)",
  past_due: "Past Due",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EnrolledPanel({ course, enrollment, onChanged }) {
  const [newParticipant, setNewParticipant] = useState({ name: "", age: "" });
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [addParticipantError, setAddParticipantError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [reactivatingSubscription, setReactivatingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");

  const isCancelled = enrollment.subscriptionStatus === "cancelled";

  useEffect(() => {
    if (!showAddModal) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowAddModal(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showAddModal]);

  const handleAddParticipant = async () => {
    setAddParticipantError("");
    if (!newParticipant.name.trim()) {
      setAddParticipantError("Name is required.");
      return;
    }
    try {
      setAddingParticipant(true);
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}courses/enrollments/${enrollment._id}/add-participant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newParticipant),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add participant");
      setNewParticipant({ name: "", age: "" });
      onChanged();
    } catch (err) {
      setAddParticipantError(err.message);
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleCancelSubscription = async () => {
    setSubscriptionError("");
    setCancellingSubscription(true);
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}courses/enrollments/${enrollment._id}/cancel`,
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
        `${import.meta.env.VITE_DEV_URI}courses/enrollments/${enrollment._id}/reactivate`,
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-base-content">You're Enrolled</h2>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isCancelled
              ? "bg-orange-100 text-orange-700"
              : STATUS_STYLES[enrollment.status] || "bg-base-200 text-base-content"
          }`}
        >
          {isCancelled ? "Cancelled" : STATUS_LABELS[enrollment.status] || enrollment.status}
        </span>
      </div>

      {enrollment.subscriptionId && isCancelled && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
          <p className="font-semibold">You have cancelled your subscription</p>
          <p>
            You'll retain access until the end of your current billing period.
            {enrollment.currentPeriodEnd && (
              <>
                {" "}
                · Access until{" "}
                <span className="font-medium text-orange-600">
                  {formatDate(enrollment.currentPeriodEnd)}
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {enrollment.subscriptionId && !isCancelled && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold">
            {INTERVAL_ADJ[course.billingInterval] || "Monthly"} Subscription
          </span>
          <span>
            £{course.price} / {INTERVAL_LABELS[course.billingInterval] || "month"}
          </span>
          {enrollment.currentPeriodEnd && (
            <span className="text-blue-600">Renews {formatDate(enrollment.currentPeriodEnd)}</span>
          )}
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-base-content mb-1.5">
          Participants ({enrollment.participants?.length || 0})
        </p>
        <div className="flex flex-wrap gap-2">
          {enrollment.participants?.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-base-200/50 rounded-lg px-3 py-1.5 text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-base-content">{p.name}</span>
              {p.age && <span className="text-xs text-base-content/50">({p.age})</span>}
            </div>
          ))}
        </div>
      </div>

      {enrollment.status !== "cancelled" && !isCancelled && (
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Participant
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-base-300/50 pt-4">
        {enrollment.subscriptionId && (
          <>
            {isCancelled ? (
              <Button
                variant="primary"
                onClick={handleReactivateSubscription}
                disabled={reactivatingSubscription}
                className="text-sm"
              >
                {reactivatingSubscription ? "Reactivating..." : "Reactivate Subscription"}
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={handleCancelSubscription}
                disabled={cancellingSubscription}
                className="text-sm"
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
        <Button variant="ghost" to="/profile" className="text-sm">
          Manage in Profile
        </Button>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-base-100 rounded-[1.75rem] shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-base-content">Add Participant</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-base-content/50 hover:text-base-content rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name *"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant((p) => ({ ...p, name: e.target.value }))}
                autoComplete="name"
                className="glass-input text-sm w-full"
              />
              <input
                type="number"
                placeholder="Age"
                min="1"
                value={newParticipant.age}
                onChange={(e) => setNewParticipant((p) => ({ ...p, age: e.target.value }))}
                className="glass-input text-sm w-full"
              />
              {addParticipantError && (
                <p className="text-red-500 text-xs" role="alert">
                  {addParticipantError}
                </p>
              )}
              <Button
                variant="primary"
                onClick={async () => {
                  const nameBefore = newParticipant.name.trim();
                  await handleAddParticipant();
                  if (nameBefore) setShowAddModal(false);
                }}
                disabled={addingParticipant}
                className="w-full text-sm"
              >
                {addingParticipant ? "Adding..." : "+ Add Participant"}
              </Button>
              {course.isSubscription && (
                <p className="text-xs text-base-content/50 text-center">
                  Adding a participant will increase your subscription billing.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
