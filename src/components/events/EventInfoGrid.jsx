import { getNextRecurringDate, capitalize } from "../../util/util";
import { Badge, GlassCard } from "../ui";

export default function EventInfoGrid({ event }) {
  return (
    <GlassCard className="shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl text-base-content">Event Details:</h2>
        {(event.isReoccurring || event.typeOfEvent) && (
          <div className="flex flex-wrap items-center gap-2">
            {event.typeOfEvent && (
              <Badge color={event.typeOfEvent === "Sports" ? "accent" : "primary"}>
                {event.typeOfEvent}
              </Badge>
            )}
            {event.isReoccurring && event.dayOfWeek && (
              <Badge color="secondary">↻ Weekly · {capitalize(event.dayOfWeek)}s</Badge>
            )}
          </div>
        )}
        <div className="space-y-4">
          {event.isReoccurring &&
            (() => {
              const next = getNextRecurringDate(event);
              if (!next) return null;
              return (
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-secondary to-primary text-white p-3 rounded-xl mr-4 shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-base-content">Next Session</h3>
                    <p className="text-base-content/70">
                      {next.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {event.openingTime ? ` · ${event.openingTime}` : ""}
                    </p>
                  </div>
                </div>
              );
            })()}
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-primary to-secondary text-white p-3 rounded-xl mr-4 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content">
                {event.isReoccurring ? "Series" : "Date & Time"}
              </h3>
              <p className="text-base-content/70">
                {event.isReoccurring && event.reoccurringStartDate && event.reoccurringEndDate
                  ? `${new Date(event.reoccurringStartDate).toLocaleDateString()} – ${new Date(event.reoccurringEndDate).toLocaleDateString()}`
                  : `${new Date(event.date).toLocaleDateString()}${event.openingTime ? ", " + event.openingTime : ""}`}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-gradient-to-br from-primary to-secondary text-white p-3 rounded-xl mr-4 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content">Location</h3>
              <p className="text-base-content/70">
                {event.street}, {event.city}, {event.postCode}
              </p>
            </div>
          </div>

          {event.ticketPrice > 0 && (
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-secondary to-primary text-white p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">
                  {event.isTournament ? "Tournament Fee" : "Ticket Price"}
                </h3>
                <p className="text-base-content/70">£{event.ticketPrice}</p>
                {event.isTournament && (
                  <p className="text-xs text-base-content/50 mt-0.5">
                    Per player — spectators enter free
                  </p>
                )}
              </div>
            </div>
          )}

          {event.ticketsAvailable !== undefined && (
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-3 rounded-xl mr-4 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Availability</h3>
                <p className="text-base-content/70">
                  {event.ticketsAvailable > 0
                    ? `${event.ticketsAvailable} tickets remaining`
                    : "Sold out"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
