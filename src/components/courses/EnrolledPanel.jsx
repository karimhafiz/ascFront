import { useState } from "react";
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
  const [newParticipant, setNewParticipant] = useState({ name: "", age: "", email: "" });
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [addParticipantError, setAddParticipantError] = useState("");
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [reactivatingSubscription, setReactivatingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");

  const isCancelled = enrollment.subscriptionStatus === "cancelled";

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
      setNewParticipant({ name: "", age: "", email: "" });
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-600"
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
        <h2 className="text-xl font-bold text-base-content">You're Enrolled</h2>
      </div>

      <span
        className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
          isCancelled
            ? "bg-orange-100 text-orange-700"
            : STATUS_STYLES[enrollment.status] || "bg-base-200 text-base-content"
        }`}
      >
        {isCancelled ? "Cancelled" : STATUS_LABELS[enrollment.status] || enrollment.status}
      </span>

      {enrollment.subscriptionId && isCancelled && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
          <p className="font-semibold mb-1">You have cancelled your subscription</p>
          <p>You'll retain access until the end of your current billing period.</p>
          {enrollment.currentPeriodEnd && (
            <p className="mt-1 font-medium text-orange-600">
              Access until {formatDate(enrollment.currentPeriodEnd)}
            </p>
          )}
        </div>
      )}

      {enrollment.subscriptionId && !isCancelled && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          <p className="font-semibold mb-1">
            {INTERVAL_ADJ[course.billingInterval] || "Monthly"} Subscription
          </p>
          <p>
            £{course.price} / {INTERVAL_LABELS[course.billingInterval] || "month"}
          </p>
          {enrollment.currentPeriodEnd && (
            <p className="mt-1 text-blue-600">Renews {formatDate(enrollment.currentPeriodEnd)}</p>
          )}
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-base-content mb-2">
          Participants ({enrollment.participants?.length || 0})
        </p>
        <div className="space-y-1.5">
          {enrollment.participants?.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-base-200/50 rounded-lg px-3 py-2 text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-base-content truncate">{p.name}</p>
                {p.age && <p className="text-xs text-base-content/50">Age {p.age}</p>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-base-content/50 mt-2">
          To remove a participant, use <span className="font-medium">Manage in Profile</span> below.
        </p>
      </div>

      {enrollment.status !== "cancelled" && !isCancelled && (
        <div className="border-t border-base-300/50 pt-4">
          <p className="text-sm font-semibold text-base-content mb-2">Add Participant</p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Name *"
              value={newParticipant.name}
              onChange={(e) => setNewParticipant((p) => ({ ...p, name: e.target.value }))}
              className="glass-input text-sm py-1.5"
            />
            <input
              type="number"
              placeholder="Age"
              min="1"
              value={newParticipant.age}
              onChange={(e) => setNewParticipant((p) => ({ ...p, age: e.target.value }))}
              className="glass-input text-sm py-1.5"
            />
            {addParticipantError && <p className="text-red-500 text-xs">{addParticipantError}</p>}
            <Button
              variant="primary"
              onClick={handleAddParticipant}
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
      )}

      {enrollment.subscriptionId && (
        <div className="border-t border-base-300/50 pt-4 space-y-2">
          {isCancelled ? (
            <Button
              variant="primary"
              onClick={handleReactivateSubscription}
              disabled={reactivatingSubscription}
              className="w-full text-sm"
            >
              {reactivatingSubscription ? "Reactivating..." : "Reactivate Subscription"}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={handleCancelSubscription}
              disabled={cancellingSubscription}
              className="w-full text-sm"
            >
              {cancellingSubscription ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          )}
          {subscriptionError && (
            <p className="text-red-500 text-xs text-center">{subscriptionError}</p>
          )}
        </div>
      )}

      <Button variant="ghost" to="/profile" className="w-full text-sm">
        Manage in Profile
      </Button>
    </div>
  );
}
