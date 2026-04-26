import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { generateRecurringEvents, toSlug } from "../../util/util";

moment.updateLocale("en", { week: { dow: 1 } });
const localizer = momentLocalizer(moment);

const EVENT_COLORS = [
  { bg: "#2563EB", light: "#DBEAFE", shadow: "rgba(37,99,235,0.35)" },
  { bg: "#3B82F6", light: "#EFF6FF", shadow: "rgba(59,130,246,0.35)" },
  { bg: "#10B981", light: "#D1FAE5", shadow: "rgba(16,185,129,0.35)" },
  { bg: "#F59E0B", light: "#FEF3C7", shadow: "rgba(245,158,11,0.35)" },
  { bg: "#EF4444", light: "#FEE2E2", shadow: "rgba(239,68,68,0.35)" },
  { bg: "#8B5CF6", light: "#EDE9FE", shadow: "rgba(139,92,246,0.35)" },
];

function getEventColor(title) {
  const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

function useResponsive() {
  const getState = () => {
    const w = window.innerWidth;
    return {
      isMobile: w < 768,
      calendarHeight: w < 480 ? 440 : w < 768 ? 500 : 580,
    };
  };
  const [state, setState] = useState(getState);
  useEffect(() => {
    const update = () => setState(getState());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return state;
}

const VIEW_LABELS = { month: "Month", week: "Week", day: "Day", agenda: "List" };
const TOOLBAR_HEIGHT = 70;

function CustomToolbar({ date, view, views, onNavigate, onView }) {
  const goToBack = () => {
    const d = new Date(date);
    if (view === "day") d.setDate(d.getDate() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    onNavigate("prev", d);
  };
  const goToNext = () => {
    const d = new Date(date);
    if (view === "day") d.setDate(d.getDate() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    onNavigate("next", d);
  };
  const goToCurrent = () => onNavigate("TODAY");

  const titleContent =
    view === "day" ? (
      moment(date).format("ddd, D MMM YYYY")
    ) : view === "week" ? (
      `${moment(date).startOf("isoWeek").format("D MMM")} – ${moment(date).endOf("isoWeek").format("D MMM YYYY")}`
    ) : (
      <>
        {moment(date).format("MMMM ")}
        <span className="font-normal text-base-content/50">{moment(date).format("YYYY")}</span>
      </>
    );

  return (
    <div className="flex flex-col gap-2 py-3 px-2 sm:gap-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:py-5 sm:px-3 sm:mb-3">
      <div className="sm:hidden text-center pb-1">
        <span className="font-bold text-base-content text-[0.95rem]">{titleContent}</span>
      </div>

      <div className="flex items-center justify-between sm:justify-start gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={goToBack}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/60 hover:bg-base-200 border border-base-300 text-base-content transition-all shadow-sm cursor-pointer"
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
            className="px-3 h-10 sm:h-9 rounded-xl bg-white/60 hover:bg-base-200 border border-base-300 text-base-content text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/60 hover:bg-base-200 border border-base-300 text-base-content transition-all shadow-sm cursor-pointer"
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

        <div className="flex sm:hidden items-center gap-1 bg-white/40 rounded-xl p-1 border border-white/60">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-2.5 h-9 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                v === view
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
                  : "text-base-content hover:bg-white/60"
              }`}
            >
              {VIEW_LABELS[v] || v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <span className="hidden sm:block font-bold text-base-content text-lg">{titleContent}</span>

      <div className="hidden sm:flex items-center gap-1.5 bg-white/40 rounded-xl p-1 border border-white/60">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-3 h-7 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              v === view
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
                : "text-base-content hover:bg-white/60"
            }`}
          >
            {VIEW_LABELS[v] || v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function EventListView({ events, navigate }) {
  const grouped = {};
  events.forEach((e) => {
    const key = moment(e.start).format("YYYY-MM-DD");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });
  const sortedDates = Object.keys(grouped).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
        <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm font-medium">No events this month</p>
      </div>
    );
  }

  return (
    <div>
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-sm px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-base-200/60">
            {moment(date).format("dddd, D MMMM")}
          </div>
          {grouped[date].map((event, i) => {
            const color = getEventColor(event.title);
            return (
              <button
                key={event._id || i}
                onClick={() => navigate(`/events/${toSlug(event.title, event._id)}`)}
                className="w-full text-left px-3 py-3 hover:bg-white/60 active:bg-white/80 transition-colors flex items-center gap-3 cursor-pointer border-b border-base-200/30 last:border-b-0"
              >
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ backgroundColor: color.bg }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-base-content leading-snug">
                    {event.isReoccurring && <span className="text-primary/60 mr-1">↻</span>}
                    {event.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-base-content/60">
                    {event.openingTime && <span>{event.openingTime}</span>}
                    {event.openingTime && (event.street || event.city) && (
                      <span className="text-base-content/30">·</span>
                    )}
                    {(event.street || event.city) && (
                      <span className="truncate">
                        {[event.street, event.city].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                {event.ticketPrice > 0 && (
                  <span className="text-xs font-semibold text-secondary flex-shrink-0">
                    £{event.ticketPrice}
                  </span>
                )}
                <svg
                  className="w-4 h-4 text-base-content/25 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function RecurringEventsCalendar({ events, title = "Events Calendar" }) {
  const navigate = useNavigate();
  const { isMobile, calendarHeight } = useResponsive();

  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  useEffect(() => {
    if (isMobile && currentView === "week") setCurrentView("month");
  }, [isMobile, currentView]);

  const availableViews = isMobile ? ["month", "day", "agenda"] : ["month", "week", "day"];
  const safeView = availableViews.includes(currentView) ? currentView : "month";
  const isListView = safeView === "agenda";
  const calendarViews = isMobile ? ["month", "day"] : ["month", "week", "day"];

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

  const listEvents = calendarEvents
    .filter((e) => moment(e.start).isSame(currentDate, "month"))
    .sort((a, b) => a.start - b.start);

  const handleToolbarNavigate = (action, date) => {
    if (action === "TODAY") setCurrentDate(new Date());
    else if (date) setCurrentDate(date);
  };

  const openDayPopup = (date) => {
    const dayEvents = calendarEvents.filter((e) => moment(e.start).isSame(date, "day"));
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      setSelectedDateEvents(dayEvents);
    }
  };

  const handleSelectEvent = (event) => {
    if (isMobile) {
      openDayPopup(event.start);
    } else {
      setSelectedEvent(event);
    }
  };

  // Custom wrapper so tapping anywhere on a mobile day cell opens the popup
  const MobileDateCellWrapper = ({ children, value }) => {
    const isOffRange = !moment(value).isSame(currentDate, "month");
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          cursor: isOffRange ? "default" : "pointer",
        }}
        onClick={isOffRange ? undefined : () => openDayPopup(value)}
      >
        {children}
      </div>
    );
  };

  const handleConfirmNavigate = () => {
    if (selectedEvent) navigate(`/events/${toSlug(selectedEvent.title, selectedEvent._id)}`);
    setSelectedEvent(null);
  };

  const dayPropGetter = (date) => {
    const isToday = moment().isSame(date, "day");
    const isCurrentMonth = moment(date).month() === moment().month();
    const hasEvent = calendarEvents.some((e) => moment(e.start).isSame(date, "day"));

    if (isToday)
      return {
        style: {
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          boxShadow: "inset 0 0 0 2px rgba(37, 99, 235, 0.5)",
        },
      };
    if (hasEvent) return { style: { backgroundColor: "rgba(59, 130, 246, 0.08)" } };
    if (!isCurrentMonth)
      return { style: { backgroundColor: "rgba(249, 250, 251, 0.4)", color: "#a1a1aa" } };
    return {};
  };

  const eventStyleGetter = (event) => {
    const color = getEventColor(event.title);
    const isOffRange = isMobile && !moment(event.start).isSame(currentDate, "month");
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
        opacity: isOffRange ? 0.3 : 1,
      },
    };
  };

  return (
    <div className="w-full py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 px-2 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-base-content">{title}</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-primary to-secondary rounded-full mt-1.5"></div>
        </div>
        {!isListView && (
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-base-content/50">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-primary/20 border-2 border-primary inline-block"></span>
              Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-secondary/30 border border-secondary inline-block"></span>
              Has event
            </span>
          </div>
        )}
      </div>

      {/* Calendar / List */}
      <div className="glass-calendar rounded-2xl overflow-hidden border border-white/40 shadow-inner bg-white/20 backdrop-blur-sm">
        {isListView ? (
          <>
            <CustomToolbar
              date={currentDate}
              view={safeView}
              views={availableViews}
              onNavigate={handleToolbarNavigate}
              onView={setCurrentView}
            />
            <div
              style={{ height: calendarHeight - TOOLBAR_HEIGHT, overflow: "auto" }}
              className="px-1 pb-2"
            >
              <EventListView events={listEvents} navigate={navigate} />
            </div>
          </>
        ) : isMobile ? (
          <>
            <CustomToolbar
              date={currentDate}
              view={safeView}
              views={availableViews}
              onNavigate={handleToolbarNavigate}
              onView={setCurrentView}
            />
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              onNavigate={(date) => setCurrentDate(new Date(date))}
              view={safeView}
              onView={setCurrentView}
              style={{
                height: calendarHeight - TOOLBAR_HEIGHT,
                width: "100%",
                background: "transparent",
              }}
              onSelectEvent={handleSelectEvent}
              onDrillDown={(date) => openDayPopup(date)}
              views={calendarViews}
              popup={false}
              dayLayoutAlgorithm="no-overlap"
              dayPropGetter={dayPropGetter}
              eventPropGetter={eventStyleGetter}
              formats={{
                dayHeaderFormat: (date) => moment(date).format("ddd, D MMM YYYY"),
                dayFormat: (date) => moment(date).format("ddd D"),
                weekdayFormat: (date) => moment(date).format("dd"),
                monthHeaderFormat: (date) => moment(date).format("MMMM YYYY"),
              }}
              components={{
                toolbar: () => null,
                dateCellWrapper: MobileDateCellWrapper,
                event: ({ event }) => (
                  <div className="cursor-pointer overflow-hidden">
                    <div className="truncate text-[0.7rem] font-semibold leading-tight drop-shadow-sm">
                      {event.isReoccurring && <span className="opacity-80">↻ </span>}
                      {event.title}
                    </div>
                  </div>
                ),
              }}
            />
          </>
        ) : (
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
                  <div className="truncate text-[0.75rem] font-semibold leading-tight drop-shadow-sm">
                    {event.isReoccurring && <span className="opacity-80">↻ </span>}
                    {event.title}
                  </div>
                  {event.openingTime && (
                    <div className="truncate text-[0.6rem] opacity-80 mt-px">
                      {event.openingTime}
                    </div>
                  )}
                </div>
              ),
            }}
          />
        )}
      </div>

      {/* Desktop: single event popup */}
      {selectedEvent &&
        !isMobile &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 overflow-hidden max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: getEventColor(selectedEvent.title).bg, height: 6 }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-base-content">{selectedEvent.title}</h3>
                    {selectedEvent.isReoccurring && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-base-200 text-primary font-medium mt-1 inline-block">
                        ↻ Recurring
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-10 h-10 flex items-center justify-center text-base-content/50 hover:text-base-content/70 ml-2 transition-colors cursor-pointer rounded-lg hover:bg-base-200"
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

                <div className="space-y-2.5 text-sm text-base-content/70 mb-5">
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-primary flex-shrink-0"
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
                        className="w-4 h-4 text-secondary flex-shrink-0"
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
                        className="w-4 h-4 text-info flex-shrink-0"
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
                        className="w-4 h-4 text-accent flex-shrink-0"
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
                        {selectedEvent.isTournament ? "per team" : "per ticket"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 py-2.5 rounded-xl border border-base-300 text-base-content/70 text-sm hover:bg-base-200 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleConfirmNavigate}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium transition-all shadow-sm cursor-pointer"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Mobile: day events popup */}
      {selectedDate &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedDate(null)}
          >
            <div
              className="bg-white/95 backdrop-blur-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-white/60 w-full sm:max-w-sm sm:mx-4 max-h-[75vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-2 pb-1 sm:hidden">
                <div className="w-8 h-1 rounded-full bg-base-300"></div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-b border-base-200/50">
                <div>
                  <h3 className="font-bold text-base-content text-base">
                    {moment(selectedDate).format("dddd, D MMMM")}
                  </h3>
                  <p className="text-xs text-base-content/50 mt-0.5">
                    {selectedDateEvents.length} event
                    {selectedDateEvents.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-9 h-9 flex items-center justify-center text-base-content/50 hover:text-base-content/70 transition-colors cursor-pointer rounded-lg hover:bg-base-200"
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

              <div className="overflow-y-auto flex-1 px-2 py-2">
                {selectedDateEvents.map((event, i) => {
                  const color = getEventColor(event.title);
                  return (
                    <button
                      key={event._id || i}
                      onClick={() => {
                        setSelectedDate(null);
                        navigate(`/events/${toSlug(event.title, event._id)}`);
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-base-100 active:bg-base-200 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div
                        className="w-1.5 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color.bg }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-base-content leading-tight">
                          {event.isReoccurring && <span className="text-primary/60 mr-1">↻</span>}
                          {event.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-base-content/55">
                          {event.openingTime && (
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
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
                              {event.openingTime}
                            </span>
                          )}
                          {(event.street || event.city) && (
                            <span className="flex items-center gap-1 truncate">
                              <svg
                                className="w-3 h-3 flex-shrink-0"
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
                              </svg>
                              <span className="truncate">
                                {[event.street, event.city].filter(Boolean).join(", ")}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      {event.ticketPrice > 0 && (
                        <span className="text-xs font-semibold text-secondary flex-shrink-0">
                          £{event.ticketPrice}
                        </span>
                      )}
                      <svg
                        className="w-4 h-4 text-base-content/25 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
