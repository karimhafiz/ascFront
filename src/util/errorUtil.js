export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const STRIPE_DOWN_MESSAGE =
  "Payment provider is temporarily unavailable. Please try again in a few minutes.";

// Auth-agnostic fetch wrapper: distinguishes "server unreachable" (fetch
// itself throws), "DB down" (backend's connectDB middleware responds 503),
// and "Stripe down" (a Stripe-calling route responds 502) from ordinary
// non-ok responses, which callers still handle themselves.
export async function fetchOrThrow(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError("Unable to reach the server.", null);
  }
  if (response.status === 503) {
    throw new ApiError("Database is unavailable.", 503);
  }
  if (response.status === 502) {
    throw new ApiError(STRIPE_DOWN_MESSAGE, 502);
  }
  return response;
}

let _backendDown = false;
let _databaseDown = false;

export const getBackendDown = () => {
  return _backendDown;
};
export const getDatabaseDown = () => {
  return _databaseDown;
};
let _backendDownSubscribers = new Set();
let _databaseDownSubscribers = new Set();

export const setBackendDown = (value) => {
  if (_backendDown === value) return;
  _backendDown = value;
  _backendDownSubscribers.forEach((fn) => fn());
};
export const setDatabaseDown = (value) => {
  if (_databaseDown === value) return;
  _databaseDown = value;
  _databaseDownSubscribers.forEach((fn) => fn());
};
export const subscribeToBackendDown = (fn) => {
  _backendDownSubscribers.add(fn);
  return () => _backendDownSubscribers.delete(fn);
};
export const subscribeToDatabaseDown = (fn) => {
  _databaseDownSubscribers.add(fn);
  return () => _databaseDownSubscribers.delete(fn);
};
