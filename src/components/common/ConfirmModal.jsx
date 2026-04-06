import React from "react";
import { Button } from "../ui";

/**
 * Themed confirmation modal.
 *
 * Props:
 *   isOpen    {boolean}  — whether the modal is visible
 *   title     {string}   — bold heading
 *   message   {string}   — body text
 *   confirmLabel {string} — confirm button label (default "Confirm")
 *   onConfirm {fn}       — called when the user clicks confirm
 *   onCancel  {fn}       — called when the user clicks cancel or the backdrop
 */
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-6 w-full max-w-sm animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center shadow-inner">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-lg font-bold text-base-content text-center mb-2">{title}</h3>
        {message && (
          <p className="text-sm text-base-content/70 text-center leading-relaxed mb-6">{message}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 rounded-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1 rounded-full" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
