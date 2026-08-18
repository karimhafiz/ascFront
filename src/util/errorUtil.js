export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const STRIPE_DOWN_MESSAGE =
  "Payment provider is temporarily unavailable. Please try again in a few minutes.";

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
