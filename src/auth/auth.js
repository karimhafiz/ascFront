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
  const response = await fetch(`${import.meta.env.VITE_DEV_URI}events`);
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

export function isTokenValid(token) {
  if (!token) return false;

  const expirationDate = localStorage.getItem("tokenExpiration");
  if (!expirationDate) return false;

  const now = new Date();
  const expiresAt = new Date(expirationDate);

  return now < expiresAt; // Token is valid if the current time is before the expiration time
}

export async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();

  // Validate the token
  if (!isTokenValid(token)) {
    throw new Error("Session expired. Please log in again.");
  }

  // Add the Authorization header
  const headers = options.headers || {};
  headers.Authorization = `Bearer ${token}`;

  // Make the request
  const response = await fetch(url, { ...options, headers });

  // Handle unauthorized responses
  if (response.status === 401) {
    throw new Error("Unauthorized. Please log in again.");
  }

  return response;
}
