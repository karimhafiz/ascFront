export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const STRIPE_DOWN_MESSAGE =
  "Payment provider is temporarily unavailable. Please try again in a few minutes.";

export const RATE_LIMITED_MESSAGE = "Too many requests — please wait a moment and try again.";

let _backendDown = false;
let _databaseDown = false;
let _rateLimited = false;

export const getBackendDown = () => {
  return _backendDown;
};
export const getDatabaseDown = () => {
  return _databaseDown;
};
export const getRateLimited = () => {
  return _rateLimited;
};
let _backendDownSubscribers = new Set();
let _databaseDownSubscribers = new Set();
let _rateLimitedSubscribers = new Set();

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
export const setRateLimited = (value) => {
  if (_rateLimited === value) return;
  _rateLimited = value;
  _rateLimitedSubscribers.forEach((fn) => fn());
};
export const subscribeToBackendDown = (fn) => {
  _backendDownSubscribers.add(fn);
  return () => _backendDownSubscribers.delete(fn);
};
export const subscribeToDatabaseDown = (fn) => {
  _databaseDownSubscribers.add(fn);
  return () => _databaseDownSubscribers.delete(fn);
};
export const subscribeToRateLimited = (fn) => {
  _rateLimitedSubscribers.add(fn);
  return () => _rateLimitedSubscribers.delete(fn);
};
