import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

import { getAuthToken, getUserRole as getAuthRole, fetchWithAuth } from "../../auth/auth";
import { PageContainer, Spinner } from "../../components/ui";
import { roleBadgeClass } from "../../components/admin/adminHelpers";
import TicketsTab from "../../components/admin/TicketsTab";
import RevenueTab from "../../components/admin/RevenueTab";
import TeamsTab from "../../components/admin/TeamsTab";
import CoursesTab from "../../components/admin/CoursesTab";
import UsersTab from "../../components/admin/UsersTab";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";

const TABS = ["Tickets", "Revenue", "Teams", "Courses", "Users"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Tickets");
  const navigate = useNavigate();

  const role = getAuthRole();
  const isAdmin = role === "admin";

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
    }
  }, [role, navigate]);

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}admin/dashboard`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
    enabled: role === "admin" || role === "moderator",
  });

  const error = queryError?.message;

  const queryClient = useQueryClient();

  const handleRoleChange = (userId, newRole) => {
    queryClient.setQueryData(queryKeys.admin.dashboard, (prev) =>
      prev
        ? {
            ...prev,
            users: prev.users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
          }
        : prev
    );
  };

  const handleBanToggle = (userId, isBanned) => {
    queryClient.setQueryData(queryKeys.admin.dashboard, (prev) =>
      prev
        ? { ...prev, users: prev.users.map((u) => (u._id === userId ? { ...u, isBanned } : u)) }
        : prev
    );
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
    <div className="min-h-screen bg-gradient-to-tr from-base-200 via-white to-base-200 pt-10 px-4 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Sticky header + tabs */}
        <div className="sticky top-0 z-20 pb-6 -mx-4 px-4 [mask-image:linear-gradient(black_85%,transparent)] backdrop-blur-xl">
          <div className="max-w-5xl mx-auto space-y-4 pt-1">
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
            <div className="flex flex-wrap justify-center sm:flex-nowrap gap-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-base-300 shadow-sm p-1.5">
              {visibleTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    "basis-[30%] sm:basis-auto sm:flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-center " +
                    (activeTab === tab
                      ? "bg-gradient-to-r from-primary to-primary/70 text-white shadow-sm"
                      : "text-base-content/50 hover:text-base-content hover:bg-base-100")
                  }
                >
                  {tab}
                  {tab === "Tickets" && data && (
                    <span
                      className={
                        "ml-1.5 text-xs px-1.5 py-0.5 rounded-full hidden sm:inline " +
                        (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                      }
                    >
                      {data.tickets.length}
                    </span>
                  )}
                  {tab === "Teams" && data && (
                    <span
                      className={
                        "ml-1.5 text-xs px-1.5 py-0.5 rounded-full hidden sm:inline " +
                        (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                      }
                    >
                      {data.teams.length}
                    </span>
                  )}
                  {tab === "Courses" && data?.enrollments && (
                    <span
                      className={
                        "ml-1.5 text-xs px-1.5 py-0.5 rounded-full hidden sm:inline " +
                        (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                      }
                    >
                      {data.enrollments.length}
                    </span>
                  )}
                  {tab === "Users" && data?.users && (
                    <span
                      className={
                        "ml-1.5 text-xs px-1.5 py-0.5 rounded-full hidden sm:inline " +
                        (activeTab === tab ? "bg-white/20" : "bg-base-200 text-base-content/50")
                      }
                    >
                      {data.users.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-base-300 shadow-sm p-3 sm:p-6 mt-2">
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
              onBanToggle={handleBanToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
