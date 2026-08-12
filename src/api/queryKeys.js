export const queryKeys = {
  events: {
    all: ["events"],
    detail: (id) => ["event", id],
    teams: (id) => ["event-teams", id],
    subscription: (id) => ["event-subscription", id],
  },
  courses: {
    all: ["courses"],
    detail: (id) => ["course", id],
    enrollment: (id) => ["course-enrollment", id],
  },
  admin: {
    dashboard: ["admin-dashboard"],
  },
  profile: ["profile"],
  teams: {
    detail: (id) => ["team", id],
    unpaid: (eventId) => ["teams-unpaid", eventId],
  },
  tickets: {
    detail: (code) => ["ticket", code],
    byCodes: (codes) => ["tickets", codes.join(",")],
    byPayment: (paymentId) => ["tickets-by-payment", paymentId],
    verify: (code) => ["verify-ticket", code],
  },
  payments: {
    guestOrder: (sessionId) => ["guest-order", sessionId],
    receipt: (sessionId) => ["receipt", sessionId],
  },
  venues: {
    all: ["venues"],
    detail: (id) => ["venue", id],
    slots: (id, date) => ["venue-slots", id, date],
    // Called with just `id` (prefix match, exact: false) to invalidate every
    // cached week for a venue at once, or with (id, from, to) for a specific read.
    slotsAll: (id, from, to) =>
      from !== undefined ? ["venue-slots-all", id, from, to] : ["venue-slots-all", id],
    availableDates: (id, from, to) => ["venue-available-dates", id, from, to],
    booking: (id) => ["venue-booking", id],
  },
  pageContent: {
    home: ["pageContent", "home"],
    about: ["pageContent", "about"],
  },
  pageContentRequests: {
    all: ["pageContentRequests"],
  },
};
