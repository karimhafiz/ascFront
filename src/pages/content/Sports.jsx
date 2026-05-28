import React, { useState } from "react";
import RecurringEventsCalendar from "../../components/events/RecurringEventsCalendar";
import EventCard from "../../components/events/EventCard";
import { useEvents } from "../../hooks/useEvents";
import { Spinner } from "../../components/ui";

export default function SportsPage() {
  const { data: events = [], isLoading } = useEvents();
  const currentDate = new Date();
  const [successMsg] = useState("");

  // Recurring sports events (typeOfEvent === 'Sports' and isReoccurring)
  const allSportsEvents = events.filter((event) => event.typeOfEvent === "Sports");

  // Non-recurring sports events shown as cards (tournaments etc.)
  const tournaments = allSportsEvents.filter((event) => !event.isReoccurring);

  const upcomingTournaments = tournaments.filter((event) => new Date(event.date) >= currentDate);
  const pastTournaments = tournaments.filter((event) => new Date(event.date) < currentDate);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Recurring Sports Events Section */}
      <div className="mb-10">
        <div className="glass-card p-2 sm:p-4 md:p-6 transition-all overflow-x-auto rounded-2xl border border-white/30 shadow-xl">
          <RecurringEventsCalendar
            events={allSportsEvents}
            title="Sports Events Calendar"
            calendarClassName="glass-calendar"
          />
        </div>
      </div>

      {/* Tournaments Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-base-content">
          Upcoming Tournaments
        </h1>
        {successMsg && (
          <div className="alert alert-success text-center mb-4 glass-card">{successMsg}</div>
        )}
        {upcomingTournaments.length === 0 ? (
          <p className="text-center text-base-content/50">No upcoming tournaments found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTournaments.map((event) => (
              <div key={event._id} className="glass-card transition-all">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-center mb-6 text-base-content">Past Tournaments</h1>
        {pastTournaments.length === 0 ? (
          <p className="text-center text-base-content/50">No past tournaments found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastTournaments.map((event) => (
              <div key={event._id} className="glass-card transition-all">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
