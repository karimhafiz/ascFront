import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

import { generateRecurringEvents } from "../util/util";

// Custom toolbar component for better styling
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.date.setMonth(toolbar.date.getMonth() - 1);
    toolbar.onNavigate("prev");
  };

  const goToNext = () => {
    toolbar.date.setMonth(toolbar.date.getMonth() + 1);
    toolbar.onNavigate("next");
  };

  const goToCurrent = () => {
    const now = new Date();
    toolbar.date.setMonth(now.getMonth());
    toolbar.date.setYear(now.getFullYear());
    toolbar.onNavigate("current");
  };

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <span className="font-semibold text-purple-800 text-lg">
        {date.format("MMMM")}{" "}
        <span className="font-normal">{date.format("YYYY")}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={goToBack}
          className="btn btn-sm bg-white/60 hover:bg-pink-100/80 border-pink-200/50 text-pink-600 hover:text-pink-700 rounded-xl px-4 hover:scale-105 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Prev
        </button>
        <button
          onClick={goToCurrent}
          className="btn btn-sm bg-purple-100/60 hover:bg-purple-200/60 border-purple-200/50 text-purple-600 hover:text-purple-700 rounded-xl px-4 hover:scale-105 transition-all duration-300"
        >
          Today
        </button>
        <button
          onClick={goToNext}
          className="btn btn-sm bg-white/60 hover:bg-pink-100/80 border-pink-200/50 text-pink-600 hover:text-pink-700 rounded-xl px-4 hover:scale-105 transition-all duration-300"
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="text-center px-4 py-1">{label()}</div>
      <div className="flex items-center space-x-2">
        {toolbar.views.map((view) => (
          <button
            key={view}
            onClick={() => toolbar.onView(view)}
            className={`btn btn-sm ${
              view === toolbar.view
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none"
                : "bg-white/60 hover:bg-indigo-100/60 border-indigo-200/50 text-indigo-600"
            } rounded-xl px-4 hover:scale-105 transition-all duration-300`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

// Set the moment locale to start the week on Monday
moment.updateLocale("en", {
  week: {
    dow: 1, // Set Monday as the first day of the week (0 = Sunday, 1 = Monday)
  },
});

const localizer = momentLocalizer(moment);

export default function RecurringEventsCalendar({ events }) {
  const navigate = useNavigate();

  // Only generate occurrences for recurring events
  const recurringEvents = events.filter((event) => event.isReoccurring);
  const allRecurringEvents = recurringEvents.flatMap((event) =>
    generateRecurringEvents(event)
  );

  // Map events to the format required by react-big-calendar
  const calendarEvents = allRecurringEvents.map((event) => ({
    ...event,
    title: event.street
      ? `${event.title} - ${event.street} ${event.openingTime}`
      : event.title, // Title of the event
    start: new Date(event.date), // Start date of the event
    end: new Date(event.date), // End date of the event (same as start for single-day events)
    allDay: true, // Set to true for all-day events
    // Include the rest of the event data for use in the event handler
  }));
  const dayPropGetter = (date) => {
    const isToday = moment().isSame(date, "day");
    const isCurrentMonth = moment(date).month() === moment().month();
    const hasEvent = calendarEvents.some((event) =>
      moment(event.start).isSame(date, "day")
    );

    // Base styles all days will have
    const baseStyle = {
      transition: "all 0.2s ease",
      borderRadius: "0.75rem",
      margin: "1px",
      height: "calc(100% - 2px)",
    };

    if (isToday) {
      return {
        style: {
          ...baseStyle,
          backgroundColor: "rgba(243, 232, 255, 0.7)", // light lavender
          border: "2px solid #f9a8d4", // pink border
          boxShadow: "0 4px 12px rgba(249, 168, 212, 0.25)",
        },
        className: "today-cell",
      };
    }

    if (hasEvent) {
      return {
        style: {
          ...baseStyle,
          backgroundColor: "rgba(233, 213, 255, 0.3)", // very light purple
          border: "1px solid rgba(233, 213, 255, 0.5)",
        },
        className: "event-day-cell",
      };
    }

    if (!isCurrentMonth) {
      return {
        style: {
          ...baseStyle,
          backgroundColor: "rgba(249, 250, 251, 0.2)", // very faint gray
          color: "#a1a1aa", // muted text
        },
        className: "non-month-cell",
      };
    }

    // Default style for current month days without events
    return {
      style: {
        ...baseStyle,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(4px)",
      },
      className: "normal-cell",
    };
  };
  const eventStyleGetter = (event) => {
    // Generate a deterministic color based on the event title
    const getEventColor = (title) => {
      const colors = [
        { bg: "rgba(236, 72, 153, 0.85)", shadow: "rgba(236, 72, 153, 0.3)" }, // pink
        { bg: "rgba(147, 51, 234, 0.85)", shadow: "rgba(147, 51, 234, 0.3)" }, // purple
        { bg: "rgba(79, 70, 229, 0.85)", shadow: "rgba(79, 70, 229, 0.3)" }, // indigo
        { bg: "rgba(59, 130, 246, 0.85)", shadow: "rgba(59, 130, 246, 0.3)" }, // blue
        { bg: "rgba(16, 185, 129, 0.85)", shadow: "rgba(16, 185, 129, 0.3)" }, // emerald
      ];

      // Simple hash function to get a consistent color for the same event
      const hash = Math.abs(
        title.split("").reduce((acc, char) => {
          return acc + char.charCodeAt(0);
        }, 0)
      );

      return colors[hash % colors.length];
    };

    const color = getEventColor(event.title);

    return {
      style: {
        background: `linear-gradient(45deg, ${color.bg}, ${color.bg.replace(
          ", 0.85",
          ", 0.7"
        )})`,
        borderRadius: "0.5rem",
        border: "none",
        color: "white",
        fontWeight: 500,
        padding: "3px 10px",
        transition: "all 0.2s ease",
        boxShadow: `0 2px 8px ${color.shadow}`,
        fontSize: "0.85rem",
      },
      className: "calendar-event",
    };
  };

  const handleSelectEvent = (event) => {
    // Navigate to the event details page
    navigate(`/events/${event._id}`);
  };
  return (
    <div className="w-full px-0 py-6">
      <div className="glass-card p-4 md:p-8 rounded-2xl border border-white/30 shadow-xl backdrop-blur-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-purple-700 mb-2">
            Sports Events Calendar
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full"></div>
        </div>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: 600,
            width: "100%",
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "1.25rem",
          }}
          onSelectEvent={handleSelectEvent}
          views={["month", "week", "day"]}
          popup
          dayLayoutAlgorithm="no-overlap"
          dayPropGetter={dayPropGetter}
          eventPropGetter={eventStyleGetter}
          className="glass-calendar"
          formats={{
            dayHeaderFormat: (date) => moment(date).format("dddd, MMMM D"),
            dayFormat: (date) => moment(date).format("D"),
            monthHeaderFormat: (date) => moment(date).format("MMMM YYYY"),
          }}
          components={{
            toolbar: CustomToolbar,
            event: ({ event }) => (
              <div className="tooltip-container">
                <div className="event-content text-sm truncate">
                  {event.title}
                </div>
                <div className="tooltip-content">
                  <div className="font-bold mb-1">{event.title}</div>
                  {event.street && (
                    <div className="text-xs mb-1">
                      📍 {event.street}, {event.city}
                    </div>
                  )}
                  {event.openingTime && (
                    <div className="text-xs">🕒 {event.openingTime}</div>
                  )}
                  <div className="text-xs mt-1 opacity-80">
                    Click for details
                  </div>
                </div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
