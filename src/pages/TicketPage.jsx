import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { isAuthenticated, getAuthToken } from "../auth/auth";
import TicketCard from "../components/TicketCard";

export default function TicketPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    const token = getAuthToken();
    fetch(`${import.meta.env.VITE_DEV_URI}tickets/${ticketId}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Ticket not found");
        return res.json();
      })
      .then(setTicket)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ticketId, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-purple-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading ticket…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center max-w-sm">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <Link to="/profile" className="text-sm text-purple-600 hover:underline">Back to profile</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to profile
        </Link>
        <TicketCard ticket={ticket} />
      </div>
    </div>
  );
}