import { useQuery } from "@tanstack/react-query";
import { API } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: async () => {
      const res = await fetch(`${API}events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });
}

export function useEvent(eventId) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: async () => {
      const res = await fetch(`${API}events/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch event details");
      return res.json();
    },
    enabled: !!eventId,
  });
}
