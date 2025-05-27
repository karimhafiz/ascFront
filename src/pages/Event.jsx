import React from "react";
import { useRouteLoaderData } from "react-router-dom";
import EventCard from "../components/EventCard";
import RecurringEventsCalendar from "../components/RecurringEventsCalendar";

export default function EventPage() {
  const { events } = useRouteLoaderData("root");
  // Only show events where typeOfEvent === 'ASC'
  const ascEvents = events.filter((event) => event.typeOfEvent === "ASC");

  const currentDate = new Date();

  const upcomingEvents = ascEvents.filter(
    (event) => new Date(event.date) >= currentDate
  );
  const recurringEvents = ascEvents.filter((event) => event.isReoccurring);

  // past events
  const pastEvents = ascEvents.filter(
    (event) => new Date(event.date) < currentDate
  );

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="glass-card rounded-2xl shadow-xl backdrop-blur-md mb-10 border border-white/30">
          <RecurringEventsCalendar events={recurringEvents} />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Upcoming Events
        </h1>
        {upcomingEvents.length === 0 ? (
          <div className="glass-card p-6 text-center rounded-xl">
            <p className="text-purple-600">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold text-center my-10 text-indigo-700">
          Past Events
        </h1>
        {pastEvents.length === 0 ? (
          <div className="glass-card p-6 text-center rounded-xl">
            <p className="text-purple-600">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
