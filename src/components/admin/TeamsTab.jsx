import React, { useState, useMemo } from "react";
import { formatDate, usePagination } from "./adminHelpers";
import Pagination from "./Pagination";

const SORT_OPTIONS = [
  { key: "paid", label: "Payment" },
  { key: "date", label: "Date" },
];

const Chevron = ({ open }) => (
  <svg
    className={`w-4 h-4 text-base-content/40 transition-transform ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ViewToggle = ({ view, setView }) => (
  <div className="flex bg-base-200 rounded-xl p-1 gap-1">
    {[
      { key: "byEvent", label: "By Event" },
      { key: "all", label: "All" },
    ].map((v) => (
      <button
        key={v.key}
        onClick={() => setView(v.key)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          view === v.key
            ? "bg-white shadow-sm text-base-content"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        {v.label}
      </button>
    ))}
  </div>
);

const PrintBtn = ({ team }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      const w = window.open("", "_blank");
      w.document.write(
        `<html><head><title>Team \u2014 ${team.name}</title><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;color:#1a1a1a}h1{font-size:20px;margin-bottom:4px}.meta{color:#666;font-size:13px;margin:2px 0}.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600}</style></head><body><h1>${team.name}</h1><p class="meta">${team.event?.title || "Unknown event"}${team.event?.date ? " \u00b7 " + formatDate(team.event.date) : ""}</p><p class="meta">Manager: ${team.manager?.name || "\u2014"} \u00b7 ${team.manager?.email || "\u2014"}${team.manager?.phone ? " \u00b7 " + team.manager.phone : ""}</p><p class="meta">Status: <span class="badge" style="background:${team.paid ? "#dcfce7;color:#15803d" : "#fff7ed;color:#ea580c"}">${team.paid ? "Paid" : "Pending"}</span></p><script>window.print()<` +
          `/script></body></html>`
      );
      w.document.close();
    }}
    className="p-2 rounded-lg hover:bg-base-200 text-base-content/60 hover:text-primary transition-colors cursor-pointer shrink-0"
    title="Print team details"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  </button>
);

const TeamCard = ({ team, showEvent }) => (
  <div className="bg-white rounded-2xl border border-base-300 shadow-sm px-5 py-4 flex items-start justify-between gap-3">
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-base-content">{team.name}</p>
      {showEvent && (
        <p className="text-xs text-base-content/50 mt-0.5">
          {team.event?.title ?? "Unknown event"}
          {team.event?.date && <span> &middot; {formatDate(team.event.date)}</span>}
        </p>
      )}
      <p className="text-xs text-base-content/50 mt-0.5">
        Manager: {team.manager?.name} &middot; {team.manager?.email}
        {team.manager?.phone && ` \u00b7 ${team.manager.phone}`}
      </p>
    </div>
    <div className="flex items-start gap-2">
      <span
        className={
          "text-xs font-medium px-2 py-0.5 rounded-full border " +
          (team.paid
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-orange-50 text-orange-600 border-orange-200")
        }
      >
        {team.paid ? "\u2713 Paid" : "Pending"}
      </span>
      <PrintBtn team={team} />
    </div>
  </div>
);

export default function TeamsTab({ teams }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("byEvent");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, dir: "asc" });
    }
  };

  const filtered = useMemo(() => {
    if (!search) return teams;
    const q = search.toLowerCase();
    return teams.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.manager?.name?.toLowerCase().includes(q) ||
        t.manager?.email?.toLowerCase().includes(q) ||
        t.manager?.phone?.includes(q) ||
        t.event?.title?.toLowerCase().includes(q)
    );
  }, [teams, search]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      let va, vb;
      if (sort.key === "paid") {
        va = a.paid ? 1 : 0;
        vb = b.paid ? 1 : 0;
      } else if (sort.key === "date") {
        va = new Date(a.createdAt);
        vb = new Date(b.createdAt);
      }
      return sort.dir === "asc" ? va - vb : vb - va;
    });
  }, [filtered, sort]);

  // -- By Event --
  const eventGroups = useMemo(() => {
    const map = new Map();
    for (const t of filtered) {
      const eid = t.event?._id || "unknown";
      if (!map.has(eid)) {
        map.set(eid, {
          eventId: eid,
          title: t.event?.title || "Unknown Event",
          date: t.event?.date,
          teams: [],
        });
      }
      map.get(eid).teams.push(t);
    }
    return Array.from(map.values());
  }, [filtered]);

  const pg = usePagination(sorted, [search, sort.key, sort.dir]);

  const toggleEvent = (eid) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eid)) next.delete(eid);
      else next.add(eid);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <input
          type="text"
          placeholder="Search teams or manager…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-full sm:flex-1 sm:w-auto"
        />
        <ViewToggle view={view} setView={setView} />
        {view === "all" && (
          <div className="flex bg-base-200 rounded-xl p-1 gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSort(opt.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  sort.key === opt.key
                    ? "bg-gradient-to-r from-primary to-primary/70 text-white shadow-sm"
                    : "text-base-content/50 hover:text-base-content"
                }`}
              >
                {opt.label}
                {sort.key === opt.key && (
                  <svg
                    className={`w-3 h-3 transition-transform ${sort.dir === "desc" ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── By Event view ── */}
      {view === "byEvent" && (
        <div className="space-y-4">
          {eventGroups.length === 0 && (
            <p className="text-center text-base-content/50 py-12">No team registrations found</p>
          )}
          {eventGroups.map((group) => {
            const isOpen = expandedEvents.has(group.eventId);
            const paidCount = group.teams.filter((t) => t.paid).length;
            return (
              <div
                key={group.eventId}
                className="rounded-2xl border border-base-300 shadow-sm overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleEvent(group.eventId)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-base-200/30 transition-colors cursor-pointer"
                >
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-base-content">{group.title}</p>
                    {group.date && (
                      <p className="text-xs text-base-content/50 mt-0.5">
                        {formatDate(group.date)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs bg-base-200 text-base-content/70 px-2.5 py-0.5 rounded-full">
                      {group.teams.length} team{group.teams.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-green-700 font-medium">{paidCount} paid</span>
                    <Chevron open={isOpen} />
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-base-200 p-3 space-y-2">
                    {group.teams.map((team) => (
                      <TeamCard key={team._id} team={team} showEvent={false} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {eventGroups.length > 0 && (
            <p className="text-xs text-base-content/50 mt-3">
              {filtered.length} team{filtered.length !== 1 ? "s" : ""} &middot; {eventGroups.length}{" "}
              event{eventGroups.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* ── All view ── */}
      {view === "all" && (
        <>
          {pg.paged.length === 0 && (
            <p className="text-center text-base-content/50 py-12">No team registrations found</p>
          )}
          {pg.paged.map((team) => (
            <TeamCard key={team._id} team={team} showEvent />
          ))}
          <Pagination
            page={pg.page}
            totalPages={pg.totalPages}
            setPage={pg.setPage}
            total={filtered.length}
            label={`team${filtered.length !== 1 ? "s" : ""}`}
          />
        </>
      )}
    </div>
  );
}
