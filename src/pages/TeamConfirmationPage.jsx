import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaUsers,
  FaTrophy,
  FaCalendarAlt,
} from "react-icons/fa";

export default function TeamConfirmationPage() {
  const [searchParams] = useSearchParams();
  const [team, setTeam] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const teamId = searchParams.get("teamId");

  useEffect(() => {
    if (!teamId) {
      setError("Team ID not found in URL");
      setLoading(false);
      return;
    }

    async function fetchTeamDetails() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_DEV_URI}teams/${teamId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team details");
        }

        const data = await response.json();
        setTeam(data.team);

        // Fetch event details
        if (data.team && data.team.event) {
          const eventRes = await fetch(
            `${import.meta.env.VITE_DEV_URI}events/${data.team.event}`
          );

          if (eventRes.ok) {
            const eventData = await eventRes.json();
            setEvent(eventData.event);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching team details:", err);
        setError(err.message || "Failed to load team details");
        setLoading(false);
      }
    }

    fetchTeamDetails();
  }, [teamId]);

  if (loading) {
    return (
      <div className="container mx-auto mt-16 px-4 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-purple-700">
            Loading confirmation details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-16 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl text-red-700 font-bold mb-4">Error</h1>
          <p className="text-red-600">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-16 px-4 mb-16">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Background gradient header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 py-8 px-6 text-center">
          <FaCheckCircle className="mx-auto text-white text-5xl mb-4" />
          <h1 className="text-3xl font-bold text-white">
            Registration Confirmed!
          </h1>
          <p className="text-purple-100 mt-2">
            Your team has been successfully registered for the tournament
          </p>
        </div>

        {/* Confirmation details */}
        <div className="p-8">
          {team && (
            <div className="space-y-6">
              {/* Team info */}
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaUsers className="text-purple-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Team Details
                  </h3>
                  <p className="text-gray-600 font-medium text-lg">
                    {team.name}
                  </p>
                  <div className="mt-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Manager:</span>{" "}
                      {team.manager?.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {team.manager?.email}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Team Size:</span>{" "}
                      {team.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Event info */}
              {event && (
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <FaTrophy className="text-pink-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Tournament Details
                    </h3>
                    <p className="text-gray-600 font-medium text-lg">
                      {event.title}
                    </p>
                    <div className="mt-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Location:</span>{" "}
                        {event.location}
                      </p>
                      <div className="flex items-center mt-1">
                        <FaCalendarAlt className="text-gray-500 mr-2" />
                        <p className="text-gray-600">
                          {new Date(event.date).toLocaleDateString("en-GB", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Status */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-6">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <p className="ml-3 text-green-800 font-medium">
                    Payment Confirmed
                  </p>
                </div>
              </div>

              {/* Next steps */}
              <div className="bg-purple-50 rounded-xl p-6 mt-4">
                <h3 className="font-semibold text-purple-800 text-lg mb-3">
                  What's Next?
                </h3>
                <ul className="list-disc list-inside space-y-2 text-purple-700">
                  <li>Prepare your team for the tournament</li>
                  <li>Check your email for additional instructions</li>
                  <li>Arrive 30 minutes before your scheduled time</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link
                  to="/"
                  className="btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg text-center"
                >
                  Return to Home
                </Link>
                {event && (
                  <Link
                    to={`/events/${event._id}`}
                    className="btn bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-6 rounded-lg text-center"
                  >
                    View Tournament Details
                  </Link>
                )}
              </div>
            </div>
          )}

          {!team && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                Team details not found. Please contact the administrator.
              </p>
              <Link
                to="/"
                className="btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg mt-4 inline-block"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
