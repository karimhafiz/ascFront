import React from "react";
import { useNavigate, useRouteLoaderData } from "react-router-dom";

import { formatDateRange } from "../util/util";

export default function EventCard({ event }) {
  const { token } = useRouteLoaderData("root"); // Retrieve token from the loader
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/events/${event._id}`);
  };

  const handleEditEvent = () => {
    navigate(`/events/${event._id}/edit`, {
      state: { event },
    });
  };

  const handleRemoveEvent = async () => {
    const proceed = window.confirm(
      "Are you sure you want to remove this event? This action cannot be undone."
    );

    if (!proceed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_DEV_URI}events/${event._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token for authentication
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the event.");
      }

      alert("Event deleted successfully!");
      window.location.reload(); // Reload the page to reflect changes
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(error.message || "Failed to delete the event.");
    }
  };

  const renderTags = () => {
    if (!event.categories || event.categories.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {event.categories.map((category, index) => (
          <span
            key={index}
            className="badge bg-purple-200/50 text-purple-700 border-purple-300"
          >
            {category}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card shadow-xl overflow-hidden rounded-xl border border-white/30 backdrop-blur-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="md:w-1/3 w-full p-4">
          {event.images && event.images.length > 0 ? (
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-48 md:h-full object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="bg-white/20 w-full h-48 md:h-full flex items-center justify-center rounded-lg backdrop-blur-sm">
              <span className="text-purple-600/70">No Image</span>
            </div>
          )}
        </div>

        {/* Right side - Content */}
        <div className="md:w-2/3 w-full p-4">
          {/* Title */}
          <h2 className="text-xl font-bold text-purple-700">{event.title}</h2>

          {/* Date and Location */}
          <div className="flex flex-wrap mt-2 text-sm text-indigo-700">
            <div className="mr-6 flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-pink-600"
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
              {formatDateRange(event.date)}
            </div>

            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-pink-600"
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
              <span className="text-indigo-700">
                {event.city}
                {event.street ? `: ${event.street}` : ""}
              </span>
            </div>
          </div>

          {/* Short Description */}
          <p className="mt-3 text-purple-800">{event.shortDescription}</p>

          {/* Tags */}
          <div className="mt-3 mb-4">{renderTags()}</div>

          {/* Action Button */}
          <div className="mt-4">
            <button
              onClick={handleViewDetails}
              className="btn bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none hover:scale-105 transition-all duration-300 shadow-md w-full"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Event Details
            </button>

            {token && (
              <div className="flex space-x-2 mt-2">
                {/* Edit Button */}
                <button
                  onClick={handleEditEvent}
                  className="btn btn-sm glass border-purple-300 text-purple-700 hover:bg-purple-100/30 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                  title="Edit Event"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit</span>
                </button>

                {/* Remove Button */}
                <button
                  onClick={handleRemoveEvent}
                  className="btn btn-sm bg-red-100/50 border-red-300 text-red-700 hover:bg-red-200/50 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                  title="Remove Event"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Tags */}
      {event.featured && (
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-2 backdrop-blur-sm">
          <span className="badge bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none">
            Featured Event
          </span>
        </div>
      )}
    </div>
  );
}
