import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { API } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";
import { fetchWithAuth } from "../auth/auth";
import { compressImage } from "../util/compressImage";
import { slugToId } from "../util/util";

export function useEventMutation(method, eventSlug) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const eventId = eventSlug ? slugToId(eventSlug) : null;

  return useMutation({
    mutationFn: async (formData) => {
      const eventData = {
        title: formData.get("title"),
        shortDescription: formData.get("shortDescription"),
        longDescription: formData.get("description"),
        date: formData.get("date"),
        openingTime: formData.get("openingTime"),
        street: formData.get("street"),
        postCode: formData.get("postCode"),
        city: formData.get("city"),
        ageRestriction: formData.get("ageRestriction"),
        accessibilityInfo: formData.get("accessibilityInfo"),
        ticketPrice: parseFloat(formData.get("ticketPrice")),
        featured: formData.get("featured") === "true",
        isReoccurring: formData.get("isReoccurring") === "true",
        reoccurringStartDate: formData.get("reoccurringStartDate") || null,
        reoccurringEndDate: formData.get("reoccurringEndDate") || null,
        reoccurringFrequency: formData.get("reoccurringFrequency") || null,
        dayOfWeek: formData.get("dayOfWeek") || null,
        typeOfEvent: formData.get("typeOfEvent") || "ASC",
        isTournament: formData.get("isTournament") === "true",
        ticketsAvailable:
          formData.get("ticketsAvailable") !== ""
            ? parseInt(formData.get("ticketsAvailable"), 10)
            : undefined,
      };

      const body = new FormData();
      body.append("eventData", JSON.stringify(eventData));
      const imageFile = formData.get("image");
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const compressed = await compressImage(imageFile);
        body.append("image", compressed, imageFile.name);
      }

      let url = `${API}events`;
      if ((method === "PUT" || method === "PATCH") && eventId) {
        url = `${API}events/${eventId}`;
      }

      const res = await fetchWithAuth(url, { method, body });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Unknown error");
      }
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      }
      navigate("/events");
    },
  });
}
