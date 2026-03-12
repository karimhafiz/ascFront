import { redirect } from "react-router-dom";

export function getAuthToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }
  return token;
}

export async function combinedLoader() {
  console.log("combinedLoader running");
  const token = await getAuthToken();

  console.log("fetching:", `${import.meta.env.VITE_DEV_URI}events`);
  const response = await fetch(`${import.meta.env.VITE_DEV_URI}events`);
  const courseResponse = await fetch(`${import.meta.env.VITE_DEV_URI}courses`);
  console.log("response status:", response.status);
  
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  const events = await response.json();
  const courses = await courseResponse.json();
  console.log("events loaded:", events.length);

  return { token, events, courses };
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

// simple JWT parser to read payload
export function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const padded = base64Payload.padEnd(base64Payload.length + (4 - (base64Payload.length % 4)) % 4, "=");
    const payload = atob(padded);
    return JSON.parse(payload);
  } catch (err) {
    // Log parsing errors for debugging; returning null keeps callers safe
    console.error("parseJwt failed:", err);
    return null;
  }
}

export function getUserRole() {
  const token = getAuthToken();
  if (!token) return null;
  const data = parseJwt(token);
  return data ? data.role : null;
}

export function isAuthenticated() {
  const token = getAuthToken();
  const expiration = localStorage.getItem("expiration");
  return token && expiration && new Date(expiration) > new Date();
}

export function isAdmin() {
  return isAuthenticated() && getUserRole() === "admin";
}

export function isModerator() {
  return isAuthenticated() && getUserRole() === "moderator";
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
