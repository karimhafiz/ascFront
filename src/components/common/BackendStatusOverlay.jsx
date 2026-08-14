import { useSyncExternalStore } from "react";
import {
  getBackendDown,
  subscribeToBackendDown,
  getDatabaseDown,
  subscribeToDatabaseDown,
} from "../../util/errorUtil";

export default function BackendStatusOverlay() {
  const backendDown = useSyncExternalStore(subscribeToBackendDown, getBackendDown);
  const databaseDown = useSyncExternalStore(subscribeToDatabaseDown, getDatabaseDown);

  if (!backendDown && !databaseDown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-6 w-full max-w-sm animate-scale-in">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner bg-red-50">
            <svg
              className="w-6 h-6 text-red-500"
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

        <h3 className="text-lg font-bold text-base-content text-center mb-2">
          {backendDown ? "Can't reach the server" : "Database unavailable"}
        </h3>
        <p className="text-sm text-base-content/70 text-center leading-relaxed">
          {backendDown
            ? "Our server is temporarily unavailable. We're on it — please try again shortly."
            : "The server is up but can't reach the database right now. Please try again shortly."}
        </p>
      </div>
    </div>
  );
}
