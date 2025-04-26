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
