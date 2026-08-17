export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return "£" + Number(amount ?? 0).toFixed(2);
}

export const INTERVAL_ADJ = { month: "Monthly", year: "Yearly", week: "Weekly" };

export const CATEGORY_COLORS = {
  Language: "from-blue-500 to-primary/70",
  Religious: "from-emerald-500 to-teal-600",
  Academic: "from-primary to-primary/70",
  Arts: "from-primary to-primary/70",
  Other: "from-amber-500 to-orange-600",
};

export const BOOKING_STATUS_STYLES = {
  confirmed: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  completed: "bg-blue-50 text-blue-600 border-blue-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};
