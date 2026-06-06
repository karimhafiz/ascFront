import { useMemo, useState } from "react";
import { Button, GlassCard } from "../../../components/ui";
import { formatDate } from "../../../util/util";
import TimeSelect from "./TimeSelect";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const WEEKENDS = ["saturday", "sunday"];

const PRESET_SORTED = {
  "Every Day": [...DAYS].sort().join(),
  Weekdays: [...WEEKDAYS].sort().join(),
  Weekends: [...WEEKENDS].sort().join(),
};

export default function ScheduleEditor({ schedule, setSchedule, onSave, saving, onGenerate }) {
  const [newEntry, setNewEntry] = useState({ days: [], start: "", end: "" });
  const [addEntryError, setAddEntryError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [generateForm, setGenerateForm] = useState({ from: "", to: "" });
  const [generating, setGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState({ error: "", success: "" });

  const today = formatDate(new Date());
  const newDaysSorted = useMemo(() => [...newEntry.days].sort().join(), [newEntry.days]);

  const toggleDay = (day) =>
    setNewEntry((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));

  const handleAddEntries = (e) => {
    e.preventDefault();
    setAddEntryError("");
    if (!newEntry.days.length) return setAddEntryError("Select at least one day.");
    if (!newEntry.start || !newEntry.end)
      return setAddEntryError("Start and end time are required.");
    if (newEntry.end <= newEntry.start)
      return setAddEntryError("End time must be after start time.");

    const toAdd = newEntry.days.map((day) => ({
      dayOfWeek: day,
      startTime: newEntry.start,
      endTime: newEntry.end,
    }));
    setSchedule((prev) => [...prev, ...toAdd]);
    setNewEntry({ days: [], start: "", end: "" });
  };

  const handleRemoveEntry = (index) => setSchedule((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaveError("");
    try {
      await onSave(schedule);
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerateStatus({ error: "", success: "" });
    if (!generateForm.from || !generateForm.to)
      return setGenerateStatus({ error: "Both dates are required.", success: "" });
    if (generateForm.to <= generateForm.from)
      return setGenerateStatus({ error: "End date must be after start date.", success: "" });
    setGenerating(true);
    try {
      const message = await onGenerate(generateForm.from, generateForm.to);
      setGenerateStatus({ error: "", success: message });
      setGenerateForm({ from: "", to: "" });
    } catch (err) {
      setGenerateStatus({ error: err.message, success: "" });
    } finally {
      setGenerating(false);
    }
  };

  // Group entries by day for display (single pass)
  const scheduleByDay = useMemo(() => {
    const acc = Object.fromEntries(DAYS.map((d) => [d, []]));
    schedule.forEach((entry, globalIndex) => {
      acc[entry.dayOfWeek].push({ entry, globalIndex });
    });
    return acc;
  }, [schedule]);

  return (
    <div className="mb-10">
      {/* Mobile: flex-col with explicit order. Desktop: 2-col grid, left col wraps add+generate */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_2fr]">
        {/* Add Entry — order 1 mobile, row 1 col 1 desktop */}
        <GlassCard className="w-11/12 lg:w-full m-auto rounded-4xl p-6 order-1 lg:col-start-1 lg:row-start-1">
          <h2 className="mb-1 text-xl font-semibold text-base-content">Weekly Schedule</h2>
          <p className="mb-6 text-sm text-base-content/60">
            Define which days and times this venue is available each week. Save the schedule, then
            generate bookable slots for a date range.
          </p>

          <h3 className="mb-4 text-base font-semibold text-base-content">Add Entry</h3>
          <form onSubmit={handleAddEntries} className="space-y-4">
            <div>
              <label className="glass-label">Days *</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: "Every Day", days: DAYS },
                  { label: "Weekdays", days: WEEKDAYS },
                  { label: "Weekends", days: WEEKENDS },
                ].map(({ label, days }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setNewEntry((prev) => ({ ...prev, days }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      newDaysSorted === PRESET_SORTED[label]
                        ? "bg-primary text-primary-content border-primary"
                        : "border-base-300 bg-base-100 text-base-content/70 hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={newEntry.days.includes(d)}
                      onChange={() => toggleDay(d)}
                    />
                    <span className="text-sm text-base-content/80 capitalize">{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="glass-label" htmlFor="newStart">
                  Start *
                </label>
                <TimeSelect
                  id="newStart"
                  value={newEntry.start}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, start: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="glass-label" htmlFor="newEnd">
                  End *
                </label>
                <TimeSelect
                  id="newEnd"
                  value={newEntry.end}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, end: e.target.value }))}
                  required
                />
              </div>
            </div>
            {addEntryError && <p className="text-sm text-red-500">{addEntryError}</p>}
            <Button type="submit" disabled={saving} className="w-full">
              Add to Schedule
            </Button>
          </form>
        </GlassCard>

        {/* Schedule Template + Save — order 2 mobile, spans both rows in col 2 desktop */}
        <div className="w-11/12 lg:w-full m-auto space-y-3 order-2 lg:col-start-2 lg:row-span-2">
          <h3 className="text-base font-semibold text-base-content">Schedule Template</h3>
          {schedule.length === 0 ? (
            <GlassCard className="rounded-4xl p-6 text-center">
              <p className="text-base-content/60">No schedule entries yet.</p>
            </GlassCard>
          ) : (
            DAYS.filter((d) => scheduleByDay[d].length > 0).map((day) => (
              <div key={day} className="mx-6">
                <p className="mb-2 text-xs font-semibold tracking-widest text-base-content/50 capitalize">
                  {day}
                </p>
                <div className="space-y-2">
                  {scheduleByDay[day].map(({ entry, globalIndex }, i) => (
                    <GlassCard
                      key={i}
                      className=" rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <p className="font-semibold text-base-content">
                        {entry.startTime} — {entry.endTime}
                      </p>
                      <Button
                        variant="danger"
                        className="text-sm"
                        onClick={() => handleRemoveEntry(globalIndex)}
                      >
                        Remove
                      </Button>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))
          )}
          <Button className="w-full mt-2" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Schedule"}
          </Button>
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        </div>

        {/* Generate Slots — order 3 mobile, row 2 col 1 desktop */}
        <GlassCard className="w-11/12 lg:w-full m-auto rounded-4xl p-6 order-3 lg:row-start-2 lg:col-start-1">
          <h3 className="mb-4 text-base font-semibold text-base-content">Generate Slots</h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="glass-label" htmlFor="fromDate">
                  From *
                </label>
                <input
                  id="fromDate"
                  type="date"
                  min={today}
                  className="glass-input"
                  value={generateForm.from}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, from: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="glass-label" htmlFor="toDate">
                  To *
                </label>
                <input
                  id="toDate"
                  type="date"
                  min={generateForm.from || today}
                  className="glass-input"
                  value={generateForm.to}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, to: e.target.value }))}
                  required
                />
              </div>
            </div>
            {generateStatus.error && <p className="text-sm text-red-500">{generateStatus.error}</p>}
            {generateStatus.success && (
              <p className="text-sm text-green-600">{generateStatus.success}</p>
            )}
            <Button type="submit" className="w-full" disabled={generating || !schedule.length}>
              {generating ? "Generating..." : "Generate Slots"}
            </Button>
            {!schedule.length && (
              <p className="text-xs text-base-content/50 text-center">Save a schedule first.</p>
            )}
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
