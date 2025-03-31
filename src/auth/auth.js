import { redirect } from "react-router-dom";

export function getAuthToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }
  return token;
}

export async function combinedLoader() {
  const token = await getAuthToken();

  // Fetch the events
  const response = await fetch("http://localhost:5000/api/events");
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  const events = await response.json();

  // Return both token and events
  return { token, events };
}

export function checkAuthLoader() {
  const token = getAuthToken();

  if (!token) {
    return redirect("/auth");
  }
}
export function logoutAction() {
  localStorage.removeItem("token");
  localStorage.removeItem("expiration");
  return redirect("/");
}
