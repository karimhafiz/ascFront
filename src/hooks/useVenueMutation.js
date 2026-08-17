import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { API, fetchJSON } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";
import { slugToId } from "../util/util";

// Create or update a venue. `venueSlug` omitted for create.
export function useVenueMutation(method, venueSlug) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const venueId = venueSlug ? slugToId(venueSlug) : null;

  return useMutation({
    mutationFn: (body) => {
      const url = venueId ? `${API}venues/${venueId}` : `${API}venues`;
      return fetchJSON(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.all });
      if (venueId) queryClient.invalidateQueries({ queryKey: queryKeys.venues.detail(venueId) });
      navigate("/venues/booking");
    },
  });
}

export function useVenueBookingCheckoutMutation() {
  return useMutation({
    mutationFn: (body) =>
      fetchJSON(`${API}venues/booking/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });
}

export function useVenueScheduleMutation(venueId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weeklySchedule) =>
      fetchJSON(`${API}venues/${venueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklySchedule }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.detail(venueId) });
    },
  });
}

export function useVenueGenerateSlotsMutation(venueId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fromDate, toDate }) =>
      fetchJSON(`${API}venues/${venueId}/slots/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate, toDate }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.slotsAll(venueId),
        exact: false,
      });
    },
  });
}

export function useVenueSlotCreateMutation(venueId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      fetchJSON(`${API}venues/${venueId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.slotsAll(venueId),
        exact: false,
      });
    },
  });
}

export function useVenueSlotDeleteMutation(venueId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId) =>
      fetchJSON(`${API}venues/${venueId}/slot/${slotId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.venues.slotsAll(venueId),
        exact: false,
      });
    },
  });
}
