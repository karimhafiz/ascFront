import React, { useEffect, useState } from "react";
import { subscribeToSessionExpired } from "../../auth/auth";
import { Button } from "../ui";

/**
 * Global, non-blocking notice shown when a background token refresh
 * genuinely fails (the refresh-token cookie itself expired/was revoked).
 * Never navigates the user away — whatever page/form they're on stays put.
 *
 * Fixed to the bottom-right corner (not FloatingBar's reserved-space top bar)
 * so it never collides with ManageHeader's admin/moderator-only top bar,
 * which would otherwise stack inconsistently depending on the viewer's role.
 */
export default function SessionExpiredBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeToSessionExpired(() => setVisible(true)), []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] animate-fadeIn">
      <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-white/95 p-4 shadow-(--shadow-soft) backdrop-blur-xl">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-base-content">Session expired</p>
          <p className="mt-1 text-sm text-base-content/70">Log in again to continue.</p>
          <Button variant="danger" to="/login" className="btn-sm mt-3 rounded-full">
            Log in
          </Button>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="btn btn-ghost btn-sm btn-circle shrink-0"
          onClick={() => setVisible(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
