import { useRouteLoaderData } from "react-router-dom";
import EventCard from "../components/EventCard";
import RecurringEventsCalendar from "../components/RecurringEventsCalendar";

export default function EventPage() {
  const { events } = useRouteLoaderData("root");
  // upcoming events

  const currentDate = new Date();

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= currentDate
  );
  const recurringEvents = events.filter((event) => event.isReoccurring);

  // past events
  const pastEvents = events.filter(
    (event) => new Date(event.date) < currentDate
  );
  return (
    <div className="container mx-auto p-6">
      <div className="container mx-auto p-6">
        <RecurringEventsCalendar events={recurringEvents} />
      </div>
      <h1 className="text-3xl font-bold text-center mb-6">Upcoming Events</h1>
      {upcomingEvents.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-6">Past Events</h1>
      {pastEvents.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
