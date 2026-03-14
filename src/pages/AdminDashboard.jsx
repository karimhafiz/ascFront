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

import { getAuthToken, getUserRole as getAuthRole } from "../auth/auth";

function getRole() {
  return getAuthRole();
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TABS = ["Tickets", "Revenue", "Teams", "Courses", "Users"];

const roleBadgeClass = {
  admin: "bg-yellow-100 text-yellow-800 border-yellow-300",
  moderator: "bg-blue-100 text-blue-700 border-blue-200",
  user: "bg-gray-100 text-gray-600 border-gray-200",
};

// ─── Tab: Tickets ─────────────────────────────────────────────────────────────

function TicketsTab({ tickets }) {
  const [search, setSearch] = useState("");
  const filtered = tickets.filter(t =>
    t.buyerEmail?.toLowerCase().includes(search.toLowerCase()) ||
    t.eventId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search by buyer email or event…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-xl border border-gray-200 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-pink-50 to-purple-50 text-left">
              <th className="px-4 py-3 font-semibold text-purple-700">Event</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Buyer Email</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Qty</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Paid</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Date</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No tickets found</td></tr>
            ) : filtered.map(t => (
              <tr key={t._id} className="bg-white hover:bg-pink-50/30 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{t.eventId?.title ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{t.buyerEmail}</td>
                <td className="px-4 py-3 text-gray-600">{t.quantity ?? 1}</td>
                <td className="px-4 py-3 text-green-700 font-medium">
                  £{((t.eventId?.ticketPrice ?? 0) * (t.quantity ?? 1)).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(t.createdAt)}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-gray-300">
                  {t.paymentId ? "…" + t.paymentId.slice(-8) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}

// ─── Tab: Revenue ─────────────────────────────────────────────────────────────

function RevenueTab({ events }) {
  const chartData = {
    labels: events.map(e => e.title),
    datasets: [
      {
        label: "Revenue (£)",
        data: events.map(e => e.totalRevenue ?? 0),
        backgroundColor: "rgba(147, 51, 234, 0.6)",
        borderColor: "rgba(147, 51, 234, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const totalRevenue = events.reduce((sum, e) => sum + (e.totalRevenue ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-700">£{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 mb-1">Events with Sales</p>
          <p className="text-2xl font-bold text-pink-600">{events.filter(e => (e.totalRevenue ?? 0) > 0).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-indigo-600">{events.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="h-72">
          <Bar data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => "£" + v } } },
          }} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-pink-50 to-purple-50 text-left">
              <th className="px-4 py-3 font-semibold text-purple-700">Event</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Revenue</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Tickets Left</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Price/ticket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.map(e => (
              <tr key={e._id} className="bg-white hover:bg-pink-50/30 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{e.title}</td>
                <td className="px-4 py-3 text-green-700 font-medium">£{(e.totalRevenue ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{e.ticketsAvailable ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">£{(e.ticketPrice ?? 0).toFixed(2)}</td>
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

  return (
    <div className="space-y-3">
      {teams.length === 0 && (
        <p className="text-center text-gray-400 py-12">No team registrations yet</p>
      )}
      {teams.map(team => (
        <div key={team._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{team.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {team.event?.title ?? "Unknown event"}
                {team.event?.date && <span> · {formatDate(team.event.date)}</span>}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Manager: {team.manager?.name} · {team.manager?.email}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={"text-xs font-medium px-2 py-0.5 rounded-full border " + (
                team.paid
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-orange-50 text-orange-600 border-orange-200"
              )}>
                {team.paid ? "✓ Paid" : "Pending"}
              </span>
              <span className="text-xs text-gray-400">{team.members?.length ?? 0} members</span>
            </div>
          </div>
          {team.members?.length > 0 && (
            <div className="px-5 pb-4">
              <button
                onClick={() => setExpanded(expanded === team._id ? null : team._id)}
                className="text-xs text-purple-500 hover:text-purple-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                {expanded === team._id ? "Hide members" : "Show members"}
                <svg className={"w-3 h-3 transition-transform " + (expanded === team._id ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expanded === team._id && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {team.members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50/50 rounded-lg px-3 py-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-[10px]">
                        {m.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      <span>{m.name}</span>
                      {m.email && <span className="text-gray-400">· {m.email}</span>}
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

// ─── Tab: Users (admin only) ──────────────────────────────────────────────────

function UsersTab({ users, currentUserId, onRoleChange }) {
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

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
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-xl border border-gray-200 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-pink-50 to-purple-50 text-left">
              <th className="px-4 py-3 font-semibold text-purple-700">Name</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Email</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Role</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Joined</th>
              <th className="px-4 py-3 font-semibold text-purple-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u._id} className="bg-white hover:bg-pink-50/30 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={"text-xs font-medium px-2 py-0.5 rounded-full border capitalize " + (roleBadgeClass[u.role] ?? roleBadgeClass.user)}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u._id === currentUserId ? (
                    <span className="text-xs text-gray-400 italic">you</span>
                  ) : (
                    <select
                      value={u.role}
                      disabled={updating === u._id}
                      onChange={e => handleRole(u._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50"
                    >
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

// ─── Tab: Courses ─────────────────────────────────────────────────────────────

function CoursesTab({ enrollments, courses }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("enrollments");

  const filteredEnrollments = enrollments.filter(e =>
    e.buyerEmail?.toLowerCase().includes(search.toLowerCase()) ||
    e.courseId?.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search courses or emails…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <div className="flex bg-purple-50 rounded-xl p-1 gap-1">
          {["enrollments", "courses"].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${view === v ? "bg-white shadow-sm text-purple-700" : "text-gray-500 hover:text-gray-700"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "enrollments" && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-pink-50 to-purple-50 text-left">
                  <th className="px-4 py-3 font-semibold text-purple-700">Course</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Buyer Email</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Participants</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEnrollments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No enrollments found</td></tr>
                ) : filteredEnrollments.map(e => (
                  <tr key={e._id} className="bg-white hover:bg-pink-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{e.courseId?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{e.buyerEmail}</td>
                    <td className="px-4 py-3 text-gray-600">{e.participants?.length > 0 ? e.participants.map(p => p.name).join(", ") : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${e.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                        {e.status === "paid" ? "✓ Paid" : "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">{filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}</p>
        </>
      )}

      {view === "courses" && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-pink-50 to-purple-50 text-left">
                  <th className="px-4 py-3 font-semibold text-purple-700">Title</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Instructor</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Category</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Price</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Enrolled</th>
                  <th className="px-4 py-3 font-semibold text-purple-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCourses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No courses found</td></tr>
                ) : filteredCourses.map(c => (
                  <tr key={c._id} className="bg-white hover:bg-pink-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600">{c.instructor}</td>
                    <td className="px-4 py-3 text-gray-600">{c.category}</td>
                    <td className="px-4 py-3 text-gray-600">{c.price > 0 ? `£${c.price}` : "Free"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.currentEnrollment}{c.maxEnrollment ? ` / ${c.maxEnrollment}` : ""}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.enrollmentOpen ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {c.enrollmentOpen ? "Open" : "Closed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">{filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}</p>
        </>
      )}
    </div>
  );
}

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
  } catch { /* */ }


  useEffect(() => {
    if (!role || (role !== "admin" && role !== "moderator")) {
      navigate("/");
      return;
    }

    const token = getAuthToken();
    fetch(import.meta.env.VITE_DEV_URI + "admin/dashboard", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(async res => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, role]);

  const handleRoleChange = (userId, newRole) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u._id === userId ? { ...u, role: newRole } : u),
    }));
  };

  const visibleTabs = isAdmin ? TABS : TABS.filter(t => t !== "Users");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-purple-500 animate-spin" />
          <p className="text-sm text-purple-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? "Admin Dashboard" : "Moderator Dashboard"}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isAdmin ? "Full access — manage events, users, and view all data" : "View-only access to tickets, revenue, and teams"}
            </p>
          </div>
          <span className={"text-xs font-medium px-3 py-1 rounded-full border capitalize " + (roleBadgeClass[role] ?? roleBadgeClass.user)}>
            {role}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-1.5">
          {visibleTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={"flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all " + (
                activeTab === tab
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {tab}
              {tab === "Tickets" && data && (
                <span className={"ml-1.5 text-xs px-1.5 py-0.5 rounded-full " + (activeTab === tab ? "bg-white/20" : "bg-gray-100 text-gray-500")}>
                  {data.tickets.length}
                </span>
              )}
              {tab === "Teams" && data && (
                <span className={"ml-1.5 text-xs px-1.5 py-0.5 rounded-full " + (activeTab === tab ? "bg-white/20" : "bg-gray-100 text-gray-500")}>
                  {data.teams.length}
                </span>
              )}
              {tab === "Courses" && data?.enrollments && (
                <span className={"ml-1.5 text-xs px-1.5 py-0.5 rounded-full " + (activeTab === tab ? "bg-white/20" : "bg-gray-100 text-gray-500")}>
                  {data.enrollments.length}
                </span>
              )}
              {tab === "Users" && data?.users && (
                <span className={"ml-1.5 text-xs px-1.5 py-0.5 rounded-full " + (activeTab === tab ? "bg-white/20" : "bg-gray-100 text-gray-500")}>
                  {data.users.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm p-6">
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