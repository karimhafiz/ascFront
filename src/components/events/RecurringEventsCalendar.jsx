import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { generateRecurringEvents, toSlug } from "../../util/util";

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    const d = new Date(toolbar.date);
    if (toolbar.view === "day") d.setDate(d.getDate() - 1);
    else if (toolbar.view === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    toolbar.onNavigate("prev", d);
  };
  const goToNext = () => {
    const d = new Date(toolbar.date);
    if (toolbar.view === "day") d.setDate(d.getDate() + 1);
    else if (toolbar.view === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    toolbar.onNavigate("next", d);
  };
  const goToCurrent = () => toolbar.onNavigate("TODAY");

  return (
    <div className="flex flex-wrap items-center justify-between mb-5 gap-3 py-5 px-3">
      <div className="flex items-center gap-2">
        <button
          onClick={goToBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/60 hover:bg-pink-50 border border-pink-200/50 text-pink-500 hover:text-pink-600 hover:scale-105 transition-all shadow-sm cursor-pointer"
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
        </button>
        <button
          onClick={goToCurrent}
          className="px-4 h-9 rounded-xl bg-white/60 hover:bg-purple-50 border border-purple-200/50 text-purple-600 text-sm font-medium hover:scale-105 transition-all shadow-sm cursor-pointer"
        >
          Today
        </button>
        <button
          onClick={goToNext}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/60 hover:bg-pink-50 border border-pink-200/50 text-pink-500 hover:text-pink-600 hover:scale-105 transition-all shadow-sm cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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

      <span className="font-bold text-purple-800 text-sm sm:text-lg">
        {toolbar.view === "day" ? (
          moment(toolbar.date).format("ddd, D MMMM YYYY")
        ) : toolbar.view === "week" ? (
          `${moment(toolbar.date).startOf("isoWeek").format("D MMM")} – ${moment(toolbar.date).endOf("isoWeek").format("D MMM YYYY")}`
        ) : (
          <>
            {moment(toolbar.date).format("MMMM ")}
            <span className="font-normal text-purple-500">
              {moment(toolbar.date).format("YYYY")}
            </span>
          </>
        )}
      </span>

      <div className="flex items-center gap-1.5 bg-white/40 rounded-xl p-1 border border-white/60">
        {toolbar.views.map((view) => (
          <button
            key={view}
            onClick={() => toolbar.onView(view)}
            className={`px-3 h-7 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              view === toolbar.view
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                : "text-purple-600 hover:bg-white/60"
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

moment.updateLocale("en", { week: { dow: 1 } });
const localizer = momentLocalizer(moment);

const EVENT_COLORS = [
  { bg: "#ec4899", light: "#fce7f3", shadow: "rgba(236,72,153,0.35)" },
  { bg: "#9333ea", light: "#f3e8ff", shadow: "rgba(147,51,234,0.35)" },
  { bg: "#4f46e5", light: "#e0e7ff", shadow: "rgba(79,70,229,0.35)" },
  { bg: "#0ea5e9", light: "#e0f2fe", shadow: "rgba(14,165,233,0.35)" },
  { bg: "#10b981", light: "#d1fae5", shadow: "rgba(16,185,129,0.35)" },
  { bg: "#f59e0b", light: "#fef3c7", shadow: "rgba(245,158,11,0.35)" },
];

function getEventColor(title) {
  const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

function useCalendarHeight() {
  const [height, setHeight] = useState(580);
  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setHeight(350);
      else if (w < 768) setHeight(420);
      else setHeight(580);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return height;
}

export default function RecurringEventsCalendar({ events, title = "Events Calendar" }) {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarHeight = useCalendarHeight();

  const expandedEvents = events.flatMap((event) =>
    event.isReoccurring ? generateRecurringEvents(event) : [event]
  );

  const calendarEvents = expandedEvents.map((event) => ({
    ...event,
    title: event.title,
    start: new Date(event.date),
    end: new Date(event.date),
    allDay: true,
  }));

  const dayPropGetter = (date) => {
    const isToday = moment().isSame(date, "day");
    const isCurrentMonth = moment(date).month() === moment().month();
    const hasEvent = calendarEvents.some((e) => moment(e.start).isSame(date, "day"));

    if (isToday)
      return {
        style: {
          backgroundColor: "rgba(253, 220, 235, 0.85)",
          boxShadow: "inset 0 0 0 2px rgba(236, 72, 153, 0.7)",
        },
      };
    if (hasEvent)
      return {
        style: {
          backgroundColor: "rgba(196, 181, 253, 0.15)",
        },
      };
    if (!isCurrentMonth)
      return {
        style: { backgroundColor: "rgba(249, 250, 251, 0.4)", color: "#a1a1aa" },
      };
    return {};
  };

  const eventStyleGetter = (event) => {
    const color = getEventColor(event.title);
    return {
      style: {
        background: `linear-gradient(135deg, ${color.bg}, ${color.bg}dd)`,
        borderRadius: "6px",
        border: "none",
        borderLeft: `3px solid ${color.bg}`,
        color: "white",
        padding: "2px 8px",
        boxShadow: `0 2px 6px ${color.shadow}`,
        cursor: "pointer",
        overflow: "hidden",
        fontSize: "0.75rem",
        lineHeight: "1.4",
      },
    };
  };

  const handleSelectEvent = (event) => setSelectedEvent(event);
  const handleConfirmNavigate = () => {
    if (selectedEvent) navigate(`/events/${toSlug(selectedEvent.title, selectedEvent._id)}`);
    setSelectedEvent(null);
  };

  return (
    <div className="w-full py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 px-2 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800">{title}</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mt-1.5"></div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-purple-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-pink-200 border-2 border-pink-500 inline-block"></span>
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-300 border border-purple-500 inline-block"></span>
            Has event
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl overflow-hidden border border-white/40 shadow-inner bg-white/20 backdrop-blur-sm">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: calendarHeight, width: "100%", background: "transparent" }}
          onSelectEvent={handleSelectEvent}
          views={["month", "week", "day"]}
          popup
          dayLayoutAlgorithm="no-overlap"
          dayPropGetter={dayPropGetter}
          eventPropGetter={eventStyleGetter}
          formats={{
            dayHeaderFormat: (date) => moment(date).format("dddd, D MMMM YYYY"),
            dayFormat: (date) => moment(date).format("ddd DD"),
            weekdayFormat: (date) => moment(date).format("ddd D"),
            monthHeaderFormat: (date) => moment(date).format("MMMM YYYY"),
          }}
          components={{
            toolbar: CustomToolbar,
            event: ({ event }) => (
              <div
                className="cursor-pointer overflow-hidden"
                title={[event.title, event.openingTime, event.city].filter(Boolean).join(" · ")}
              >
                <div className="truncate text-[0.7rem] font-semibold leading-tight drop-shadow-sm">
                  {event.isReoccurring && <span className="opacity-80">↻ </span>}
                  {event.title}
                </div>
                {event.openingTime && (
                  <div className="truncate text-[0.6rem] opacity-80 mt-px">{event.openingTime}</div>
                )}
              </div>
            ),
          }}
        />
      </div>

      {/* Event detail popup */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          {/* overflow-hidden so the top bar sits flush with no padding gap */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 overflow-hidden max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Coloured top bar — flush because parent has overflow-hidden, no negative margins needed */}
            <div style={{ background: getEventColor(selectedEvent.title).bg, height: 6 }} />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-purple-900">{selectedEvent.title}</h3>
                  {selectedEvent.isReoccurring && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium mt-1 inline-block">
                      🔁 Recurring
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 ml-2 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-2.5 text-sm text-purple-700 mb-5">
                <div className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-pink-400 flex-shrink-0"
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
                  <span>{moment(selectedEvent.start).format("dddd, D MMMM YYYY")}</span>
                </div>
                {selectedEvent.openingTime && (
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-purple-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{selectedEvent.openingTime}</span>
                  </div>
                )}
                {(selectedEvent.street || selectedEvent.city) && (
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-indigo-400 flex-shrink-0"
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
                    <span>
                      {[selectedEvent.street, selectedEvent.city].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
                {selectedEvent.ticketPrice > 0 && (
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-green-400 flex-shrink-0"
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
                    <span>
                      £{selectedEvent.ticketPrice}{" "}
                      {selectedEvent.isTournament ? "per player" : "per ticket"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-2 rounded-xl border border-purple-200 text-purple-600 text-sm hover:bg-purple-50 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmNavigate}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium hover:scale-105 transition-all shadow-sm cursor-pointer"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
