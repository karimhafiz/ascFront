import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GlassCard, PageContainer, Spinner } from "../../components/ui";
import { toSlug } from "../../util/util";
import { isAdmin, isModerator } from "../../auth/auth";
import { queryKeys } from "../../api/queryKeys";
import { fetchOrThrow } from "../../util/errorUtil";

const API = import.meta.env.VITE_DEV_URI;

export default function VenueBooking() {
  const canManage = isAdmin() || isModerator();

  const {
    data: venues = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.venues.all,
    queryFn: async () => {
      const response = await fetchOrThrow(`${API}venues/`);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to load venues.");
      }
      return data;
    },
  });

  return (
    <PageContainer className="pb-12">
      <Helmet>
        <title>Venue Booking | Ayendah Sazan</title>
        <meta
          name="description"
          content="Browse available venues and book a slot for your event."
        />
      </Helmet>

      <section className="page-section pt-6 md:pt-8">
        <div className="hero-panel mb-8 rounded-4xl p-8 sm:p-10">
          <span className="section-kicker mb-5 border-white/10 bg-white/8 text-white">
            Venue Hire
          </span>
          <h1 className="mb-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
            Book a Venue
          </h1>
          <p className="text-base leading-8 text-neutral-content/82">
            Browse our available venues, choose a date and time slot, and proceed to secure
            checkout.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <GlassCard className="rounded-4xl p-8 text-center">
            <p className="text-base-content/70">{error.message}</p>
          </GlassCard>
        ) : venues.length === 0 ? (
          <GlassCard className="rounded-4xl p-8 text-center">
            <p className="text-base-content/70">No venues are currently available for booking.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <GlassCard key={venue._id} className="rounded-4xl p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-base-content">{venue.name}</h2>
                  {venue.description && (
                    <p className="mt-2 text-sm leading-6 text-base-content/70 line-clamp-3">
                      {venue.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {venue.capacity && (
                    <span className="rounded-full border border-base-300 bg-base-100 px-3 py-1.5 font-semibold uppercase tracking-[0.08em] text-base-content/70">
                      Up to {venue.capacity} guests
                    </span>
                  )}
                  {venue.pricePerHour && (
                    <span className="rounded-full border border-base-300 bg-base-100 px-3 py-1.5 font-semibold uppercase tracking-[0.08em] text-base-content/70">
                      £{venue.pricePerHour} per slot
                    </span>
                  )}
                </div>

                {[venue.street, venue.city, venue.postCode].filter(Boolean).length > 0 && (
                  <p className="text-sm text-base-content/60">
                    {[venue.street, venue.city, venue.postCode].filter(Boolean).join(", ")}
                  </p>
                )}

                {venue.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {venue.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full border border-base-300 bg-base-100 px-2.5 py-1 text-xs text-base-content/60"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-2">
                  <Link
                    to={`/venues/book/${toSlug(venue.name, venue._id)}`}
                    className="btn btn-primary w-full rounded-2xl"
                  >
                    Book this Venue
                  </Link>
                  {canManage && (
                    <Link
                      to={`/venues/${toSlug(venue.name, venue._id)}/slots`}
                      className="btn btn-ghost w-full rounded-2xl border border-base-300 text-sm"
                    >
                      Manage Slots
                    </Link>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
