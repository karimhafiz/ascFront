import React, { useState } from "react";
import { Link, useNavigate, useRouteLoaderData } from "react-router-dom";
import { isAdmin, isModerator } from "../../auth/auth";
import { formatDateRange, optimizeCloudinaryUrl, toSlug } from "../../util/util";
import ConfirmModal from "../common/ConfirmModal";

const TYPE_COLORS = {
  ASC: { bg: "from-pink-500 to-purple-600", badge: "bg-pink-100 text-pink-700" },
  Sports: { bg: "from-emerald-500 to-teal-600", badge: "bg-emerald-100 text-emerald-700" },
};

export default function EventCard({ event }) {
  const { token } = useRouteLoaderData("root");
  const canManage = isAdmin() || isModerator();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const colors = TYPE_COLORS[event.typeOfEvent] || TYPE_COLORS.ASC;
  const slug = toSlug(event.title, event._id);

  const handleEditEvent = () => {
    navigate(`/events/${slug}/edit`, { state: { event } });
  };

  const handleRemoveEvent = async () => {
    setConfirmOpen(false);
    setDeleteError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_DEV_URI}events/${event._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the event.");
      }
      window.location.reload();
    } catch (error) {
      setDeleteError(error.message || "Failed to delete the event.");
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Event?"
        message={`Are you sure you want to remove "${event.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleRemoveEvent}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="group">
        <div className="glass-card rounded-2xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
          <Link to={`/events/${slug}`} className="block">
            {/* Image */}
            {event.images && event.images.length > 0 ? (
              <img
                src={optimizeCloudinaryUrl(event.images[0])}
                alt={event.title}
                className="w-full h-44 object-cover"
                width="400"
                height="176"
              />
            ) : (
              <div
                className={`w-full h-44 bg-gradient-to-br ${colors.bg} flex items-center justify-center`}
              >
                <svg
                  className="w-14 h-14 text-white/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
              {/* Type badge + recurring badge */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors.badge}`}
                >
                  {event.typeOfEvent}
                </span>
                {event.isReoccurring && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 border border-purple-200">
                    ↻ Recurring
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-purple-900 mb-1 group-hover:text-pink-600 transition-colors line-clamp-2">
                {event.title}
              </h3>

              {/* Short description */}
              <p className="text-sm text-purple-600 mb-3 line-clamp-2">{event.shortDescription}</p>

              {/* Info rows */}
              <div className="space-y-1.5 text-xs text-purple-600">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
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
                  <span>{formatDateRange(event.date)}</span>
                </div>
                {event.city && (
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
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
                    <span>
                      {event.city}
                      {event.street ? `: ${event.street}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Category tags */}
              {event.categories && event.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {event.categories.map((category, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Featured badge — spacer always present to push buttons down */}
              <div className="mt-auto pt-4 min-h-[2rem]">
                {event.featured && (
                  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Delete error */}
          {deleteError && (
            <p className="mx-5 mb-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {deleteError}
            </p>
          )}

          {/* Admin/mod action bar */}
          {canManage && (
            <div className="flex gap-2 p-3 bg-gray-50/80 border-t border-gray-100 mt-auto">
              <button
                onClick={handleEditEvent}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
