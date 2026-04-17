import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated, fetchWithAuth } from "../../auth/auth";
import TicketCard from "../../components/tickets/TicketCard";
import { Button, PageContainer, GlassCard, Spinner } from "../../components/ui";

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
    Promise.all(
      codes.map((code) =>
        fetchWithAuth(`${import.meta.env.VITE_DEV_URI}tickets/${code}`).then(async (res) => {
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
          <Button variant="secondary" to="/profile">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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
            Back to profile
          </Button>
        </GlassCard>
      </PageContainer>
    );

  const isMulti = tickets.length > 1;

  return (
    <PageContainer>
      <div className="max-w-lg mx-auto py-10 px-4">
        <div className="mb-6 print:hidden">
          <Button variant="secondary" to="/profile">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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
            Back to profile
          </Button>
        </div>
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
