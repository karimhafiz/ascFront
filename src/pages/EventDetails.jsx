import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import TeamSignupForm from "../components/TeamSignupForm";

async function loadEvents(eventId) {
  const response = await fetch(
    `${import.meta.env.VITE_DEV_URI}events/${eventId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch event details");
  }
  const resData = await response.json();
  return resData || [];
}

export async function eventDetailLoader({ params }) {
  const { eventId } = params;
  return loadEvents(eventId);
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1); // Default ticket quantity
  const [email, setEmail] = useState(""); // User's email
  const [showTeamSignup, setShowTeamSignup] = useState(false);

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Fetch event details using React Query
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_DEV_URI}events/${eventId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      return response.json();
    },
  });
  // Check if the event is a tournament
  const isTournament = event && event.isTournament;

  // Handle buying tickets
  const handleBuyTickets = async () => {
    // If this is a tournament, open the team signup modal instead of default flow
    if (isTournament) {
      if (!email) {
        alert("Please enter your email to proceed.");
        return;
      }
      setShowTeamSignup(true);
      return;
    }
    if (!email) {
      alert("Please enter your email to proceed.");
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_DEV_URI}payments/pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: event.ticketPrice * quantity, // Calculate total price
          eventId: eventId,
          email: email, // Include user's email
          quantity: quantity, // Include ticket quantity
        }),
      }
    );

    const data = await response.json();
    if (data.link) {
      window.location.href = data.link; // Redirect to PayPal
    }
  };

  const handleShare = (platform) => {
    // Since we only have Facebook now, we can simplify this function
    window.open(
      `https://www.facebook.com/profile.php?id=100081705505202`,
      "_blank"
    );
  };

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>;

  // Check if the event date is in the past
  const isEventInPast = new Date(event.date) < new Date();
  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 md:p-12 shadow-lg backdrop-blur-sm">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-2">
            {event.title}
          </h1>
          {event.organizer && (
            <p className="text-center text-lg">
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {event.organizer}
              </span>
            </p>
          )}
        </div>
      </div>{" "}
      <div className="container mx-auto p-4">
        {/* Social Sharing Button - Facebook and URL Copy */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => handleShare("facebook")}
            className="btn btn-circle glass bg-gradient-to-br from-pink-400 to-purple-500 text-white hover:scale-110 transition-all duration-300 border-none shadow-md"
            aria-label="Share on Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </button>
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Event Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Image */}
            {event.images && event.images.length > 0 && (
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-auto object-cover rounded-2xl shadow-xl"
              />
            )}
            {/* Event Details */}
            <div className="glass-card rounded-2xl shadow-xl border border-white/30 backdrop-blur-md">
              {" "}
              <div className="card-body">
                <h2 className="card-title text-xl text-pink-700">
                  Event Details:
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    {" "}
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-3 rounded-xl mr-4 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-purple-900">
                        Date & Time
                      </h3>
                      <p className="text-purple-800">
                        {new Date(event.date).toLocaleDateString()},{" "}
                        {event.openingTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    {" "}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl mr-4 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-purple-900">
                        Location
                      </h3>
                      <p className="text-purple-800">
                        {event.street}, {event.city}, {event.postCode}
                      </p>
                    </div>
                  </div>

                  {event.ticketPrice > 0 && (
                    <div className="flex items-start">
                      {" "}
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-3 rounded-xl mr-4 shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
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
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-purple-900">
                          Ticket Price
                        </h3>
                        <p className="text-purple-800">${event.ticketPrice}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>{" "}
            {/* Event Description */}
            <div className="glass-card rounded-2xl shadow-xl border border-white/30 backdrop-blur-md">
              <div className="card-body">
                <h2 className="card-title text-xl text-indigo-700">
                  About This Event
                </h2>
                <div className="prose max-w-none text-purple-900">
                  <p>{event.longDescription}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right column: Ticket Purchase */}
          <div className="md:col-span-1">
            {!isEventInPast ? (
              <div className="glass-card shadow-xl border border-white/30 backdrop-blur-md rounded-2xl sticky top-4 hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  {" "}
                  <h2 className="card-title text-xl text-pink-700">
                    {event.isTournament
                      ? "Team Registration"
                      : "Purchase Tickets"}
                  </h2>
                  <div className="space-y-4">
                    {/* Always show email field for both regular and tournament events */}
                    <div>
                      <label className="block text-md font-medium mb-2 text-purple-700">
                        Your Email:
                      </label>{" "}
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input bg-white/60 border-white/30 focus:border-purple-400 w-full backdrop-blur-sm rounded-xl text-purple-900"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    {/* Show quantity field only for regular events */}
                    {!event.isTournament && (
                      <div>
                        {" "}
                        <label className="block text-md font-medium mb-2 text-purple-700">
                          Ticket Quantity:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="input bg-white/60 border-white/30 focus:border-purple-400 w-full backdrop-blur-sm rounded-xl text-purple-900"
                        />
                      </div>
                    )}{" "}
                    <div className="pt-2">
                      <button
                        className="btn bg-gradient-to-r from-pink-500 to-purple-600 w-full border-none text-white hover:scale-105 transition-all duration-300 shadow-md rounded-xl"
                        onClick={handleBuyTickets}
                      >
                        {event.isTournament
                          ? "Register & Pay for Team"
                          : "Buy Tickets"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card bg-red-100/30 shadow-xl border border-red-300/50 rounded-2xl">
                <div className="card-body">
                  <h2 className="card-title text-xl text-red-600">
                    Event Has Ended
                  </h2>
                  <p className="text-red-500">
                    This event has already occurred. Ticket purchases are no
                    longer available.
                  </p>
                </div>
              </div>
            )}
          </div>{" "}
        </div>
        {/* TeamSignupForm Modal */}
        {showTeamSignup && (
          <TeamSignupForm
            eventId={eventId}
            managerId={email} // Pass manager email from the input field
            onSuccess={() => {
              setShowTeamSignup(false);
              // Optionally trigger team list refresh here
              // setTeamListRefresh((v) => v + 1);
            }}
            onClose={() => setShowTeamSignup(false)}
          />
        )}
        {/* Back Button */}
        <div className="mt-8 mb-4">
          <button
            className="btn glass border border-purple-300 text-purple-700 hover:bg-purple-100/30 hover:scale-105 transition-all duration-300"
            onClick={handleBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}
