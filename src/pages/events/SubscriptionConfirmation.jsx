import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui";
import { toSlug } from "../../util/util";

const INTERVAL_ADJ = { week: "weekly", month: "monthly" };

export default function SubscriptionConfirmation() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const isReactivated = searchParams.get("reactivated") === "true";

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}events/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!eventId,
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-3xl font-bold text-base-content">
            {isReactivated ? "Subscription Reactivated!" : "Subscription Confirmed!"}
          </h1>
          <p className="text-base-content/70 mt-2">
            {isReactivated
              ? "Your subscription is no longer cancelled. You're all set."
              : "Payment received. Your subscription is now active."}
          </p>
          {!isLoading && event?.isReoccurring && !isReactivated && (
            <p className="text-base-content/50 text-sm mt-1">
              Your {INTERVAL_ADJ[event.subscriptionInterval] || "monthly"} subscription is now
              active. Manage it anytime from your profile.
            </p>
          )}
        </div>

        {!isLoading && event && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
            <h2 className="text-lg font-bold text-base-content mb-3">{event.title}</h2>
            <div className="space-y-1.5 text-sm text-base-content/70">
              {event.dayOfWeek && (
                <p>
                  <span className="font-semibold">Day:</span>{" "}
                  {event.dayOfWeek.charAt(0).toUpperCase() + event.dayOfWeek.slice(1)}s
                </p>
              )}
              {event.openingTime && (
                <p>
                  <span className="font-semibold">Time:</span> {event.openingTime}
                </p>
              )}
              {event.city && (
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {[event.street, event.city].filter(Boolean).join(", ")}
                </p>
              )}
              {event.ticketPrice > 0 && (
                <p>
                  <span className="font-semibold">Price:</span> £{event.ticketPrice.toFixed(2)} /{" "}
                  {event.subscriptionInterval || "month"}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
          <h2 className="text-lg font-bold text-base-content mb-3">What's Next?</h2>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li className="flex items-start gap-2">
              <span className="text-base-content/50 mt-0.5">•</span> Check your email for
              confirmation details
            </li>
            <li className="flex items-start gap-2">
              <span className="text-base-content/50 mt-0.5">•</span> You can attend all upcoming
              sessions while your subscription is active
            </li>
            <li className="flex items-start gap-2">
              <span className="text-base-content/50 mt-0.5">•</span> Manage or cancel your
              subscription from your profile anytime
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" to="/profile" className="flex-1">
            View My Profile
          </Button>
          <Button
            variant="secondary"
            to={event ? `/events/${toSlug(event.title, eventId)}` : "/events"}
            className="flex-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Event
          </Button>
        </div>
      </div>
    </div>
  );
}
