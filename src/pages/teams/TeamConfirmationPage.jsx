import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaUsers, FaTrophy, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { toSlug } from "../../util/util";
import { Button, PageContainer, GlassCard, Spinner } from "../../components/ui";

export default function TeamConfirmationPage() {
  const [searchParams] = useSearchParams();
  const [team, setTeam] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const teamId = searchParams.get("teamId"); // session_id no longer needed — backend verified payment before redirecting here

  useEffect(() => {
    if (!teamId) {
      setError("Team ID not found in URL");
      setLoading(false);
      return;
    }

    async function fetchTeamDetails() {
      try {
        const response = await fetch(`${import.meta.env.VITE_DEV_URI}teams/${teamId}`);
        if (!response.ok) throw new Error("Failed to fetch team details");

        const data = await response.json();
        setTeam(data.team);

        if (data.team?.event) {
          const eventRes = await fetch(`${import.meta.env.VITE_DEV_URI}events/${data.team.event}`);
          if (eventRes.ok) {
            const eventData = await eventRes.json();
            setEvent(eventData.event || eventData); // handle both wrapped and direct responses
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load team details");
        setLoading(false);
      }
    }

    fetchTeamDetails();
  }, [teamId]);

  if (loading) {
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-base-content/70">Loading confirmation details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer center>
        <GlassCard className="p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="primary" to="/">
            Return to Home
          </Button>
        </GlassCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-base-content">Registration Confirmed!</h1>
          <p className="text-base-content/70 mt-2">
            Your team has been registered and payment received.
          </p>
        </div>

        {team && (
          <div className="space-y-4">
            {/* Team card */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <FaUsers className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-base-content">Team Details</h2>
              </div>
              <div className="space-y-1.5 text-sm text-base-content/70">
                <p>
                  <span className="font-semibold">Team Name:</span> {team.name}
                </p>
                <p>
                  <span className="font-semibold">Manager:</span> {team.manager?.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {team.manager?.email}
                </p>
                <p>
                  <span className="font-semibold">Players:</span> {team.members?.length || 0}{" "}
                  members
                </p>
              </div>
            </GlassCard>

            {/* Event card */}
            {event && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <FaTrophy className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-base-content">Tournament</h2>
                </div>
                <p className="font-semibold text-base-content text-base mb-2">{event.title}</p>
                <div className="space-y-1.5 text-sm text-base-content/70">
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-base-content/50 flex-shrink-0" />
                      <p>
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {(event.street || event.city) && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-base-content/50 flex-shrink-0" />
                      <p>{[event.street, event.city, event.postCode].filter(Boolean).join(", ")}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {/* What's next */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-base-content mb-3">What's Next?</h2>
              <ul className="space-y-2 text-sm text-base-content/70">
                <li className="flex items-start gap-2">
                  <span className="text-base-content/50 mt-0.5">•</span> Prepare your team for the
                  tournament
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base-content/50 mt-0.5">•</span> Check your email for
                  additional instructions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base-content/50 mt-0.5">•</span> Arrive 30 minutes before
                  your scheduled time
                </li>
              </ul>
            </GlassCard>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="primary" to="/profile" className="flex-1">
                View My Profile
              </Button>
              {event && (
                <Button
                  variant="ghost"
                  to={`/events/${toSlug(event.title, event._id)}`}
                  aria-label={`View ${event.title} tournament`}
                  className="flex-1"
                >
                  View Tournament
                </Button>
              )}
              <Button variant="ghost" to="/" className="flex-1">
                Return to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
