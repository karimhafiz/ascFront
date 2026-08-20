import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import TicketCard from "../../components/tickets/TicketCard";
import { Button, PageContainer, GlassCard, Spinner } from "../../components/ui";
import {
  useRequestTicketResendMutation,
  useConfirmTicketResendMutation,
} from "../../hooks/useTicketResendMutation";

function RequestForm({ eventName }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestMutation = useRequestTicketResendMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    requestMutation.mutate(email, { onSuccess: () => setSubmitted(true) });
  };

  if (submitted) {
    return (
      <GlassCard className="rounded-[1.75rem] shadow-xl">
        <div className="card-body text-center">
          <h1 className="text-xl font-bold text-base-content mb-2">Check your inbox</h1>
          <p className="text-sm text-base-content/70">
            If that email has a ticket, we've sent a link to it. The link expires in 20 minutes.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="rounded-[1.75rem] shadow-xl">
      <form onSubmit={handleSubmit} className="card-body">
        <h1 className="text-xl font-bold text-base-content mb-1">Recover Your Ticket</h1>
        <p className="text-sm text-base-content/70 mb-4">
          {eventName ? (
            <>
              Enter the email you used to purchase your ticket and we'll send you your ticket for{" "}
              <strong>{eventName}</strong>.
            </>
          ) : (
            "Enter the email you used to purchase your ticket and we'll send you a link to view it."
          )}
        </p>
        <label htmlFor="recover-email" className="block text-md font-medium mb-2 text-base-content">
          Your Email:
        </label>
        <input
          id="recover-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass-input"
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
        {requestMutation.isError && (
          <p className="text-red-500 text-sm bg-red-50/50 rounded-xl p-2 mt-3" role="alert">
            {requestMutation.error?.message || "Something went wrong. Please try again."}
          </p>
        )}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={requestMutation.isPending}
          >
            {requestMutation.isPending ? <Spinner size="sm" /> : "Send Recovery Link"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

function TokenConfirmation({ token }) {
  const confirmMutation = useConfirmTicketResendMutation();
  const hasRequested = useRef(false);
  // Tracked locally rather than read off confirmMutation.isPending/isIdle —
  // React 18 Strict Mode's dev-only double-invoke of effects can leave that
  // specific mutation-hook instance's own status stuck at "idle" even after
  // the request actually completes, since mutate() fires from the effect
  // while its internal observer is mid setup/cleanup/resetup.
  const [status, setStatus] = useState("pending");
  const [tickets, setTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;
    confirmMutation.mutate(token, {
      onSuccess: (data) => {
        setTickets(data?.tickets ?? []);
        setStatus("success");
      },
      onError: (err) => {
        setErrorMessage(err?.message || "This link has expired or is invalid.");
        setStatus("error");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "pending") {
    return (
      <PageContainer center>
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-base-content/50">Recovering your ticket…</p>
        </div>
      </PageContainer>
    );
  }

  if (status === "error") {
    return (
      <GlassCard className="rounded-[1.75rem] shadow-xl">
        <div className="card-body text-center">
          <p className="text-red-500 font-medium mb-4">{errorMessage}</p>
          <Button variant="primary" to="/tickets/recover" className="w-full">
            Request a New Link
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-1">Ticket Recovered</h1>
        <p className="text-sm text-base-content/50">
          We've also emailed you a fresh copy — save or screenshot this page too, since ASC can't be
          held responsible for a lost ticket.
        </p>
      </div>
      <div className="space-y-6">
        {tickets.map((t) => (
          <TicketCard key={t._id} ticket={t} />
        ))}
      </div>
    </>
  );
}

export default function TicketRecovery() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const eventName = searchParams.get("event");

  return (
    <PageContainer>
      <Helmet>
        <title>Recover Your Ticket | ASC Events</title>
      </Helmet>
      <div className="max-w-lg mx-auto py-10 px-4">
        {!token && (
          <div className="mb-6 print:hidden">
            <Button variant="secondary" to="/events">
              Back to Events
            </Button>
          </div>
        )}
        {token ? <TokenConfirmation token={token} /> : <RequestForm eventName={eventName} />}
        {!token && (
          <p className="text-xs text-center text-base-content/50 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>{" "}
            to see all your tickets in your profile.
          </p>
        )}
      </div>
    </PageContainer>
  );
}
