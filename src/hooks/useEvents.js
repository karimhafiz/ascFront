import { useQuery } from "@tanstack/react-query";
import { API, fetchPublicJSON } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => fetchPublicJSON(`${API}events`),
  });
}

export function useEvent(eventId) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => fetchPublicJSON(`${API}events/${eventId}`),
    enabled: Boolean(eventId),
  });
}
