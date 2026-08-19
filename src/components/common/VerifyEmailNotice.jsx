import { useState } from "react";
import { getAuthToken, parseJwt } from "../../auth/auth";
import { useRequestEmailVerificationMutation } from "../../hooks/useEmailVerificationMutation";

/**
 * Blocks a purchase/booking action until the user's email is verified.
 * We require this because a verified email is the only reliable way we
 * have to reach a buyer — it's where tickets, receipts, and booking
 * updates get sent, so an unverified (possibly fake or mistyped) address
 * means we might have no way to contact them if something goes wrong.
 */
export default function VerifyEmailNotice({ action = "continue" }) {
  const [sent, setSent] = useState(false);
  const requestMutation = useRequestEmailVerificationMutation();
  const email = parseJwt(getAuthToken())?.email;

  const handleResend = () => {
    requestMutation.mutate(email, { onSuccess: () => setSent(true) });
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
      <p className="font-semibold mb-1">Verify your email to {action}</p>
      <p className="mb-3">
        We need a verified email to send you your tickets, receipts, and any updates about your
        purchase — it's the only way we have to reach you.
      </p>
      {sent ? (
        <p className="text-xs font-medium text-amber-800">
          Verification link sent to {email} — check your inbox.
        </p>
      ) : (
        <>
          <button
            onClick={handleResend}
            disabled={requestMutation.isPending}
            className="text-xs font-semibold underline hover:no-underline cursor-pointer disabled:opacity-60"
          >
            {requestMutation.isPending ? "Sending…" : "Resend verification email"}
          </button>
          {requestMutation.isError && (
            <p className="text-xs font-medium text-red-600 mt-2">
              {requestMutation.error?.message || "Something went wrong. Please try again."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
