import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import TeamSignupForm from "../../components/teams/TeamSignupForm";
import { slugToId } from "../../util/util";
import { Button, PageContainer, GlassCard, Spinner } from "../../components/ui";
import EventDetailsBanner from "../../components/events/EventDetailsBanner";
import EventInfoGrid from "../../components/events/EventInfoGrid";
import TicketPurchaseForm from "../../components/events/TicketPurchaseForm";
import MyTeamsSection from "../../components/events/MyTeamsSection";

export default function EventDetails() {
  const { eventSlug } = useParams();
  const eventId = slugToId(eventSlug);
  const navigate = useNavigate();
  const [showTeamSignup, setShowTeamSignup] = useState(false);
  const [tournamentEmail, setTournamentEmail] = useState("");

  const queryClient = useQueryClient();

  const handleBack = () => {
    navigate(-1);
  };

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_DEV_URI}events/${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      return response.json();
    },
  });

  const isTournament = event && event.isTournament;

  const { data: registeredTeams = [] } = useQuery({
    queryKey: ["event-teams", eventId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}teams/event/${eventId}/teams`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
    enabled: !!isTournament,
  });

  const handleShare = () => {
    window.open(`https://www.facebook.com/profile.php?id=100081705505202`, "_blank");
  };

  const handleTournamentSignup = (email) => {
    setTournamentEmail(email);
    setShowTeamSignup(true);
  };

  if (isLoading)
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/50">Loading event details...</p>
        </div>
      </PageContainer>
    );
  if (error)
    return (
      <PageContainer center>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-red-100 text-center max-w-sm">
          <p className="text-red-500 font-medium mb-4">{error.message}</p>
        </div>
      </PageContainer>
    );

  const isEventInPast =
    event.isReoccurring && event.reoccurringEndDate
      ? new Date(event.reoccurringEndDate) < new Date()
      : new Date(event.date) < new Date();

  return (
    <PageContainer>
      <Helmet>
        <title>{event.title} | ASC Events</title>
        <meta
          name="description"
          content={event.shortDescription || event.longDescription?.slice(0, 155)}
        />
      </Helmet>

      <EventDetailsBanner event={event} />

      <div className="page-section px-2 py-6 md:px-0 md:py-8">
        {event.images && event.images.length > 0 && (
          <img
            src={event.images[0]}
            alt={event.title}
            className="mb-8 aspect-[16/9] w-full rounded-[2rem] object-cover shadow-[var(--shadow-strong)]"
          />
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1 md:order-2">
            {!isEventInPast && event.ticketPrice === 0 && !event.isTournament ? (
              <GlassCard className="rounded-[1.75rem] shadow-xl">
                <div className="card-body text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="card-title justify-center text-xl text-accent">Free Entry</h2>
                  <p className="text-sm text-base-content/55">
                    This event is free to attend. Just show up!
                  </p>
                </div>
              </GlassCard>
            ) : !isEventInPast ? (
              <TicketPurchaseForm
                event={event}
                eventId={eventId}
                onTournamentSignup={handleTournamentSignup}
              />
            ) : (
              <GlassCard className="rounded-[1.75rem] border-red-300/50 bg-red-100/30 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-xl text-red-600">Event Has Ended</h2>
                  <p className="text-red-500">
                    This event has already occurred.{" "}
                    {isTournament
                      ? "Team registration is no longer available."
                      : "Ticket purchases are no longer available."}
                  </p>
                </div>
              </GlassCard>
            )}
          </div>

          <div className="md:col-span-2 md:order-1 space-y-6">
            <EventInfoGrid event={event} />

            <GlassCard className="rounded-[1.75rem] shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl text-base-content">About This Event</h2>
                <div className="prose max-w-none text-base-content/80 prose-headings:text-base-content prose-p:leading-7">
                  <p>{event.longDescription}</p>
                </div>
              </div>
            </GlassCard>

            {isTournament && <MyTeamsSection teams={registeredTeams} />}
          </div>
        </div>

        <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={handleBack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
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
          </Button>
          <button
            onClick={handleShare}
            className="btn border-0 bg-[#1877F2] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#166FE5] hover:shadow-lg"
            aria-label="Share on Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-1.5"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
            Share on Facebook
          </button>
        </div>

        {showTeamSignup && (
          <TeamSignupForm
            eventId={eventId}
            managerId={tournamentEmail}
            onSuccess={() => {
              setShowTeamSignup(false);
              queryClient.invalidateQueries({ queryKey: ["event-teams", eventId] });
            }}
            onClose={() => setShowTeamSignup(false)}
          />
        )}
      </div>
    </PageContainer>
  );
}
