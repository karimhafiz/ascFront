import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import TeamSignupForm from "../../components/teams/TeamSignupForm";
import { slugToId } from "../../util/util";
import { isAuthenticated, fetchWithAuth } from "../../auth/auth";
import { Button, PageContainer, GlassCard, Spinner } from "../../components/ui";
import EventDetailsBanner from "../../components/events/EventDetailsBanner";
import EventInfoGrid from "../../components/events/EventInfoGrid";
import TicketPurchaseForm from "../../components/events/TicketPurchaseForm";
import SubscribedPanel from "../../components/events/SubscribedPanel";
import MyTeamsSection from "../../components/events/MyTeamsSection";
import { useEvent } from "../../hooks/useEvents";

export default function EventDetails() {
  const { eventSlug } = useParams();
  const eventId = slugToId(eventSlug);
  const navigate = useNavigate();
  const [showTeamSignup, setShowTeamSignup] = useState(false);
  const [tournamentEmail, setTournamentEmail] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!showTicketModal) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowTicketModal(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showTicketModal]);

  const { data: event, isLoading, error } = useEvent(eventId);

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

  const isRecurringSubscription =
    event?.isReoccurring && event?.stripePriceId && event?.ticketPrice > 0;

  const { data: mySubscriptionData } = useQuery({
    queryKey: ["my-event-subscription", eventId],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}events/${eventId}/my-subscription`
      );
      if (!res.ok) return { subscription: null };
      return res.json();
    },
    enabled: !!isRecurringSubscription && isAuthenticated(),
  });

  const mySubscription = mySubscriptionData?.subscription;

  const handleShare = () => {
    window.open(`https://www.facebook.com/profile.php?id=100081705505202`, "_blank");
  };

  const handleTournamentSignup = (email) => {
    setTournamentEmail(email);
    setShowTicketModal(false);
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

  const isSubscription = event.isReoccurring && event.stripePriceId && event.ticketPrice > 0;
  const isFreeEvent = event.ticketPrice === 0 && !event.isTournament;
  const isSoldOut = event.ticketsAvailable === 0;
  const loggedIn = isAuthenticated();
  const requiresAuth = isSubscription || event.isTournament;

  const getActionButton = () => {
    if (isEventInPast) return null;
    if (mySubscription) return null;
    if (isFreeEvent) {
      return (
        <span className="text-sm font-semibold text-accent bg-accent/10 px-4 py-2 rounded-full whitespace-nowrap mx-auto md:mx-0">
          Free Entry
        </span>
      );
    }
    if (isSoldOut) {
      return (
        <span className="text-sm font-semibold text-red-500 bg-red-50 px-4 py-2 rounded-full whitespace-nowrap">
          Sold Out
        </span>
      );
    }
    if (requiresAuth && !loggedIn) {
      return (
        <Link to="/login" className="btn btn-primary whitespace-nowrap hidden md:inline-flex">
          {event.isTournament ? "Log in to register" : "Log in to subscribe"}
        </Link>
      );
    }
    return (
      <Button
        variant="primary"
        onClick={() => setShowTicketModal(true)}
        className="whitespace-nowrap hidden md:inline-flex"
      >
        {event.isTournament ? "Register Team" : isSubscription ? "Subscribe" : "Buy Tickets"}
      </Button>
    );
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{event.title} | ASC Events</title>
        <meta
          name="description"
          content={event.shortDescription || event.longDescription?.slice(0, 155)}
        />
      </Helmet>

      {event.images && event.images.length > 0 ? (
        <div className="page-section pt-6 md:pt-8">
          <img
            src={event.images[0]}
            alt={event.title}
            className="max-h-[35vh] md:max-h-[50vh] w-full rounded-[2rem] object-cover shadow-[var(--shadow-strong)]"
          />
        </div>
      ) : (
        <EventDetailsBanner event={event} />
      )}

      <div className="page-section px-2 py-6 md:px-0 md:py-8">
        <div className={mySubscription ? "grid grid-cols-1 md:grid-cols-3 gap-6" : ""}>
          <div className={mySubscription ? "md:col-span-2" : ""}>
            <EventInfoGrid event={event} actionButton={getActionButton()} />
          </div>
          {mySubscription && (
            <div className="md:col-span-1">
              <GlassCard className="rounded-[1.75rem] shadow-xl h-full">
                <div className="card-body">
                  <SubscribedPanel
                    event={event}
                    subscription={mySubscription}
                    onChanged={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["my-event-subscription", eventId],
                      })
                    }
                  />
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        <GlassCard className="rounded-[1.75rem] shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title text-xl text-base-content">About This Event</h2>
            <div className="prose max-w-none text-base-content/80 prose-headings:text-base-content prose-p:leading-7">
              <p>{event.longDescription}</p>
            </div>
          </div>
        </GlassCard>

        {isTournament && (
          <div className="mt-6">
            <MyTeamsSection teams={registeredTeams} />
          </div>
        )}

        {isEventInPast && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-[1.75rem] p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-1">Event Has Ended</h2>
            <p className="text-red-500 text-sm">
              This event has already occurred.{" "}
              {isTournament
                ? "Team registration is no longer available."
                : "Ticket purchases are no longer available."}
            </p>
          </div>
        )}

        <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" onClick={() => navigate("/events")}>
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
      </div>

      {/* Floating CTA — mobile only */}
      {!isEventInPast &&
        !mySubscription &&
        !isFreeEvent &&
        !isSoldOut &&
        (requiresAuth && !loggedIn ? (
          <Link
            to="/login"
            className="md:hidden fixed bottom-6 left-4 right-4 z-40 btn btn-primary shadow-xl text-base rounded-2xl py-3 text-center"
          >
            {event.isTournament ? "Log in to register" : "Log in to subscribe"}
          </Link>
        ) : (
          <button
            onClick={() => setShowTicketModal(true)}
            className="md:hidden fixed bottom-6 left-4 right-4 z-40 btn btn-primary shadow-xl text-base rounded-2xl py-3"
          >
            {event.isTournament ? "Register Team" : isSubscription ? "Subscribe" : "Buy Tickets"}
          </button>
        ))}

      {/* Ticket/Registration modal */}
      {showTicketModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowTicketModal(false)}
        >
          <div
            className="bg-base-100 rounded-[1.75rem] shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 pb-0">
              <h2 className="text-xl font-bold text-base-content">
                {event.isTournament
                  ? "Team Registration"
                  : isSubscription
                    ? "Subscribe"
                    : "Purchase Tickets"}
              </h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-2 text-base-content/50 hover:text-base-content rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <TicketPurchaseForm
              event={event}
              eventId={eventId}
              onTournamentSignup={handleTournamentSignup}
              isModal
            />
          </div>
        </div>
      )}

      {showTeamSignup && (
        <TeamSignupForm
          eventId={eventId}
          managerId={tournamentEmail}
          onSuccess={() => {
            setShowTeamSignup(false);
            queryClient.invalidateQueries({
              queryKey: ["event-teams", eventId],
            });
          }}
          onClose={() => setShowTeamSignup(false)}
        />
      )}
    </PageContainer>
  );
}
