import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useEnrollmentCancelMutation,
  useEnrollmentEditParticipantMutation,
  useEnrollmentReactivateMutation,
  useEnrollmentRemoveParticipantMutation,
  useEnrollmentUpdatePhoneMutation,
} from "../../hooks/useEnrollmentMutation";
import { optimizeCloudinaryUrl, toSlug, validatePhone } from "../../util/util";
import ConfirmModal from "../common/ConfirmModal";
import { formatCurrency, INTERVAL_ADJ, CATEGORY_COLORS } from "./profileHelpers";

export default function EnrollmentRow({ enrollment, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelDone, setCancelDone] = useState(enrollment.subscriptionStatus === "cancelled");
  const [participants, setParticipants] = useState(enrollment.participants || []);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", age: "" });
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(enrollment.buyerPhone || "");
  const [phoneError, setPhoneError] = useState("");
  const [currentPhone, setCurrentPhone] = useState(enrollment.buyerPhone || "");

  // Hooks must run unconditionally on every render, so these are declared
  // before the `!course` early return below.
  const savePhoneMutation = useEnrollmentUpdatePhoneMutation(enrollment._id);
  const cancelMutation = useEnrollmentCancelMutation(enrollment._id);
  const reactivateMutation = useEnrollmentReactivateMutation(enrollment._id);
  const removeParticipantMutation = useEnrollmentRemoveParticipantMutation(enrollment._id);
  const editParticipantMutation = useEnrollmentEditParticipantMutation(enrollment._id);

  const course = enrollment.courseId;
  if (!course) return null;
  const gradient = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;
  const hasParticipants = participants.length > 0;
  const isSubscription = !!enrollment.subscriptionId;
  const periodEnd = enrollment.currentPeriodEnd ? new Date(enrollment.currentPeriodEnd) : null;

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSavePhone = () => {
    setPhoneError("");
    if (!phoneValue.trim()) {
      setPhoneError("Phone number is required.");
      return;
    }
    if (!validatePhone(phoneValue)) {
      setPhoneError("Please enter a valid UK phone number.");
      return;
    }
    const phone = phoneValue.trim();
    savePhoneMutation.mutate(phone, {
      onSuccess: () => {
        setCurrentPhone(phone);
        setEditingPhone(false);
        showToast("Phone number updated", "success");
        onAction?.();
      },
      onError: (err) => setPhoneError(err.message),
    });
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
            onAction?.();
          },
          onError: (err) => showToast(err.message || "Failed to cancel"),
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
        onAction?.();
      },
      onError: (err) => showToast(err.message || "Failed to reactivate"),
    });
  };

  const handleRemoveParticipant = (index) => {
    const name = participants[index]?.name || "this participant";
    setConfirm({
      title: "Remove participant",
      message: `Remove ${name} from this course? This cannot be undone.`,
      confirmText: "Remove",
      variant: "danger",
      onConfirm: () => {
        setConfirm(null);
        removeParticipantMutation.mutate(
          { index, participantId: participants[index]._id },
          {
            onSuccess: (data) => {
              setParticipants(data.participants);
              onAction?.();
            },
            onError: (err) => showToast(err.message || "Failed to remove participant"),
          }
        );
      },
    });
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setEditForm({ name: p.name || "", age: p.age || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", age: "" });
  };

  const handleSaveEdit = (participantId) => {
    if (!editForm.name.trim()) {
      showToast("Name cannot be empty");
      return;
    }
    editParticipantMutation.mutate(
      {
        participantId,
        name: editForm.name.trim(),
        age: editForm.age ? Number(editForm.age) : undefined,
      },
      {
        onSuccess: (data) => {
          setParticipants(data.participants);
          setEditingId(null);
          showToast("Participant updated", "success");
          onAction?.();
        },
        onError: (err) => showToast(err.message || "Failed to update participant"),
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-center">
        {course.images?.[0] ? (
          <img
            src={optimizeCloudinaryUrl(course.images[0])}
            alt={course.title}
            className="w-28 shrink-0 object-cover"
            width="112"
            height="88"
            style={{ minHeight: 88 }}
          />
        ) : (
          <div
            className={`w-16 shrink-0 bg-linear-to-b ${gradient} flex items-center justify-center py-6`}
          >
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center min-w-0">
          <p className="font-semibold text-base-content truncate text-base">{course.title}</p>
          <p className="text-sm text-base-content/50 mt-0.5">
            {course.instructor && <span>{course.instructor}</span>}
            {course.city && <span> · {course.city}</span>}
          </p>
          {course.schedule && (
            <p className="text-xs text-base-content/50 mt-1">{course.schedule}</p>
          )}
          <p className="text-xs text-base-content/50 mt-1 font-mono">
            {enrollment.enrollmentCode ?? enrollment._id.slice(-8).toUpperCase()}
            {" · "}
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
            {isSubscription && ` · ${INTERVAL_ADJ[course.billingInterval] || "Monthly"}`}
            {currentPhone && ` · ${currentPhone}`}
          </p>
        </div>
        <div className="flex flex-col items-end justify-center px-5 gap-2 shrink-0">
          <span className="text-sm font-semibold text-base-content">
            {course.price > 0 ? formatCurrency(course.price * participants.length) : "Free"}
          </span>
          {course.price > 0 && participants.length > 1 && (
            <span className="text-[10px] text-base-content/50">
              {formatCurrency(course.price)} x {participants.length}
            </span>
          )}
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              enrollment.status === "active"
                ? "bg-green-50 text-green-700 border-green-200"
                : enrollment.status === "paid"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : enrollment.status === "free"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : enrollment.status === "cancelled"
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : enrollment.status === "past_due"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-base-100 text-base-content/50 border-base-300"
            }`}
          >
            {enrollment.status === "active"
              ? "✓ Subscribed"
              : enrollment.status === "paid"
                ? "✓ Enrolled"
                : enrollment.status === "free"
                  ? "✓ Free"
                  : enrollment.status === "cancelled"
                    ? "Cancelled"
                    : enrollment.status === "past_due"
                      ? "⚠ Payment due"
                      : enrollment.status}
          </span>
        </div>
      </div>

      {/* Enrollment info bar */}
      {isSubscription && (
        <div
          className={`px-5 py-2.5 text-xs flex items-center justify-between border-t ${cancelDone ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"}`}
        >
          <div>
            {cancelDone ? (
              <span className="text-orange-600 font-medium">
                ⏳ Cancelled — access until{" "}
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
                🔄 {INTERVAL_ADJ[course.billingInterval] || "Monthly"} subscription
                {periodEnd && (
                  <span className="text-blue-400 ml-1">
                    · renews{" "}
                    {periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
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
              {cancelMutation.isPending ? "Cancelling..." : "Cancel enrollment"}
            </button>
          )}
        </div>
      )}

      {/* Phone edit */}
      <div className="px-5 py-2.5 border-t border-base-100">
        {editingPhone ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-base-content/70">Phone</label>
            <input
              type="tel"
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
              className="input input-sm input-bordered w-full text-xs"
              placeholder="Phone (07...)"
              autoComplete="tel"
            />
            {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSavePhone}
                disabled={savePhoneMutation.isPending}
                className="btn btn-xs btn-primary text-[10px]"
              >
                {savePhoneMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditingPhone(false);
                  setPhoneValue(currentPhone);
                  setPhoneError("");
                }}
                className="btn btn-xs btn-ghost text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/50">Phone: {currentPhone || "Not set"}</span>
            {!cancelDone && (
              <button
                onClick={() => setEditingPhone(true)}
                className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer"
              >
                {currentPhone ? "Edit" : "Add"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer — participants toggle + view course */}
      <div className="flex items-center justify-between border-t border-base-100 px-5 py-2.5">
        {hasParticipants ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-base-content/70 hover:text-base-content transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
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
            {expanded
              ? "Hide participants"
              : `${participants.length} participant${participants.length !== 1 ? "s" : ""}`}
          </button>
        ) : (
          <span className="text-xs text-base-content/50">No participants recorded</span>
        )}
        <Link
          to={`/courses/${toSlug(course.title, course._id)}`}
          aria-label={`View ${course.title} course`}
          className="text-xs font-medium text-base-content/70 hover:text-base-content flex items-center gap-1 transition-colors"
        >
          View Course
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Participants list */}
      {expanded && hasParticipants && (
        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {participants.map((p, i) =>
            editingId === p._id ? (
              <div
                key={p._id || i}
                className="flex flex-col gap-1.5 bg-base-100 rounded-xl px-3 py-2"
              >
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Name"
                  className="input input-xs input-bordered w-full text-xs"
                />
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  placeholder="Age"
                  className="input input-xs input-bordered w-20 text-xs"
                />
                <div className="flex gap-1.5 justify-end">
                  <button
                    onClick={cancelEdit}
                    disabled={editParticipantMutation.isPending}
                    className="btn btn-xs btn-ghost text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(p._id)}
                    disabled={editParticipantMutation.isPending}
                    className="btn btn-xs btn-primary text-[10px]"
                  >
                    {editParticipantMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={p._id || i}
                className="flex items-center gap-2.5 bg-base-100 rounded-xl px-3 py-2 group/participant"
              >
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary to-primary/70 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {p.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => !cancelDone && startEdit(p)}
                  title="Click to edit"
                >
                  <p className="text-xs font-medium text-base-content truncate">{p.name}</p>
                  <div className="flex gap-2 text-[10px] text-base-content/50">
                    {p.age && <span>Age {p.age}</span>}
                    {p.email && <span className="truncate">{p.email}</span>}
                  </div>
                </div>
                {!cancelDone && (
                  <button
                    onClick={() => startEdit(p)}
                    title={`Edit ${p.name}`}
                    className="opacity-0 group-hover/participant:opacity-100 transition-opacity text-base-content/40 hover:text-primary shrink-0 cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                )}
                {participants.length > 1 && !cancelDone && (
                  <button
                    onClick={() => handleRemoveParticipant(i)}
                    disabled={removeParticipantMutation.isPending}
                    title={`Remove ${p.name}`}
                    className="opacity-0 group-hover/participant:opacity-100 transition-opacity text-red-400 hover:text-red-600 disabled:opacity-30 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {removeParticipantMutation.isPending &&
                    removeParticipantMutation.variables?.index === i ? (
                      <div className="w-4 h-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}

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

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.2s_ease-out]">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {toast.type === "error" ? (
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 shrink-0"
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
            )}
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
