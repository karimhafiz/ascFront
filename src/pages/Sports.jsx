import React from "react";
import { useRouteLoaderData } from "react-router-dom";
import RecurringEventsCalendar from "../components/RecurringEventsCalendar";
import EventCard from "../components/EventCard";
import { useState } from "react";

export default function SportsPage() {
  const { events } = useRouteLoaderData("root");
  const currentDate = new Date();
  const [successMsg, setSuccessMsg] = useState("");

  // Recurring sports events (typeOfEvent === 'Sports' and isReoccurring)
  const recurringSportsEvents = events.filter(
    (event) => event.typeOfEvent === "Sports" && event.isReoccurring
  );

  // Tournaments (typeOfEvent === 'Sports' and !isReoccurring)
  const tournaments = events.filter(
    (event) => event.typeOfEvent === "Sports" && !event.isReoccurring
  );

  const upcomingTournaments = tournaments.filter(
    (event) => new Date(event.date) >= currentDate
  );
  const pastTournaments = tournaments.filter(
    (event) => new Date(event.date) < currentDate
  );

  return (
    <div className="container mx-auto p-6">
      {/* Recurring Sports Events Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Recurring Sports Events
        </h1>
        <div className="glass-card p-0 md:p-6 transition-all overflow-x-auto rounded-2xl border border-white/30 shadow-xl">
          <RecurringEventsCalendar
            events={recurringSportsEvents}
            calendarClassName="glass-calendar"
          />
        </div>
      </div>

      {/* Tournaments Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Upcoming Tournaments
        </h1>
        {successMsg && (
          <div className="alert alert-success text-center mb-4 glass-card">
            {successMsg}
          </div>
        )}
        {upcomingTournaments.length === 0 ? (
          <p className="text-center text-gray-500">
            No upcoming tournaments found.
          </p>
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
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Past Tournaments
        </h1>
        {pastTournaments.length === 0 ? (
          <p className="text-center text-gray-500">
            No past tournaments found.
          </p>
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
