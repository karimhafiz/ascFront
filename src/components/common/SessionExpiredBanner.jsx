import React, { useEffect, useState } from "react";
import { subscribeToSessionExpired } from "../../auth/auth";
import FloatingBar from "./FloatingBar";
import { Button } from "../ui";

/**
 * Global, non-blocking notice shown when a background token refresh
 * genuinely fails (the refresh-token cookie itself expired/was revoked).
 * Never navigates the user away — whatever page/form they're on stays put.
 */
export default function SessionExpiredBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeToSessionExpired(() => setVisible(true)), []);

  if (!visible) return null;

  return (
    <FloatingBar
      top="top-4"
      className="flex w-[min(28rem,calc(100%-2rem))] items-center gap-3 rounded-3xl border border-error/20 bg-white/95 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl"
    >
      <p className="flex-1 text-sm text-base-content">
        Your session has expired. Log in again to keep saving changes.
      </p>
      <Button variant="danger" to="/login" className="btn-sm rounded-full">
        Log in
      </Button>
      <button
        type="button"
        aria-label="Dismiss"
        className="btn btn-ghost btn-sm btn-circle"
        onClick={() => setVisible(false)}
      >
        ✕
      </button>
    </FloatingBar>
  );
}
