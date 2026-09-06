import { useSyncExternalStore } from "react";
import { getRateLimited, subscribeToRateLimited, setRateLimited } from "../../util/errorUtil";

export default function RateLimitBanner() {
  const rateLimited = useSyncExternalStore(subscribeToRateLimited, getRateLimited);

  if (!rateLimited) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl shadow-lg px-4 py-2.5 text-sm">
        <span>Too many requests — please wait a moment and try again.</span>
        <button
          type="button"
          onClick={() => setRateLimited(false)}
          className="text-amber-600 hover:text-amber-800 font-semibold"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
