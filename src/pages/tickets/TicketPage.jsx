import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated, getAuthToken } from "../../auth/auth";
import TicketCard from "../../components/tickets/TicketCard";
import { PageContainer, GlassCard, Spinner } from "../../components/ui";

export default function TicketPage() {
  const { ticketCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Support multi-ticket printing via ?codes=TKT-A,TKT-B query param
  const codesParam = searchParams.get("codes");
  const codes = codesParam ? codesParam.split(",").filter(Boolean) : [ticketCode];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const token = getAuthToken();
    Promise.all(
      codes.map((code) =>
        fetch(`${import.meta.env.VITE_DEV_URI}tickets/${code}`, {
          headers: { Authorization: "Bearer " + token },
        }).then(async (res) => {
          if (!res.ok) throw new Error(`Ticket ${code} not found`);
          return res.json();
        })
      )
    )
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketCode, codesParam, navigate]);

  // Auto-print when opened with ?print=true (e.g. from admin dashboard)
  useEffect(() => {
    if (tickets.length > 0 && searchParams.get("print") === "true") {
      const timer = setTimeout(() => window.print(), 400);
      return () => clearTimeout(timer);
    }
  }, [tickets, searchParams]);

  if (loading)
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/50">Loading ticket…</p>
        </div>
      </PageContainer>
    );

  if (error)
    return (
      <PageContainer center>
        <GlassCard className="p-8 text-center max-w-sm border border-red-100">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link to="/profile" className="text-sm text-base-content/70 hover:underline">
            Back to profile
          </Link>
        </GlassCard>
      </PageContainer>
    );

  const isMulti = tickets.length > 1;

  return (
    <PageContainer>
      <div className="max-w-lg mx-auto py-10 px-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content/70 mb-6 transition-colors print:hidden"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to profile
        </Link>
        {isMulti && (
          <p className="text-xs text-base-content/50 mb-4 print:hidden">
            Showing {tickets.length} tickets from this order
          </p>
        )}
        <div className="space-y-6">
          {tickets.map((t) => (
            <TicketCard key={t._id || t.ticketCode} ticket={t} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
