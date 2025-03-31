import React, { useState } from "react";
import { useNavigate, useRouteLoaderData } from "react-router-dom";

export default function EventCard({ event }) {
  const { token } = useRouteLoaderData("root"); // Retrieve token from the loader
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for confirmation modal

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
        `http://localhost:5000/api/events/${event._id}`,
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

  return (
    <div className="card bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Event Image */}
      {event.images.length > 0 && (
        <div className="relative">
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {new Date(event.date).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
        <p className="text-gray-600 mt-2">{event.shortDescription}</p>
        <p className="text-sm text-gray-500 mt-2">
          <strong>Location:</strong> {event.city}, {event.street}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Ticket Price:</strong> ${event.ticketPrice}
        </p>

        {/* Actions */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleViewDetails}
          >
            View Details
          </button>
          {token && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleEditEvent}
              >
                Edit
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={handleRemoveEvent}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
