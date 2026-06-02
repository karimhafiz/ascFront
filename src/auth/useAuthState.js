import { useState, useEffect } from "react";
import { subscribeToAuth } from "./auth";

/**
 * Re-renders the calling component whenever auth state changes
 * (login, logout, token refresh).
 */
export function useAuthState() {
  const [, rerender] = useState(0);
  useEffect(() => subscribeToAuth(() => rerender((n) => n + 1)), []);
}
