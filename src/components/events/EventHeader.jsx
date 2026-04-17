import React from "react";
import { useRouteLoaderData, useLocation, useParams } from "react-router-dom";
import { isAdmin, isModerator } from "../../auth/auth";
import { Button } from "../ui";

const EventHeader = () => {
  const { token } = useRouteLoaderData("root");
  const location = useLocation();
  const { eventSlug } = useParams();

  // Hide on create/edit pages — the form itself is the focus
  if (/\/events\/(new|[^/]+\/edit)/.test(location.pathname)) {
    return null;
  }

  if (!token || (!isAdmin() && !isModerator())) {
    return null;
  }

  const isDetailPage = !!eventSlug;

  return (
    <div className="container mx-auto px-6 pt-6">
      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 px-6 py-4 shadow-sm gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
          <span className="text-sm font-semibold text-base-content">Event Management</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isDetailPage && (
            <Button
              variant="primary"
              to={`/events/${eventSlug}/edit`}
              className="shadow-md shadow-primary/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Event
            </Button>
          )}
          <Button variant="primary" to="/events/new" className="shadow-md shadow-primary/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;
