import { redirect } from "react-router-dom";
import { getAuthToken, refreshAccessToken, isAuthenticated } from "../auth/auth";

const API = import.meta.env.VITE_DEV_URI;

export async function combinedLoader() {
  // Try to restore session if no token in memory
  if (!getAuthToken()) {
    await refreshAccessToken();
  }

  const [response, courseResponse] = await Promise.all([
    fetch(`${API}events`),
    fetch(`${API}courses`),
  ]);

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  const events = await response.json();
  const courses = await courseResponse.json();

  return { token: getAuthToken(), events, courses };
}

export function checkAuthLoader() {
  if (!isAuthenticated()) {
    return redirect("/auth");
  }
}

export async function eventDetailLoader({ params }) {
  const { eventId } = params;
  const response = await fetch(`${API}events/${eventId}`);
  if (!response.ok) throw new Error("Failed to fetch event details");
  return response.json();
}
