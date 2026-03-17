import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaUsers, FaTrophy, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

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
      <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
          <p className="text-purple-700">Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="btn bg-purple-600 text-white hover:bg-purple-700 rounded-xl">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-purple-900">Registration Confirmed!</h1>
          <p className="text-purple-600 mt-2">
            Your team has been registered and payment received.
          </p>
        </div>

        {team && (
          <div className="space-y-4">
            {/* Team card */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FaUsers className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-purple-900">Team Details</h2>
              </div>
              <div className="space-y-1.5 text-sm text-purple-800">
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
            </div>

            {/* Event card */}
            {event && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <FaTrophy className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-purple-900">Tournament</h2>
                </div>
                <p className="font-semibold text-purple-900 text-base mb-2">{event.title}</p>
                <div className="space-y-1.5 text-sm text-purple-800">
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-400 flex-shrink-0" />
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
                      <FaMapMarkerAlt className="text-purple-400 flex-shrink-0" />
                      <p>{[event.street, event.city, event.postCode].filter(Boolean).join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What's next */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
              <h2 className="text-lg font-bold text-purple-900 mb-3">What's Next?</h2>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span> Prepare your team for the
                  tournament
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span> Check your email for additional
                  instructions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span> Arrive 30 minutes before your
                  scheduled time
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/profile"
                className="flex-1 btn bg-gradient-to-r from-purple-500 to-pink-500 border-none text-white hover:scale-105 transition-all duration-300 rounded-xl shadow-md"
              >
                View My Profile
              </Link>
              {event && (
                <Link
                  to={`/events/${event._id}`}
                  className="flex-1 btn bg-white/60 border border-purple-200 text-purple-700 hover:bg-white/80 hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  View Tournament
                </Link>
              )}
              <Link
                to="/"
                className="flex-1 btn bg-white/60 border border-purple-200 text-purple-700 hover:bg-white/80 hover:scale-105 transition-all duration-300 rounded-xl"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
