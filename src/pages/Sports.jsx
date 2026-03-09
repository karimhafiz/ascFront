import React, { useState } from "react";
import { useRouteLoaderData, Link } from "react-router-dom";
import RecurringEventsCalendar from "../components/RecurringEventsCalendar";
import EventCard from "../components/EventCard";
import { isAdmin, isModerator } from "../auth/auth";

export default function SportsPage() {
  const { events } = useRouteLoaderData("root");
  const canManage = isAdmin() || isModerator();
  const currentDate = new Date();
  const [successMsg] = useState("");

  const recurringSportsEvents = events.filter(
    (event) => event.typeOfEvent === "Sports" && event.isReoccurring
  );
  const tournaments = events.filter(
    (event) => event.typeOfEvent === "Sports" && !event.isReoccurring
  );
  const upcomingTournaments = tournaments.filter((event) => new Date(event.date) >= currentDate);
  const pastTournaments = tournaments.filter((event) => new Date(event.date) < currentDate);

  return (
    <div className="container mx-auto p-6">

      {canManage && (
        <div className="flex items-center justify-between mb-6 glass-card px-6 py-4 rounded-2xl border border-white/30 shadow-md">
          <p className="text-sm text-purple-700 font-medium">Manage Sports Events</p>
          <Link
            to="/events/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow hover:scale-105 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">Recurring Sports Events</h1>
        <div className="glass-card p-0 md:p-6 transition-all overflow-x-auto rounded-2xl border border-white/30 shadow-xl">
          <RecurringEventsCalendar
            events={recurringSportsEvents}
            calendarClassName="glass-calendar"
          />
        </div>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">Upcoming Tournaments</h1>
        {successMsg && (
          <div className="alert alert-success text-center mb-4 glass-card">{successMsg}</div>
        )}
        {upcomingTournaments.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming tournaments found.</p>
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
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">Past Tournaments</h1>
        {pastTournaments.length === 0 ? (
          <p className="text-center text-gray-500">No past tournaments found.</p>
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