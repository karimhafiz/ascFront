import React, { useState } from "react";
import SortableHeader from "../common/SortableHeader";
import { formatDate, ENROLLMENT_STATUS, usePagination } from "./adminHelpers";
import Pagination from "./Pagination";

const ENROLL_STATUS_ORDER = {
  active: 0,
  paid: 1,
  pending: 2,
  free: 3,
  past_due: 4,
  cancelled: 5,
};

export default function CoursesTab({ enrollments, courses }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("enrollments");
  const [enrollSort, setEnrollSort] = useState({ key: null, dir: "asc" });
  const [courseSort, setCourseSort] = useState({ key: null, dir: "asc" });

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.buyerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      e.buyerPhone?.includes(search) ||
      e.courseId?.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCourses = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    if (!enrollSort.key) return 0;
    let va, vb;
    if (enrollSort.key === "status") {
      va = ENROLL_STATUS_ORDER[a.status] ?? 6;
      vb = ENROLL_STATUS_ORDER[b.status] ?? 6;
    } else if (enrollSort.key === "date") {
      va = new Date(a.createdAt);
      vb = new Date(b.createdAt);
    }
    return enrollSort.dir === "asc" ? va - vb : vb - va;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!courseSort.key) return 0;
    if (courseSort.key === "category")
      return courseSort.dir === "asc"
        ? (a.category ?? "").localeCompare(b.category ?? "")
        : (b.category ?? "").localeCompare(a.category ?? "");
    let va, vb;
    if (courseSort.key === "price") {
      va = a.price ?? 0;
      vb = b.price ?? 0;
    } else if (courseSort.key === "enrolled") {
      va = a.currentEnrollment ?? 0;
      vb = b.currentEnrollment ?? 0;
    } else if (courseSort.key === "status") {
      va = a.enrollmentOpen ? 1 : 0;
      vb = b.enrollmentOpen ? 1 : 0;
    }
    return courseSort.dir === "asc" ? va - vb : vb - va;
  });

  const enrollPg = usePagination(sortedEnrollments, [search, enrollSort.key, enrollSort.dir]);
  const coursePg = usePagination(sortedCourses, [search, courseSort.key, courseSort.dir]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search courses or emails…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input flex-1"
        />
        <div className="flex bg-base-200 rounded-xl p-1 gap-1">
          {["enrollments", "courses"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${view === v ? "bg-white shadow-sm text-base-content" : "text-base-content/50 hover:text-base-content"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "enrollments" && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                  <th className="px-4 py-3 font-semibold text-base-content">Course</th>
                  <th className="px-4 py-3 font-semibold text-base-content">Buyer Email</th>
                  <th className="px-4 py-3 font-semibold text-base-content">Phone</th>
                  <th className="px-4 py-3 font-semibold text-base-content">Participants</th>
                  <SortableHeader
                    label="Status"
                    sortKey="status"
                    sort={enrollSort}
                    onSort={setEnrollSort}
                  />
                  <SortableHeader
                    label="Date"
                    sortKey="date"
                    sort={enrollSort}
                    onSort={setEnrollSort}
                  />
                  <th className="px-4 py-3 font-semibold text-base-content">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {enrollPg.paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-base-content/50">
                      No enrollments found
                    </td>
                  </tr>
                ) : (
                  enrollPg.paged.map((e) => (
                    <tr key={e._id} className="bg-white hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-base-content">
                        {e.courseId?.title ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-base-content/70">{e.buyerEmail}</td>
                      <td className="px-4 py-3 text-base-content/70">{e.buyerPhone || "—"}</td>
                      <td className="px-4 py-3 text-base-content/70">
                        {e.participants?.length > 0
                          ? e.participants.map((p) => p.name).join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const st = ENROLLMENT_STATUS[e.status] ?? {
                            label: e.status ?? "Unknown",
                            classes: "bg-base-100 text-base-content/50 border-base-300",
                          };
                          return (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.classes}`}
                            >
                              {st.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-base-content/50">{formatDate(e.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            const participants = (e.participants || [])
                              .map(
                                (p) =>
                                  `<tr><td style="padding:4px 12px;border-bottom:1px solid #eee">${p.name || "—"}</td><td style="padding:4px 12px;border-bottom:1px solid #eee">${p.email || "—"}</td></tr>`
                              )
                              .join("");
                            const statusLabel = (
                              ENROLLMENT_STATUS[e.status] ?? { label: e.status ?? "Unknown" }
                            ).label;
                            const w = window.open("", "_blank");
                            w.document.write(
                              `<html><head><title>Enrollment — ${e.courseId?.title || "Course"}</title><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;color:#1a1a1a}h1{font-size:20px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:12px}th{text-align:left;padding:6px 12px;background:#f5f5f5;font-size:13px}td{font-size:13px}.meta{color:#666;font-size:13px;margin:2px 0}.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600}</style></head><body><h1>${e.courseId?.title || "Course"}</h1><p class="meta">Buyer: ${e.buyerEmail || "—"}</p><p class="meta">Phone: ${e.buyerPhone || "—"}</p><p class="meta">Status: <span class="badge" style="background:#f0f9ff;color:#0369a1">${statusLabel}</span></p><p class="meta">Date: ${formatDate(e.createdAt)}</p>${(e.participants?.length ?? 0) > 0 ? `<h2 style="font-size:16px;margin-top:20px">Participants</h2><table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>${participants}</tbody></table>` : ""}<script>window.print()</script></body></html>`
                            );
                            w.document.close();
                          }}
                          className="p-1.5 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-primary transition-colors cursor-pointer"
                          title="Print enrollment"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={enrollPg.page}
            totalPages={enrollPg.totalPages}
            setPage={enrollPg.setPage}
            total={filteredEnrollments.length}
            label={`enrollment${filteredEnrollments.length !== 1 ? "s" : ""}`}
          />
        </>
      )}

      {view === "courses" && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                  <th className="px-4 py-3 font-semibold text-base-content">Title</th>
                  <th className="px-4 py-3 font-semibold text-base-content">Instructor</th>
                  <SortableHeader
                    label="Category"
                    sortKey="category"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                  <SortableHeader
                    label="Price"
                    sortKey="price"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                  <SortableHeader
                    label="Enrolled"
                    sortKey="enrolled"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                  <SortableHeader
                    label="Status"
                    sortKey="status"
                    sort={courseSort}
                    onSort={setCourseSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {coursePg.paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-base-content/50">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  coursePg.paged.map((c) => (
                    <tr key={c._id} className="bg-white hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-base-content">{c.title}</td>
                      <td className="px-4 py-3 text-base-content/70">{c.instructor}</td>
                      <td className="px-4 py-3 text-base-content/70">{c.category}</td>
                      <td className="px-4 py-3 text-base-content/70">
                        {c.price > 0 ? `£${c.price}` : "Free"}
                      </td>
                      <td className="px-4 py-3 text-base-content/70">
                        {c.currentEnrollment}
                        {c.maxEnrollment ? ` / ${c.maxEnrollment}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.enrollmentOpen ? "bg-green-50 text-green-700 border-green-200" : "bg-base-100 text-base-content/50 border-base-300"}`}
                        >
                          {c.enrollmentOpen ? "Open" : "Closed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={coursePg.page}
            totalPages={coursePg.totalPages}
            setPage={coursePg.setPage}
            total={filteredCourses.length}
            label={`course${filteredCourses.length !== 1 ? "s" : ""}`}
          />
        </>
      )}
    </div>
  );
}
