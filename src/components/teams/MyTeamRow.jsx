import { useState } from "react";
import { fetchWithAuth, getAuthToken, parseJwt } from "../../auth/auth";
import { Spinner } from "../ui";
import TeamEditForm from "./TeamEditForm";
import { Link } from "react-router-dom";

export default function MyTeamRow({ team, onTeamUpdated, readOnly = false }) {
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const token = getAuthToken();
  const userEmail = token ? parseJwt(token)?.email : null;
  const isMyTeam = userEmail && team.manager?.email?.toLowerCase() === userEmail.toLowerCase();

  const handlePay = async () => {
    setPaying(true);
    setPayError("");
    try {
      const eventId = team.event?._id || team.event;
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_DEV_URI}teams/event/${eventId}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: team.name,
            manager: team.manager,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      if (data.url) {
        window.location.href = data.url;
      } else {
        onTeamUpdated();
      }
    } catch (err) {
      setPayError(err.message || "Failed to start payment");
      setPaying(false);
    }
  };

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
                <Link to={`/events/${team.event._id}`} className="hover:underline text-info">
                  {team.event.title}
                </Link>
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
            {!readOnly && !team.paid && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn btn-sm bg-gradient-to-r from-amber-400 to-orange-500 border-none text-white transition-all duration-300 rounded-lg text-xs"
                title="Complete payment"
              >
                {paying ? <Spinner size="sm" /> : "Pay Now"}
              </button>
            )}
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
            {readOnly && isMyTeam && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                My Team
              </span>
            )}
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${team.paid ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}
            >
              {team.paid ? "Paid" : "Pending"}
            </span>
          </div>
        </div>

        {payError && (
          <div className="px-5 pb-3">
            <p className="text-xs text-red-600">{payError}</p>
          </div>
        )}
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
