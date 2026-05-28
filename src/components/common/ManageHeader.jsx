import React from "react";
import { useLocation } from "react-router-dom";
import { isAdmin, isModerator, isAuthenticated } from "../../auth/auth";
import { Button } from "../ui";

const ICONS = {
  event: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  ),
  course: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  ),
  venue: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  ),
};

/**
 * ManageHeader — reusable moderator/admin action bar.
 *
 * Props:
 *   label       — e.g. "Event Management"
 *   icon        — "event" | "course" | "venue"
 *   createTo    — route for the create button, e.g. "/events/new"
 *   createLabel — button text, e.g. "Create Event"
 *   editTo      — optional route for an edit button
 *   editLabel   — optional edit button text
 *   hideOnPaths — regex tested against pathname; hides the bar when matched
 */
export default function ManageHeader({
  label,
  icon = "event",
  createTo,
  createLabel,
  editTo,
  editLabel,
  hideOnPaths,
}) {
  const { pathname } = useLocation();

  if (hideOnPaths && hideOnPaths.test(pathname)) return null;
  if (!isAuthenticated() || (!isAdmin() && !isModerator())) return null;

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
              {ICONS[icon] || ICONS.event}
            </svg>
          </div>
          <span className="text-sm font-semibold text-base-content">{label}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {editTo && (
            <Button variant="primary" to={editTo} className="shadow-md shadow-primary/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {editLabel}
            </Button>
          )}
          {createTo && (
            <Button variant="primary" to={createTo} className="shadow-md shadow-primary/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {createLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
