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
    group: (paymentId) => ["ticket-group", paymentId],
    verify: (code) => ["ticket-verify", code],
  },
  pageContent: {
    home: ["pageContent", "home"],
  },
};
