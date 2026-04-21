import { useState } from "react";
import TeamEditForm from "./TeamEditForm";

export default function MyTeamRow({ team, onTeamUpdated, readOnly = false }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="flex items-center px-5 py-4 gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base-content truncate">{team.name}</p>
            {team.event?.title && (
              <p className="text-sm text-base-content/60 truncate mt-0.5">
                {team.event.title}
                {team.event.date && (
                  <span>
                    {" "}
                    ·{" "}
                    {new Date(team.event.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </p>
            )}
            <p className="text-xs text-base-content/50 mt-0.5">
              Manager: {team.manager?.name}
              {team.manager?.phone && <span> · {team.manager.phone}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!readOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                className="btn btn-s bg-base-200/60 hover:bg-base-300/60 border border-base-300/60 text-base-content transition-all duration-300 rounded-lg"
                title="Edit team"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${team.paid ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}
            >
              {team.paid ? "Paid" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {editing && (
        <TeamEditForm
          team={team}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onTeamUpdated();
          }}
        />
      )}
    </>
  );
}
