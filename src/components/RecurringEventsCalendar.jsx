import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

import { generateRecurringEvents } from "../util/util";

// Set the moment locale to start the week on Monday
moment.updateLocale("en", {
  week: {
    dow: 1, // Set Monday as the first day of the week (0 = Sunday, 1 = Monday)
  },
});

const localizer = momentLocalizer(moment);

export default function RecurringEventsCalendar({ events }) {
  const navigate = useNavigate();

  // Generate all occurrences for recurring events
  const allRecurringEvents = events.flatMap((event) =>
    generateRecurringEvents(event)
  );

  // Map events to the format required by react-big-calendar
  const calendarEvents = allRecurringEvents.map((event) => ({
    title: event.title,
    start: new Date(event.date), // Start date of the event
    end: new Date(event.date), // End date of the event (same as start for single-day events)
    allDay: true, // Set to true for all-day events
    ...event, // Include the rest of the event data for use in the event handler
  }));

  const handleSelectEvent = (event) => {
    // Navigate to the event details page
    navigate(`/events/${event._id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Recurring Events</h1>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent} // Navigate to event details on click
        views={["month"]} // Show only the month view
        popup // Show a popup when clicking on a day with multiple events
        dayLayoutAlgorithm="no-overlap"
      />
    </div>
  );
}
