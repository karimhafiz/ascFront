import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { getAuthToken, getUserRole as getAuthRole } from "../../auth/auth";
import SortableHeader from "../../components/common/SortableHeader";
import { PageContainer, Spinner } from "../../components/ui";

function getRole() {
  return getAuthRole();
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TABS = ["Tickets", "Revenue", "Teams", "Courses", "Users"];

const ENROLLMENT_STATUS = {
  pending: { label: "Pending", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  paid: { label: "Paid", classes: "bg-green-50 text-green-700 border-green-200" },
  free: { label: "Free", classes: "bg-blue-50 text-blue-600 border-blue-200" },
  active: { label: "Active", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-600 border-red-200" },
  past_due: { label: "Past Due", classes: "bg-orange-50 text-orange-600 border-orange-200" },
};

const roleBadgeClass = {
  admin: "bg-yellow-100 text-yellow-800 border-yellow-300",
  moderator: "bg-blue-100 text-blue-700 border-blue-200",
  user: "bg-base-200 text-base-content/70 border-base-300",
};

// ─── Tab: Tickets ─────────────────────────────────────────────────────────────

function TicketsTab({ tickets }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const filtered = tickets.filter(
    (t) =>
      t.buyerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      t.eventId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
    let va, vb;
    if (sort.key === "date") {
      va = new Date(a.createdAt);
      vb = new Date(b.createdAt);
    } else if (sort.key === "paid") {
      va = (a.eventId?.ticketPrice ?? 0) * (a.quantity ?? 1);
      vb = (b.eventId?.ticketPrice ?? 0) * (b.quantity ?? 1);
    } else if (sort.key === "quantity") {
      va = a.quantity ?? 1;
      vb = b.quantity ?? 1;
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search by buyer email or event…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="glass-input mb-4"
      />
      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
              <th className="px-4 py-3 font-semibold text-base-content">Event</th>
              <th className="px-4 py-3 font-semibold text-base-content">Buyer Email</th>
              <SortableHeader label="Qty" sortKey="quantity" sort={sort} onSort={setSort} />
              <SortableHeader label="Paid" sortKey="paid" sort={sort} onSort={setSort} />
              <SortableHeader label="Date" sortKey="date" sort={sort} onSort={setSort} />
              <th className="px-4 py-3 font-semibold text-base-content">Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-base-content/50">
                  No tickets found
                </td>
              </tr>
            ) : (
              sorted.map((t) => (
                <tr key={t._id} className="bg-white hover:bg-base-200/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-base-content">
                    {t.eventId?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-base-content/70">{t.buyerEmail}</td>
                  <td className="px-4 py-3 text-base-content/70">{t.quantity ?? 1}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">
                    £{((t.eventId?.ticketPrice ?? 0) * (t.quantity ?? 1)).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-base-content/50">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-base-content/40">
                    {t.paymentId ? "…" + t.paymentId.slice(-8) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-base-content/50 mt-2">
        {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── Tab: Revenue ─────────────────────────────────────────────────────────────

function RevenueTab({ events }) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const chartData = {
    labels: events.map((e) => e.title),
    datasets: [
      {
        label: "Revenue (£)",
        data: events.map((e) => e.totalRevenue ?? 0),
        backgroundColor: "rgba(59, 130, 172, 0.6)",
        borderColor: "rgba(59, 130, 172, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const totalRevenue = events.reduce((sum, e) => sum + (e.totalRevenue ?? 0), 0);

  const sorted = [...events].sort((a, b) => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
          <p className="text-xs text-base-content/50 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-base-content">£{totalRevenue.toFixed(2)}</p>
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

      <div className="bg-white rounded-2xl border border-base-300 shadow-sm p-5">
        <div className="h-72">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { callback: (v) => "£" + v } } },
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
              <SortableHeader label="Event" sortKey="event" sort={sort} onSort={setSort} />
              <SortableHeader label="Revenue" sortKey="revenue" sort={sort} onSort={setSort} />
              <SortableHeader label="Tickets Left" sortKey="tickets" sort={sort} onSort={setSort} />
              <SortableHeader label="Price/ticket" sortKey="price" sort={sort} onSort={setSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100">
            {sorted.map((e) => (
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
    </div>
  );
}

// ─── Tab: Teams ───────────────────────────────────────────────────────────────

function TeamsTab({ teams }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const handleTeamSort = (key) => {
    if (sort.key === key) {
      setSort({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, dir: "asc" });
    }
  };

  const filtered = teams.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.manager?.name?.toLowerCase().includes(q) ||
      t.manager?.email?.toLowerCase().includes(q) ||
      t.members?.some(
        (m) => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
      )
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
    let va, vb;
    if (sort.key === "members") {
      va = a.members?.length ?? 0;
      vb = b.members?.length ?? 0;
    } else if (sort.key === "paid") {
      va = a.paid ? 1 : 0;
      vb = b.paid ? 1 : 0;
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  const TEAM_SORT_OPTIONS = [
    { key: "members", label: "Members" },
    { key: "paid", label: "Payment" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <input
          type="text"
          placeholder="Search teams, members, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input flex-1 max-w-xs"
        />
        <div className="flex bg-base-200 rounded-xl p-1 gap-1">
          {TEAM_SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleTeamSort(opt.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                sort.key === opt.key
                  ? "bg-gradient-to-r from-primary to-primary/70 text-white shadow-sm"
                  : "text-base-content/50 hover:text-base-content"
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
      {sorted.length === 0 && (
        <p className="text-center text-base-content/50 py-12">No team registrations found</p>
      )}
      {sorted.map((team) => (
        <div
          key={team._id}
          className="bg-white rounded-2xl border border-base-300 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base-content">{team.name}</p>
              <p className="text-xs text-base-content/50 mt-0.5">
                {team.event?.title ?? "Unknown event"}
                {team.event?.date && <span> · {formatDate(team.event.date)}</span>}
              </p>
              <p className="text-xs text-base-content/50 mt-0.5">
                Manager: {team.manager?.name} · {team.manager?.email}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={
                  "text-xs font-medium px-2 py-0.5 rounded-full border " +
                  (team.paid
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-orange-50 text-orange-600 border-orange-200")
                }
              >
                {team.paid ? "✓ Paid" : "Pending"}
              </span>
              <span className="text-xs text-base-content/50">
                {team.members?.length ?? 0} members
              </span>
            </div>
          </div>
          {team.members?.length > 0 && (
            <div className="px-5 pb-4">
              <button
                onClick={() => setExpanded(expanded === team._id ? null : team._id)}
                className="text-xs text-base-content/70 hover:text-base-content font-medium flex items-center gap-1 cursor-pointer"
              >
                {expanded === team._id ? "Hide members" : "Show members"}
                <svg
                  className={
                    "w-3 h-3 transition-transform " + (expanded === team._id ? "rotate-180" : "")
                  }
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expanded === team._id && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {team.members.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-base-content/70 bg-base-200/50 rounded-lg px-3 py-1.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-base-200 text-base-content/70 font-bold flex items-center justify-center text-[10px]">
                        {m.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      <span>{m.name}</span>
                      {m.email && <span className="text-base-content/50">· {m.email}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Courses ─────────────────────────────────────────────────────────────

function CoursesTab({ enrollments, courses }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("enrollments");
  const [enrollSort, setEnrollSort] = useState({ key: null, dir: "asc" });
  const [courseSort, setCourseSort] = useState({ key: null, dir: "asc" });

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.buyerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      e.courseId?.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCourses = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(search.toLowerCase())
  );

  const ENROLL_STATUS_ORDER = {
    active: 0,
    paid: 1,
    pending: 2,
    free: 3,
    past_due: 4,
    cancelled: 5,
  };

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    if (!enrollSort.key) return 0;
    let va, vb;
    if (enrollSort.key === "status") {
      va = ENROLL_STATUS_ORDER[a.status] ?? 6;
      vb = ENROLL_STATUS_ORDER[b.status] ?? 6;
    } else if (enrollSort.key === "date") {
      va = new Date(a.createdAt);
      vb = new Date(b.createdAt);
    }
    return enrollSort.dir === "asc" ? va - vb : vb - va;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!courseSort.key) return 0;
    if (courseSort.key === "category")
      return courseSort.dir === "asc"
        ? (a.category ?? "").localeCompare(b.category ?? "")
        : (b.category ?? "").localeCompare(a.category ?? "");
    let va, vb;
    if (courseSort.key === "price") {
      va = a.price ?? 0;
      vb = b.price ?? 0;
    } else if (courseSort.key === "enrolled") {
      va = a.currentEnrollment ?? 0;
      vb = b.currentEnrollment ?? 0;
    } else if (courseSort.key === "status") {
      va = a.enrollmentOpen ? 1 : 0;
      vb = b.enrollmentOpen ? 1 : 0;
    }
    return courseSort.dir === "asc" ? va - vb : vb - va;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search courses or emails…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input flex-1"
        />
        <div className="flex bg-base-200 rounded-xl p-1 gap-1">
          {["enrollments", "courses"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${view === v ? "bg-white shadow-sm text-base-content" : "text-base-content/50 hover:text-base-content"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "enrollments" && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                  <th className="px-4 py-3 font-semibold text-base-content">Course</th>
                  <th className="px-4 py-3 font-semibold text-base-content">Buyer Email</th>
                  <th className="px-4 py-3 font-semibold text-base-content">Participants</th>
                  <SortableHeader
                    label="Status"
                    sortKey="status"
                    sort={enrollSort}
                    onSort={setEnrollSort}
                  />
                  <SortableHeader
                    label="Date"
                    sortKey="date"
                    sort={enrollSort}
                    onSort={setEnrollSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {sortedEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-base-content/50">
                      No enrollments found
                    </td>
                  </tr>
                ) : (
                  sortedEnrollments.map((e) => (
                    <tr key={e._id} className="bg-white hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-base-content">
                        {e.courseId?.title ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-base-content/70">{e.buyerEmail}</td>
                      <td className="px-4 py-3 text-base-content/70">
                        {e.participants?.length > 0
                          ? e.participants.map((p) => p.name).join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const st = ENROLLMENT_STATUS[e.status] ?? {
                            label: e.status ?? "Unknown",
                            classes: "bg-base-100 text-base-content/50 border-base-300",
                          };
                          return (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.classes}`}
                            >
                              {st.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-base-content/50">{formatDate(e.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-base-content/50 mt-2">
            {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}
          </p>
        </>
      )}

      {view === "courses" && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                  <th className="px-4 py-3 font-semibold text-base-content">Title</th>
                  <th className="px-4 py-3 font-semibold text-base-content">Instructor</th>
                  <SortableHeader
                    label="Category"
                    sortKey="category"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                  <SortableHeader
                    label="Price"
                    sortKey="price"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                  <SortableHeader
                    label="Enrolled"
                    sortKey="enrolled"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                  <SortableHeader
                    label="Status"
                    sortKey="status"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {sortedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-base-content/50">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  sortedCourses.map((c) => (
                    <tr key={c._id} className="bg-white hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-base-content">{c.title}</td>
                      <td className="px-4 py-3 text-base-content/70">{c.instructor}</td>
                      <td className="px-4 py-3 text-base-content/70">{c.category}</td>
                      <td className="px-4 py-3 text-base-content/70">
                        {c.price > 0 ? `£${c.price}` : "Free"}
                      </td>
                      <td className="px-4 py-3 text-base-content/70">
                        {c.currentEnrollment}
                        {c.maxEnrollment ? ` / ${c.maxEnrollment}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.enrollmentOpen ? "bg-green-50 text-green-700 border-green-200" : "bg-base-100 text-base-content/50 border-base-300"}`}
                        >
                          {c.enrollmentOpen ? "Open" : "Closed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-base-content/50 mt-2">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
          </p>
        </>
      )}
    </div>
  );
}

// ─── Tab: Users (admin only) ──────────────────────────────────────────────────

const ROLE_ORDER = { admin: 0, moderator: 1, user: 2 };

function UsersTab({ users, currentUserId, onRoleChange }) {
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
    let va, vb;
    if (sort.key === "role") {
      va = ROLE_ORDER[a.role] ?? 3;
      vb = ROLE_ORDER[b.role] ?? 3;
    } else if (sort.key === "joined") {
      va = new Date(a.createdAt);
      vb = new Date(b.createdAt);
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  const handleRole = async (userId, newRole) => {
    setUpdating(userId);
    const token = getAuthToken();
    try {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) onRoleChange(userId, newRole);
      else alert(data.message);
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="glass-input mb-4"
      />
      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
              <th className="px-4 py-3 font-semibold text-base-content">Name</th>
              <th className="px-4 py-3 font-semibold text-base-content">Email</th>
              <SortableHeader label="Role" sortKey="role" sort={sort} onSort={setSort} />
              <SortableHeader label="Joined" sortKey="joined" sort={sort} onSort={setSort} />
              <th className="px-4 py-3 font-semibold text-base-content">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-base-content/50">
                  No users found
                </td>
              </tr>
            ) : (
              sorted.map((u) => (
                <tr key={u._id} className="bg-white hover:bg-base-200/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-base-content">{u.name}</td>
                  <td className="px-4 py-3 text-base-content/70">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "text-xs font-medium px-2 py-0.5 rounded-full border capitalize " +
                        (roleBadgeClass[u.role] ?? roleBadgeClass.user)
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base-content/50">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u._id === currentUserId ? (
                      <span className="text-xs text-base-content/50 italic">you</span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={updating === u._id}
                        onChange={(e) => handleRole(u._id, e.target.value)}
                        className="glass-input glass-select text-xs px-2 py-1 disabled:opacity-50"
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-base-content/50 mt-2">
        {filtered.length} user{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Tickets");
  const navigate = useNavigate();

  const role = getRole();
  const isAdmin = role === "admin";

  // Get current user id from token
  let currentUserId = null;
  try {
    const token = getAuthToken();
    if (token) currentUserId = JSON.parse(atob(token.split(".")[1])).id;
  } catch {
    /* */
  }

  useEffect(() => {
    if (!role || (role !== "admin" && role !== "moderator")) {
      navigate("/");
      return;
    }

    const token = getAuthToken();
    fetch(import.meta.env.VITE_DEV_URI + "admin/dashboard", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, role]);

  const handleRoleChange = (userId, newRole) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
    }));
  };

  const visibleTabs = isAdmin ? TABS : TABS.filter((t) => t !== "Users");

  if (loading) {
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/70">Loading dashboard…</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer center>
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-base-200 via-white to-base-200 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">
              {isAdmin ? "Admin Dashboard" : "Moderator Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/50 mt-0.5">
              {isAdmin
                ? "Full access — manage events, users, and view all data"
                : "View-only access to tickets, revenue, and teams"}
            </p>
          </div>
          <span
            className={
              "text-xs font-medium px-3 py-1 rounded-full border capitalize shrink-0 " +
              (roleBadgeClass[role] ?? roleBadgeClass.user)
            }
          >
            {role}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-base-300 shadow-sm p-1.5 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                "flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer " +
                (activeTab === tab
                  ? "bg-gradient-to-r from-primary to-primary/70 text-white shadow-sm"
                  : "text-base-content/50 hover:text-base-content hover:bg-base-100")
              }
            >
              {tab}
              {tab === "Tickets" && data && (
                <span
                  className={
                    "ml-1.5 text-xs px-1.5 py-0.5 rounded-full " +
                    (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                  }
                >
                  {data.tickets.length}
                </span>
              )}
              {tab === "Teams" && data && (
                <span
                  className={
                    "ml-1.5 text-xs px-1.5 py-0.5 rounded-full " +
                    (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                  }
                >
                  {data.teams.length}
                </span>
              )}
              {tab === "Courses" && data?.enrollments && (
                <span
                  className={
                    "ml-1.5 text-xs px-1.5 py-0.5 rounded-full " +
                    (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                  }
                >
                  {data.enrollments.length}
                </span>
              )}
              {tab === "Users" && data?.users && (
                <span
                  className={
                    "ml-1.5 text-xs px-1.5 py-0.5 rounded-full " +
                    (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                  }
                >
                  {data.users.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-base-300 shadow-sm p-3 sm:p-6">
          {activeTab === "Tickets" && <TicketsTab tickets={data.tickets} />}
          {activeTab === "Revenue" && <RevenueTab events={data.events} />}
          {activeTab === "Teams" && <TeamsTab teams={data.teams} />}
          {activeTab === "Courses" && (
            <CoursesTab enrollments={data.enrollments ?? []} courses={data.courses ?? []} />
          )}
          {activeTab === "Users" && isAdmin && (
            <UsersTab
              users={data.users}
              currentUserId={currentUserId}
              onRoleChange={handleRoleChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
