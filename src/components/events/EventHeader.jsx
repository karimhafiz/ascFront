import React from "react";
import { useRouteLoaderData, NavLink, useLocation } from "react-router-dom";
import { isAdmin, isModerator } from "../../auth/auth";

const EventHeader = () => {
  const { token } = useRouteLoaderData("root");
  const location = useLocation();

  // Hide on create/edit pages — the form itself is the focus
  if (/\/events\/(new|[^/]+\/edit)/.test(location.pathname)) {
    return null;
  }

  if (!token || (!isAdmin() && !isModerator())) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 pt-6">
      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
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
          <span className="text-sm font-semibold text-purple-800">Event Management</span>
        </div>
        <NavLink
          to="/events/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow-md shadow-pink-200/50 hover:scale-105 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </NavLink>
      </div>
    </div>
  );
};

export default EventHeader;
