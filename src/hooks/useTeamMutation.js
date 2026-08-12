import { useMutation } from "@tanstack/react-query";
import { API, fetchJSON } from "../api/apiClient";

export function useTeamPayMutation(eventId) {
  return useMutation({
    mutationFn: ({ name, manager }) =>
      fetchJSON(`${API}teams/event/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, manager }),
      }),
  });
}

export function useTeamEditMutation(teamId) {
  return useMutation({
    mutationFn: ({ name, manager }) =>
      fetchJSON(`${API}teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, manager }),
      }),
  });
}
