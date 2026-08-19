import { useMutation } from "@tanstack/react-query";
import { API, fetchPublicJSON } from "../api/apiClient";

export function useRequestTicketResendMutation() {
  return useMutation({
    mutationFn: (email) =>
      fetchPublicJSON(`${API}payments/resend/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
  });
}

export function useConfirmTicketResendMutation() {
  return useMutation({
    mutationFn: (token) =>
      fetchPublicJSON(`${API}payments/resend/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }),
  });
}
