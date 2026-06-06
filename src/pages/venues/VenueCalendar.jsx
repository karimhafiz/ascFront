import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/src/style.css";
import { useQuery } from "@tanstack/react-query";

const API = import.meta.env.VITE_DEV_URI;

const toLocalDateStr = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const TODAY = toLocalDateStr(new Date());

export default function VenueCalendar({ venueId, selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(() => (selectedDate ? new Date(selectedDate) : new Date()));

  const monthFrom = toLocalDateStr(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthTo = toLocalDateStr(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const { data: rangeData } = useQuery({
    queryKey: ["venue-available-dates", venueId, monthFrom, monthTo],
    enabled: !!venueId,
    queryFn: async () => {
      const res = await fetch(`${API}venues/${venueId}/slots?from=${monthFrom}&to=${monthTo}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load availability.");
      return Array.isArray(data) ? { availableDates: [] } : data;
    },
  });

  const availableDays = useMemo(
    () => (rangeData?.availableDates ?? []).map((s) => new Date(s + "T00:00:00")),
    [rangeData]
  );

  const bookedDays = useMemo(
    () => (rangeData?.bookedDates ?? []).map((s) => new Date(s + "T00:00:00")),
    [rangeData]
  );

  const selectedDay = selectedDate ? new Date(selectedDate + "T00:00:00") : undefined;
  const today = new Date(TODAY + "T00:00:00");

  const handleDayClick = (day, modifiers) => {
    if (modifiers.disabled) return;
    onSelectDate(toLocalDateStr(day));
  };

  return (
    <div>
      <div className="venue-calendar-wrap flex justify-center rounded-2xl overflow-hidden border border-white/40 shadow-inner bg-white/20 backdrop-blur-sm">
        <DayPicker
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selectedDay}
          onDayClick={handleDayClick}
          weekStartsOn={1}
          disabled={{ before: today }}
          modifiers={{ available: availableDays, booked: bookedDays }}
          modifiersClassNames={{
            available: "rdp-day--available",
            booked: "rdp-day--booked",
            selected: "rdp-day--selected",
            today: "rdp-day--today",
            disabled: "rdp-day--disabled",
          }}
          showOutsideDays
          components={{
            Chevron: ({ orientation }) =>
              orientation === "left" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ),
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 px-1 text-xs text-base-content/50">
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.5)" }}
          />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: "rgba(37,99,235,0.2)", border: "2px solid rgba(37,99,235,0.6)" }}
          />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}
          />
          Fully Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.5)",
            }}
          />
          Today
        </span>
      </div>
    </div>
  );
}
