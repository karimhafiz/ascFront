import React, { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import EventCard from "../../components/events/EventCard";
import RecurringEventsCalendar from "../../components/events/RecurringEventsCalendar";

const TYPE_TABS = [
  { key: "all", label: "All Events" },
  { key: "ASC", label: "ASC Events" },
  { key: "Sports", label: "Sports Events" },
];

export default function EventPage() {
  const { events } = useRouteLoaderData("root");
  const [view, setView] = useState("cards");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "asc" });

  const currentDate = new Date();

  // Type filtering
  const typeFiltered =
    activeTab === "all" ? events : events.filter((e) => e.typeOfEvent === activeTab);

  // Search filtering (cards only)
  const filtered = typeFiltered.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q) ||
      e.shortDescription?.toLowerCase().includes(q)
    );
  });

  const sortFn = (a, b) => {
    let va, vb;
    if (sort.key === "date") {
      va = new Date(a.date);
      vb = new Date(b.date);
    } else if (sort.key === "price") {
      va = a.ticketPrice ?? 0;
      vb = b.ticketPrice ?? 0;
    } else if (sort.key === "tickets") {
      va = a.ticketsAvailable ?? 0;
      vb = b.ticketsAvailable ?? 0;
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  };

  const upcomingEvents = [
    ...filtered.filter((event) => event.isReoccurring || new Date(event.date) >= currentDate),
  ].sort(sortFn);
  const pastEvents = [
    ...filtered.filter((event) => !event.isReoccurring && new Date(event.date) < currentDate),
  ].sort(sortFn);

  const SORT_OPTIONS = [
    { key: "date", label: "Date" },
    { key: "price", label: "Price" },
    { key: "tickets", label: "Tickets" },
  ];

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, dir: "asc" });
    }
  };

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-8 md:p-14 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Events</h1>
          <p className="text-purple-100 text-lg">Discover upcoming events and activities</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* View toggle + type tabs + search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* View toggle */}
          <div className="flex bg-white/60 rounded-xl border border-white/40 p-1">
            <button
              onClick={() => setView("cards")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                view === "cards"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                  : "text-purple-700 hover:bg-white/80"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Cards
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                view === "calendar"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                  : "text-purple-700 hover:bg-white/80"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Calendar
            </button>
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                    : "bg-white/60 text-purple-700 hover:bg-white/80 border border-white/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Sort (cards view only) */}
          {view === "cards" && (
            <div className="flex items-center gap-2 flex-1">
              <div className="relative max-w-xs flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input pl-9 py-2.5"
                />
              </div>
              <div className="flex bg-white/60 rounded-xl border border-white/40 p-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSort(opt.key)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      sort.key === opt.key
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                        : "text-purple-700 hover:bg-white/80"
                    }`}
                  >
                    {opt.label}
                    {sort.key === opt.key && (
                      <svg
                        className={`w-3 h-3 transition-transform ${sort.dir === "desc" ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cards view */}
        {view === "cards" && (
          <>
            <h2 className="text-2xl font-bold text-purple-800 mb-5">Upcoming Events</h2>
            {upcomingEvents.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-2xl border border-white/30 mb-10">
                <p className="text-purple-500 text-lg">No upcoming events found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {upcomingEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}

            {pastEvents.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-indigo-700 mb-5">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Calendar view */}
        {view === "calendar" && (
          <div className="glass-card rounded-2xl shadow-xl backdrop-blur-md border border-white/30 p-6">
            <RecurringEventsCalendar
              events={typeFiltered}
              title={
                activeTab === "all"
                  ? "Events Calendar"
                  : activeTab === "ASC"
                    ? "ASC Events Calendar"
                    : "Sports Events Calendar"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
