import { useState } from "react";
import { formatDate, usePagination } from "./adminHelpers";
import Pagination from "./Pagination";

const TEAM_SORT_OPTIONS = [
  { key: "members", label: "Members" },
  { key: "paid", label: "Payment" },
];

export default function TeamsTab({ teams }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const handleTeamSort = (key) => {
    if (sort.key === key) {
      setSort({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, dir: "asc" });
    }
  };

  const filtered = teams.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.manager?.name?.toLowerCase().includes(q) ||
      t.manager?.email?.toLowerCase().includes(q) ||
      t.manager?.phone?.includes(q) ||
      t.members?.some(
        (m) => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
      )
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
    let va, vb;
    if (sort.key === "members") {
      va = a.members?.length ?? 0;
      vb = b.members?.length ?? 0;
    } else if (sort.key === "paid") {
      va = a.paid ? 1 : 0;
      vb = b.paid ? 1 : 0;
    }
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  const pg = usePagination(sorted, [search, sort.key, sort.dir]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <input
          type="text"
          placeholder="Search teams, members, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input flex-1 max-w-xs"
        />
        <div className="flex bg-base-200 rounded-xl p-1 gap-1">
          {TEAM_SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleTeamSort(opt.key)}
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
      </div>
      {pg.paged.length === 0 && (
        <p className="text-center text-base-content/50 py-12">No team registrations found</p>
      )}
      {pg.paged.map((team) => (
        <div
          key={team._id}
          className="bg-white rounded-2xl border border-base-300 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base-content">{team.name}</p>
              <p className="text-xs text-base-content/50 mt-0.5">
                {team.event?.title ?? "Unknown event"}
                {team.event?.date && <span> · {formatDate(team.event.date)}</span>}
              </p>
              <p className="text-xs text-base-content/50 mt-0.5">
                Manager: {team.manager?.name} · {team.manager?.email}
                {team.manager?.phone && ` · ${team.manager.phone}`}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-end gap-1">
                <span
                  className={
                    "text-xs font-medium px-2 py-0.5 rounded-full border " +
                    (team.paid
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-orange-50 text-orange-600 border-orange-200")
                  }
                >
                  {team.paid ? "✓ Paid" : "Pending"}
                </span>
                <span className="text-xs text-base-content/50">
                  {team.members?.length ?? 0} members
                </span>
              </div>
              <button
                onClick={() => {
                  const members = (team.members || [])
                    .map(
                      (m) =>
                        `<tr><td style="padding:4px 12px;border-bottom:1px solid #eee">${m.name || "—"}</td><td style="padding:4px 12px;border-bottom:1px solid #eee">${m.email || "—"}</td></tr>`
                    )
                    .join("");
                  const w = window.open("", "_blank");
                  w.document.write(
                    `<html><head><title>Team — ${team.name}</title><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;color:#1a1a1a}h1{font-size:20px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:12px}th{text-align:left;padding:6px 12px;background:#f5f5f5;font-size:13px}td{font-size:13px}.meta{color:#666;font-size:13px;margin:2px 0}.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600}</style></head><body><h1>${team.name}</h1><p class="meta">${team.event?.title || "Unknown event"}${team.event?.date ? " · " + formatDate(team.event.date) : ""}</p><p class="meta">Manager: ${team.manager?.name || "—"} · ${team.manager?.email || "—"}${team.manager?.phone ? " · " + team.manager.phone : ""}</p><p class="meta">Status: <span class="badge" style="background:${team.paid ? "#dcfce7;color:#15803d" : "#fff7ed;color:#ea580c"}">${team.paid ? "Paid" : "Pending"}</span></p>${(team.members?.length ?? 0) > 0 ? `<table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>${members}</tbody></table>` : ""}<script>window.print()</script></body></html>`
                  );
                  w.document.close();
                }}
                className="p-1.5 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-primary transition-colors cursor-pointer shrink-0"
                title="Print team details"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </button>
            </div>
          </div>
          {team.members?.length > 0 && (
            <div className="px-5 pb-4">
              <button
                onClick={() => setExpanded(expanded === team._id ? null : team._id)}
                className="text-xs text-base-content/70 hover:text-base-content font-medium flex items-center gap-1 cursor-pointer"
              >
                {expanded === team._id ? "Hide members" : "Show members"}
                <svg
                  className={
                    "w-3 h-3 transition-transform " + (expanded === team._id ? "rotate-180" : "")
                  }
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expanded === team._id && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {team.members.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-base-content/70 bg-base-200/50 rounded-lg px-3 py-1.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-base-200 text-base-content/70 font-bold flex items-center justify-center text-[10px]">
                        {m.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      <span>{m.name}</span>
                      {m.email && <span className="text-base-content/50">· {m.email}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <Pagination
        page={pg.page}
        totalPages={pg.totalPages}
        setPage={pg.setPage}
        total={filtered.length}
        label={`team${filtered.length !== 1 ? "s" : ""}`}
      />
    </div>
  );
}
