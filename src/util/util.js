// Format date range
export const formatDateRange = (eventDate) => {
  // Ensure eventDate is a valid Date object
  const date = new Date(eventDate);

  // Format the date as "Month Day" (e.g., "May 03")
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
  });
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const generateRecurringEvents = (event) => {
  if (
    !event.isReoccurring ||
    !event.reoccurringStartDate ||
    !event.reoccurringEndDate ||
    !event.dayOfWeek
  ) {
    return [];
  }

  const dayOfWeekMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };

  const startDate = new Date(event.reoccurringStartDate);
  const endDate = new Date(event.reoccurringEndDate);
  const targetDay = dayOfWeekMap[event.dayOfWeek.toLowerCase()];

  const occurrences = [];
  let currentDate = new Date(startDate);

  // Adjust the start date to the first occurrence of the target day
  while (currentDate.getDay() !== targetDay) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generate all occurrences
  while (currentDate <= endDate) {
    occurrences.push({
      ...event,
      date: new Date(currentDate), // Set the date for this occurrence
    });
    currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
  }

  return occurrences;
};

export const optimizeCloudinaryUrl = (url) => {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

// Build a readable slug URL param: "my-event-title-<mongoId>"
export const toSlug = (title, id) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${slug}-${id}`;
};

// Extract the MongoDB ObjectId from the end of a slug (always 24 hex chars)
export const slugToId = (slug) => slug.slice(-24);

// Validate a UK phone number.
// Accepts: 07xxx (11 digits), +447xxx (12 digits), 01/02/03 landlines (10-11 digits).
// Strips spaces, dashes, and parens before checking.
export const validatePhone = (phone) => {
  const stripped = phone.replace(/[\s\-()]/g, "");
  // +44 international format
  if (/^\+44\d{10}$/.test(stripped)) return true;
  // 0-prefixed UK number (10 or 11 digits total)
  if (/^0\d{9,10}$/.test(stripped)) return true;
  return false;
};
