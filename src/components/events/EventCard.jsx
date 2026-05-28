import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../common/ConfirmModal";
import { Badge, GlassCard } from "../ui";
import { fetchWithAuth, isAdmin, isModerator } from "../../auth/auth";
import { formatDateRange, optimizeCloudinaryUrl, toSlug } from "../../util/util";

const TYPE_COLORS = {
  ASC: { bg: "from-primary to-neutral", badge: "primary" },
  Sports: { bg: "from-accent to-primary", badge: "accent" },
};

export default function EventCard({ event }) {
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
      const response = await fetchWithAuth(`${import.meta.env.VITE_DEV_URI}events/${event._id}`, {
        method: "DELETE",
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

      <div className="group h-full">
        <GlassCard className="flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-strong)]">
          <Link to={`/events/${slug}`} className="block">
            {event.images && event.images.length > 0 ? (
              <div className="relative h-52 overflow-hidden">
                <img
                  src={optimizeCloudinaryUrl(event.images[0])}
                  alt={event.title}
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  width="400"
                  height="208"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
            ) : (
              <div
                className={`flex h-52 w-full items-center justify-center bg-gradient-to-br ${colors.bg}`}
              >
                <svg
                  className="h-14 w-14 text-white/60"
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

            <div className="p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge color={colors.badge}>{event.typeOfEvent}</Badge>
                {isPast && <Badge color="error">Past</Badge>}
                {event.featured && <Badge color="info">Featured</Badge>}
                {event.isReoccurring && <Badge color="secondary">Recurring</Badge>}
              </div>

              <h3 className="mb-2 line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-base-content transition-colors group-hover:text-primary">
                {event.title}
              </h3>

              <p className="mb-4 line-clamp-3 text-sm leading-6 text-base-content/70">
                {event.shortDescription}
              </p>

              <div className="space-y-2 text-sm text-base-content/72">
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
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
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary"
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
                  <div className="flex flex-wrap items-center gap-4">
                    {event.ticketPrice != null && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 flex-shrink-0 text-accent"
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
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 flex-shrink-0 text-primary"
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

              {event.categories && event.categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.categories.map((category, index) => (
                    <Badge key={index} color="ghost">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Link>

          {deleteError && (
            <p className="mx-5 mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
              {deleteError}
            </p>
          )}

          {canManage && (
            <div className="mt-auto flex gap-2 border-t border-base-300/80 bg-base-100/70 p-4">
              <button
                onClick={handleEditEvent}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-base-300 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-base-content transition-all hover:border-primary/20 hover:text-primary"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-red-600 transition-all hover:bg-red-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
