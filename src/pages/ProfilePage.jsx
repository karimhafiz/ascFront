import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, fetchWithAuth } from "../auth/auth";
import { Button, Spinner } from "../components/ui";
import MyTeamRow from "../components/teams/MyTeamRow";
import OrderRow from "../components/profile/OrderRow";
import EnrollmentRow from "../components/profile/EnrollmentRow";
import VenueBookingRow from "../components/profile/VenueBookingRow";
import EventSubscriptionRow from "../components/profile/EventSubscriptionRow";
import MyContentRequestsPanel from "../components/profile/MyContentRequestsPanel";
import { API } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";

const TABS = ["Tickets", "Teams", "Enrollments", "Venues"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Tickets");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}users/profile`);
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: isAuthenticated(),
  });

  const error = queryError?.message;

  const refreshProfile = () => queryClient.invalidateQueries({ queryKey: queryKeys.profile });

  // Group tickets by paymentId so bulk purchases show as one order
  // Hooks must be called before any early returns
  const Tickets = useMemo(() => {
    if (!data) return [];
    const groups = {};
    for (const ticket of data.tickets) {
      const key = ticket.paymentId || ticket._id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ticket);
    }
    return Object.values(groups);
  }, [data]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-200 via-white to-base-200">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/50">Loading your profile…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-200 via-white to-base-200">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link to="/" className="text-sm text-base-content/70 hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );

  const { user, teams, enrollments = [], eventSubscriptions = [], venueBookings = [] } = data;
  const visibleTabs = user.role === "moderator" ? [...TABS, "Requests"] : TABS;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 via-white to-base-200">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-primary/20 shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-base-content">{user.name}</h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                  user.role === "admin"
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : user.role === "moderator"
                      ? "bg-base-200 text-base-content border border-base-300"
                      : "bg-base-200 text-base-content/50 border border-base-300"
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="flex gap-4 mt-1 text-sm text-base-content/50">
              <span>
                <strong className="text-base-content">{Tickets.length}</strong> order
                {Tickets.length !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                <strong className="text-base-content">{teams.length}</strong> team
                {teams.length !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                <strong className="text-base-content">
                  {enrollments.length + eventSubscriptions.length}
                </strong>{" "}
                enrollment{enrollments.length + eventSubscriptions.length !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                <strong className="text-base-content">{venueBookings.length}</strong> venue
                {venueBookings.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-base-300 mb-6">
          <div className="flex gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/50 hover:text-base-content hover:border-base-300"
                }`}
              >
                {tab}
                {tab !== "Requests" && (
                  <span
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab
                        ? "bg-base-200 text-primary"
                        : "bg-base-200 text-base-content/50"
                    }`}
                  >
                    {tab === "Tickets"
                      ? Tickets.length
                      : tab === "Teams"
                        ? teams.length
                        : tab === "Venues"
                          ? venueBookings.length
                          : enrollments.length + eventSubscriptions.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="pb-16">
          {activeTab === "Tickets" &&
            (Tickets.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-primary/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <p className="text-base-content/50 mb-4">No ticket Tickets yet.</p>
                <Button variant="primary" size="sm" to="/events/asc">
                  Browse events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Tickets.map((group) => (
                  <OrderRow key={group[0].paymentId || group[0]._id} tickets={group} />
                ))}
              </div>
            ))}

          {activeTab === "Teams" &&
            (teams.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-base-content/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-base-content/50">No team registrations yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <MyTeamRow key={team._id} team={team} onTeamUpdated={refreshProfile} />
                ))}
              </div>
            ))}

          {activeTab === "Enrollments" &&
            (enrollments.length === 0 && eventSubscriptions.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-base-content/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-base-content/50 mb-4">No enrollments yet.</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="primary" size="sm" to="/events/asc">
                    Browse events
                  </Button>
                  <Button variant="secondary" size="sm" to="/courses">
                    Browse courses
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {eventSubscriptions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                      Events
                    </h3>
                    <div className="space-y-4">
                      {eventSubscriptions.map((sub) => (
                        <EventSubscriptionRow
                          key={sub._id}
                          subscription={sub}
                          onAction={refreshProfile}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {enrollments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
                      Courses
                    </h3>
                    <div className="space-y-4">
                      {enrollments.map((enrollment) => (
                        <EnrollmentRow
                          key={enrollment._id}
                          enrollment={enrollment}
                          onAction={refreshProfile}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          {activeTab === "Venues" &&
            (venueBookings.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-base-content/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-base-content/50 mb-4">No venue bookings yet.</p>
                <Button variant="primary" size="sm" to="/venues">
                  Browse venues
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {venueBookings.map((booking) => (
                  <VenueBookingRow key={booking._id} booking={booking} />
                ))}
              </div>
            ))}

          {activeTab === "Requests" && <MyContentRequestsPanel />}
        </div>
      </div>
    </div>
  );
}
