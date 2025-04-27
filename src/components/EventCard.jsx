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
          <span key={index} className="badge badge-outline">
            {category}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="card border-2 border-primary shadow-md overflow-hidden rounded-none">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="md:w-1/4 w-full pl-4 py-4">
          {event.images && event.images.length > 0 ? (
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-35 md:h-full object-cover"
            />
          ) : (
            <div className="bg-base-200 w-full h-40 md:h-full flex items-center justify-center">
              <span className="text-base-content/50">No Image</span>
            </div>
          )}
        </div>

        {/* Right side - Content */}
        <div className="md:w-3/4 w-full bg-base-100 p-4">
          {/* Title */}
          <h2 className="text-xl font-bold text-base-content">{event.title}</h2>

          {/* Date and Location */}
          <div className="flex flex-wrap mt-2 text-sm text-base-content/70">
            <div className="mr-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
                className="h-4 w-4 mr-1"
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
              {event.city}
              {event.street ? `: ${event.street}` : ""}
            </div>
          </div>

          {/* Short Description */}
          <p className="mt-2 text-base-content">{event.shortDescription}</p>

          {/* Action Button */}
          <div className="mt-4">
            <button
              onClick={handleViewDetails}
              className="btn btn-primary w-full"
            >
              Event Details
            </button>
            {token && (
              <div className="flex space-x-2 mt-2">
                {/* Edit Button */}
                <button
                  onClick={handleEditEvent}
                  className="btn btn-sm btn-outline flex items-center space-x-2"
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
                      d="M11 17l-4 4m0 0l4-4m-4 4V3m13 13l-4 4m0 0l4-4m-4 4V3"
                    />
                  </svg>
                  <span>Edit</span>
                </button>

                {/* Remove Button */}
                <button
                  onClick={handleRemoveEvent}
                  className="btn btn-sm btn-error flex items-center space-x-2"
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
                      d="M6 18L18 6M6 6l12 12"
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
      <div className="bg-base-200 p-2 flex justify-between items-center">
        {event.featured && (
          <span className="badge badge-primary rounded-none">Featured</span>
        )}
        {renderTags()}
      </div>
    </div>
  );
}
