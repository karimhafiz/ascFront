import { redirect } from "react-router-dom";
import { fetchWithAuth } from "../auth/auth";
import { compressImage } from "../util/compressImage";
import { slugToId } from "../util/util";

export async function eventAction({ request, params }) {
  const method = request.method;
  const data = await request.formData();

  const eventData = {
    title: data.get("title"),
    shortDescription: data.get("shortDescription"),
    longDescription: data.get("description"),
    date: data.get("date"),
    openingTime: data.get("openingTime"),
    street: data.get("street"),
    postCode: data.get("postCode"),
    city: data.get("city"),
    ageRestriction: data.get("ageRestriction"),
    accessibilityInfo: data.get("accessibilityInfo"),
    ticketPrice: parseFloat(data.get("ticketPrice")),
    featured: data.get("featured") === "true",
    isReoccurring: data.get("isReoccurring") === "true",
    reoccurringStartDate: data.get("reoccurringStartDate") || null,
    reoccurringEndDate: data.get("reoccurringEndDate") || null,
    reoccurringFrequency: data.get("reoccurringFrequency") || null,
    dayOfWeek: data.get("dayOfWeek") || null,
    typeOfEvent: data.get("typeOfEvent") || "ASC",
    isTournament: data.get("isTournament") === "true",
    ticketsAvailable:
      data.get("ticketsAvailable") !== "" ? parseInt(data.get("ticketsAvailable"), 10) : undefined,
  };

  const formData = new FormData();
  formData.append("eventData", JSON.stringify(eventData));
  const imageFile = data.get("image");
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    const compressed = await compressImage(imageFile);
    formData.append("image", compressed, imageFile.name);
  }

  let url = `${import.meta.env.VITE_DEV_URI}events`;
  if (method === "PUT" || method === "PATCH") {
    const eventId = params.eventSlug ? slugToId(params.eventSlug) : null;
    console.log("Updating event with ID:", eventId);
    url = `${import.meta.env.VITE_DEV_URI}events/${eventId}`;
  }

  try {
    const response = await fetchWithAuth(url, {
      method: method,
      body: formData,
    });

    const responseText = await response.text();
    let responseData;
    responseData = JSON.parse(responseText);

    if (!response.ok) {
      return {
        errors: {
          message: responseData.error || responseData.message || "Unknown error",
        },
      };
    }

    return redirect("/events");
  } catch (error) {
    console.error("Error during form submission:", error);
    return { errors: { message: error.message } };
  }
}
