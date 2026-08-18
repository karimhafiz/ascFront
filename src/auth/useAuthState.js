import { useSyncExternalStore } from "react";
import { subscribeToAuth, getAuthVersion } from "./auth";

/**
 * Re-renders the calling component whenever auth state changes
 * (login, logout, token refresh).
 */
export function useAuthState() {
  useSyncExternalStore(subscribeToAuth, getAuthVersion);
}
