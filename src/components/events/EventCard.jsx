import React, { useState } from "react";
import { Link, useNavigate, useRouteLoaderData } from "react-router-dom";
import { isAdmin, isModerator } from "../../auth/auth";
import { formatDateRange, optimizeCloudinaryUrl, toSlug } from "../../util/util";
import ConfirmModal from "../common/ConfirmModal";
import { Badge, GlassCard } from "../ui";

const TYPE_COLORS = {
  ASC: { bg: "from-primary to-primary/70", badge: "primary" },
  Sports: { bg: "from-accent to-success", badge: "accent" },
};

export default function EventCard({ event }) {
  const { token } = useRouteLoaderData("root");
  const canManage = isAdmin() || isModerator();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const colors = TYPE_COLORS[event.typeOfEvent] || TYPE_COLORS.ASC;
  const slug = toSlug(event.title, event._id);
  const endDate = event.isReoccurring ? event.reoccurringEndDate : event.date;
  const isPast = endDate ? new Date(endDate) < new Date() : false;

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
        <GlassCard className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
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

            <div className="p-5">
              {/* Badges */}
              <div className="flex items-center flex-wrap gap-1.5 mb-2">
                <Badge color={colors.badge}>{event.typeOfEvent}</Badge>
                {isPast && <Badge color="error">Past</Badge>}
                {event.featured && <Badge color="info">★ Featured</Badge>}
                {event.isReoccurring && <Badge color="secondary">↻ Recurring</Badge>}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-base-content mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {event.title}
              </h3>

              {/* Short description */}
              <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                {event.shortDescription}
              </p>

              {/* Info rows */}
              <div className="space-y-1.5 text-xs text-base-content/70">
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
                {(event.ticketPrice != null || event.ticketsAvailable != null) && (
                  <div className="flex items-center gap-3">
                    {event.ticketPrice != null && (
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {event.ticketPrice > 0 ? `£${event.ticketPrice.toFixed(2)}` : "Free"}
                        </span>
                      </div>
                    )}
                    {event.ticketsAvailable != null && (
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
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                        <span>{event.ticketsAvailable} left</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category tags */}
              {event.categories && event.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {event.categories.map((category, index) => (
                    <Badge key={index} color="info">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
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
            <div className="flex gap-2 p-3 bg-base-100/50 border-t border-base-300 mt-auto">
              <button
                onClick={handleEditEvent}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content text-xs font-semibold transition-all cursor-pointer"
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
        </GlassCard>
      </div>
    </>
  );
}
