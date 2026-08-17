import React, { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import SortableHeader from "../common/SortableHeader";
import { Spinner } from "../ui";
import { fetchWithAuth } from "../../auth/auth";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";

const COUNT_LABELS = {
  users: "Total Users",
  ticketsSold: "Tickets Sold",
  courseEnrollments: "Course Enrollments",
  eventSubscriptions: "Event Subscriptions",
  venueBookings: "Venue Bookings",
  teams: "Teams Registered",
};

const REVENUE_LABELS = {
  events: "Ticket Sales",
  eventSubscriptions: "Event Subscriptions",
  courses: "Courses",
  venues: "Venue Bookings",
};

const CHART_COLORS = {
  events: { bg: "rgba(59, 130, 172, 0.6)", border: "rgba(59, 130, 172, 1)" },
  courses: { bg: "rgba(168, 85, 247, 0.6)", border: "rgba(168, 85, 247, 1)" },
  venues: { bg: "rgba(245, 158, 11, 0.6)", border: "rgba(245, 158, 11, 1)" },
  eventSubscriptions: { bg: "rgba(20, 184, 166, 0.6)", border: "rgba(20, 184, 166, 1)" },
};

function ExpandablePanel({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-base-300 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-5 text-left cursor-pointer"
      >
        <p className="text-sm font-semibold text-base-content">{title}</p>
        <svg
          className={`h-4 w-4 shrink-0 text-base-content/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// A "Revenue by <resource>" bar chart + ranked list, for resources whose only
// per-item data is a name and a revenue figure (unlike events, which also has
// tickets-left/price columns worth a dedicated sortable table).
function ResourceRevenuePanel({ title, resourceKey, items, idKey, labelKey }) {
  const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
  const colors = CHART_COLORS[resourceKey];

  const chartData = {
    labels: sorted.map((item) => item[labelKey]),
    datasets: [
      {
        label: `${title} (£)`,
        data: sorted.map((item) => item.revenue),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <ExpandablePanel title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-base-content/50">Nothing here yet.</p>
      ) : (
        <>
          <div className="h-64 mb-4">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true, ticks: { callback: (v) => "£" + v } } },
              }}
            />
          </div>
          <ul className="divide-y divide-base-100">
            {sorted.map((item) => (
              <li key={item[idKey]} className="flex justify-between py-2 text-sm">
                <span className="text-base-content">{item[labelKey]}</span>
                <span className="text-base-content/50">£{item.revenue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ExpandablePanel>
  );
}

export default function AnalyticsTab({ events }) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.stats.admin,
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}stats/admin`);
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    },
  });

  const revenueChartData = {
    labels: events.map((e) => e.title),
    datasets: [
      {
        label: "Revenue (£)",
        data: events.map((e) => e.totalRevenue ?? 0),
        backgroundColor: CHART_COLORS.events.bg,
        borderColor: CHART_COLORS.events.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (!sort.key) return 0;
    let va, vb;
    if (sort.key === "event")
      return sort.dir === "asc"
        ? (a.title ?? "").localeCompare(b.title ?? "")
        : (b.title ?? "").localeCompare(a.title ?? "");
    if (sort.key === "revenue") {
      va = a.totalRevenue ?? 0;
      vb = b.totalRevenue ?? 0;
    } else if (sort.key === "tickets") {
      va = a.ticketsAvailable ?? 0;
      vb = b.ticketsAvailable ?? 0;
    } else if (sort.key === "price") {
      va = a.ticketPrice ?? 0;
      vb = b.ticketPrice ?? 0;
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  const growthChartData = stats && {
    labels: stats.userGrowth.map((m) => m.month),
    datasets: [
      {
        label: "New users",
        data: stats.userGrowth.map((m) => m.count),
        borderColor: "rgba(59, 130, 172, 1)",
        backgroundColor: "rgba(59, 130, 172, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
          <p className="text-xs text-base-content/50 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-base-content">
            £{(stats?.revenue.total ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
          <p className="text-xs text-base-content/50 mb-1">Events with Sales</p>
          <p className="text-2xl font-bold text-base-content">
            {events.filter((e) => (e.totalRevenue ?? 0) > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
          <p className="text-xs text-base-content/50 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-base-content">{events.length}</p>
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 text-sm text-red-600">
          {error.message}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : (
        stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(COUNT_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="bg-white rounded-2xl border border-base-300 shadow-sm p-4"
                >
                  <p className="text-xs text-base-content/50 mb-1">{label}</p>
                  <p className="text-xl font-bold text-base-content">{stats.counts[key]}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
              <p className="text-sm font-semibold text-base-content mb-3">Revenue by Source</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(REVENUE_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <p className="text-xs text-base-content/50 mb-1">{label}</p>
                    <p className="text-lg font-bold text-base-content">
                      £{(stats.revenue[key] ?? 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
                <p className="text-sm font-semibold text-base-content mb-3">
                  User Growth (6 months)
                </p>
                <div className="h-56">
                  <Line
                    data={growthChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: true } },
                      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
                <p className="text-sm font-semibold text-base-content mb-3">Most Popular Events</p>
                {stats.topEvents.length === 0 ? (
                  <p className="text-sm text-base-content/50">No ticket sales yet.</p>
                ) : (
                  <ul className="divide-y divide-base-100">
                    {stats.topEvents.map((e) => (
                      <li key={e.eventId} className="flex justify-between py-2 text-sm">
                        <span className="text-base-content">{e.title}</span>
                        <span className="text-base-content/50">{e.ticketsSold} sold</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
              <p className="text-sm font-semibold text-base-content mb-3">Most Popular Courses</p>
              {stats.topCourses.length === 0 ? (
                <p className="text-sm text-base-content/50">No enrollments yet.</p>
              ) : (
                <ul className="divide-y divide-base-100">
                  {stats.topCourses.map((c) => (
                    <li key={c.courseId} className="flex justify-between py-2 text-sm">
                      <span className="text-base-content">{c.title}</span>
                      <span className="text-base-content/50">{c.enrollments} enrolled</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ResourceRevenuePanel
              title="Revenue by Course"
              resourceKey="courses"
              items={stats.revenueByCourse}
              idKey="courseId"
              labelKey="title"
            />
            <ResourceRevenuePanel
              title="Revenue by Venue"
              resourceKey="venues"
              items={stats.revenueByVenue}
              idKey="venueId"
              labelKey="name"
            />
            <ResourceRevenuePanel
              title="Revenue by Event Subscriptions"
              resourceKey="eventSubscriptions"
              items={stats.revenueByEventSubscription}
              idKey="eventId"
              labelKey="title"
            />
          </>
        )
      )}

      <ExpandablePanel title="Revenue by Event">
        <div className="h-72 mb-4">
          <Bar
            data={revenueChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: true } },
              scales: { y: { beginAtZero: true, ticks: { callback: (v) => "£" + v } } },
            }}
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-base-300">
          <table className="w-full text-sm min-w-150">
            <thead>
              <tr className="bg-linear-to-r from-base-200 to-base-200 text-left">
                <SortableHeader label="Event" sortKey="event" sort={sort} onSort={setSort} />
                <SortableHeader label="Revenue" sortKey="revenue" sort={sort} onSort={setSort} />
                <SortableHeader
                  label="Tickets Left"
                  sortKey="tickets"
                  sort={sort}
                  onSort={setSort}
                />
                <SortableHeader label="Price/ticket" sortKey="price" sort={sort} onSort={setSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-base-100">
              {sortedEvents.map((e) => (
                <tr key={e._id} className="bg-white hover:bg-base-200/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-base-content">{e.title}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">
                    £{(e.totalRevenue ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-base-content/70">{e.ticketsAvailable ?? "—"}</td>
                  <td className="px-4 py-3 text-base-content/70">
                    £{(e.ticketPrice ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandablePanel>
    </div>
  );
}
