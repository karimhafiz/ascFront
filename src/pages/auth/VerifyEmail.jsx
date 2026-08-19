import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { isAuthenticated, refreshAccessToken } from "../../auth/auth";
import { Button, PageContainer, GlassCard, Spinner } from "../../components/ui";
import { useConfirmEmailVerificationMutation } from "../../hooks/useEmailVerificationMutation";
import VerifyEmailNotice from "../../components/common/VerifyEmailNotice";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const confirmMutation = useConfirmEmailVerificationMutation();
  const hasRequested = useRef(false);
  // Tracked locally rather than read off confirmMutation.isPending/isIdle —
  // React 18 Strict Mode's dev-only double-invoke of effects can leave that
  // specific mutation-hook instance's own status stuck at "idle" even after
  // the request actually completes, since mutate() fires from the effect
  // while its internal observer is mid setup/cleanup/resetup.
  const [status, setStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token || hasRequested.current) return;
    hasRequested.current = true;
    confirmMutation.mutate(token, {
      onSuccess: () => {
        // If the user is already logged in, refresh their token so
        // isVerified flips to true immediately instead of waiting up to 15
        // minutes for the normal proactive-refresh cycle to pick it up.
        if (isAuthenticated()) refreshAccessToken();
        setStatus("success");
      },
      onError: (err) => {
        setErrorMessage(err?.message || "This link has expired or is invalid.");
        setStatus("error");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <PageContainer center>
      <Helmet>
        <title>Verify Your Email | ASC</title>
      </Helmet>
      <div className="max-w-md w-full px-4">
        <GlassCard className="rounded-[1.75rem] shadow-xl">
          <div className="card-body text-center">
            {!token ? (
              <p className="text-red-500 font-medium">This verification link is missing a token.</p>
            ) : status === "pending" ? (
              <div className="flex flex-col items-center gap-3">
                <Spinner />
                <p className="text-sm text-base-content/50">Verifying your email…</p>
              </div>
            ) : status === "error" ? (
              <>
                <p className="text-red-500 font-medium mb-4">{errorMessage}</p>
                {isAuthenticated() ? (
                  <VerifyEmailNotice action="continue" />
                ) : (
                  <p className="text-sm text-base-content/70">
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                      Log in
                    </Link>{" "}
                    to request a new verification link.
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-green-600 mb-2">Email Verified</h1>
                <p className="text-sm text-base-content/50 mb-6">
                  Your email is verified — you can now buy tickets, enroll in courses, and book
                  venues.
                </p>
                <Button
                  variant="primary"
                  to={isAuthenticated() ? "/profile" : "/login"}
                  className="w-full"
                >
                  {isAuthenticated() ? "Go to My Profile" : "Log In"}
                </Button>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
