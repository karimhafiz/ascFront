import React, { useState, useMemo } from "react";
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

const StatusBadge = ({ status }) => {
  const st = ENROLLMENT_STATUS[status] ?? {
    label: status ?? "Unknown",
    classes: "bg-base-100 text-base-content/50 border-base-300",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.classes}`}>
      {st.label}
    </span>
  );
};

const PrintBtn = ({ enrollment }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      const statusLabel = (
        ENROLLMENT_STATUS[enrollment.status] ?? { label: enrollment.status ?? "Unknown" }
      ).label;
      const w = window.open("", "_blank");
      w.document.write(
        `<html><head><title>Enrollment \u2014 ${enrollment.courseId?.title || "Course"}</title><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;color:#1a1a1a}h1{font-size:20px;margin-bottom:4px}.meta{color:#666;font-size:13px;margin:2px 0}.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600}</style></head><body><h1>${enrollment.courseId?.title || "Course"}</h1><p class="meta">Buyer: ${enrollment.buyerEmail || "\u2014"}</p><p class="meta">Phone: ${enrollment.buyerPhone || "\u2014"}</p><p class="meta">Status: <span class="badge" style="background:#f0f9ff;color:#0369a1">${statusLabel}</span></p><p class="meta">Date: ${formatDate(enrollment.createdAt)}</p><script>window.print()<` +
          `/script></body></html>`
      );
      w.document.close();
    }}
    className="p-2 rounded-lg hover:bg-base-200 text-base-content/60 hover:text-primary transition-colors cursor-pointer"
    title="Print enrollment"
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

const EnrollmentRow = ({ e }) => (
  <tr className="bg-white hover:bg-base-200/30 transition-colors">
    <td className="px-3 sm:px-4 py-3 text-base-content/70 truncate max-w-[140px] sm:max-w-none">
      {e.buyerEmail}
    </td>
    <td className="px-3 sm:px-4 py-3 text-base-content/70 hidden sm:table-cell">
      {e.buyerPhone || "\u2014"}
    </td>
    <td className="px-3 sm:px-4 py-3">
      <StatusBadge status={e.status} />
    </td>
    <td className="px-3 sm:px-4 py-3 text-base-content/50 hidden sm:table-cell">
      {formatDate(e.createdAt)}
    </td>
    <td className="px-3 sm:px-4 py-3 text-center">
      <PrintBtn enrollment={e} />
    </td>
  </tr>
);

const SubToggle = ({ value, setValue, options }) => (
  <div className="flex bg-base-200 rounded-lg p-0.5 gap-0.5">
    {options.map((o) => (
      <button
        key={o.key}
        onClick={() => setValue(o.key)}
        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
          value === o.key
            ? "bg-white shadow-sm text-base-content"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default function CoursesTab({ enrollments, courses }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("enrollments");
  const [enrollMode, setEnrollMode] = useState("grouped");
  const [enrollSort, setEnrollSort] = useState({ key: null, dir: "asc" });
  const [courseSort, setCourseSort] = useState({ key: null, dir: "asc" });
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [courseGroupSort, setCourseGroupSort] = useState({ key: null, dir: "asc" });

  const filteredEnrollments = useMemo(() => {
    if (!search) return enrollments;
    const q = search.toLowerCase();
    return enrollments.filter(
      (e) =>
        e.buyerEmail?.toLowerCase().includes(q) ||
        e.buyerPhone?.includes(search) ||
        e.courseId?.title?.toLowerCase().includes(q)
    );
  }, [enrollments, search]);

  const filteredCourses = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) => c.title?.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q)
    );
  }, [courses, search]);

  // -- By Course grouping --
  const courseGroups = useMemo(() => {
    const map = new Map();
    for (const e of filteredEnrollments) {
      const cid = e.courseId?._id || "unknown";
      if (!map.has(cid)) {
        map.set(cid, {
          courseId: cid,
          title: e.courseId?.title || "Unknown Course",
          instructor: e.courseId?.instructor,
          category: e.courseId?.category,
          price: e.courseId?.price,
          enrollments: [],
        });
      }
      map.get(cid).enrollments.push(e);
    }
    const groups = Array.from(map.values());
    if (courseGroupSort.key === "enrollments") {
      groups.sort((a, b) =>
        courseGroupSort.dir === "asc"
          ? a.enrollments.length - b.enrollments.length
          : b.enrollments.length - a.enrollments.length
      );
    }
    return groups;
  }, [filteredEnrollments, courseGroupSort]);

  // -- Ungrouped enrollments sorted --
  const sortedEnrollments = useMemo(() => {
    if (!enrollSort.key) return filteredEnrollments;
    return [...filteredEnrollments].sort((a, b) => {
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
  }, [filteredEnrollments, enrollSort]);

  // -- Courses sorted --
  const sortedCourses = useMemo(() => {
    if (!courseSort.key) return filteredCourses;
    return [...filteredCourses].sort((a, b) => {
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
  }, [filteredCourses, courseSort]);

  const enrollPg = usePagination(sortedEnrollments, [search, enrollSort.key, enrollSort.dir]);
  const coursePg = usePagination(sortedCourses, [search, courseSort.key, courseSort.dir]);

  const toggleCourse = (cid) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid);
      else next.add(cid);
      return next;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <input
          type="text"
          placeholder="Search courses or emails…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-full sm:flex-1 sm:w-auto"
        />
        <div className="flex bg-base-200 rounded-xl p-1 gap-1">
          {[
            { key: "enrollments", label: "Enrollments" },
            { key: "courses", label: "Courses" },
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
      </div>

      {/* ── Enrollments view ── */}
      {view === "enrollments" && (
        <div>
          {/* Sub-toggle + sort controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <SubToggle
              value={enrollMode}
              setValue={setEnrollMode}
              options={[
                { key: "grouped", label: "By Course" },
                { key: "ungrouped", label: "Ungrouped" },
              ]}
            />
            {enrollMode === "grouped" && courseGroups.length > 0 && (
              <button
                onClick={() =>
                  setCourseGroupSort((prev) =>
                    prev.key === "enrollments"
                      ? { key: "enrollments", dir: prev.dir === "asc" ? "desc" : "asc" }
                      : { key: "enrollments", dir: "desc" }
                  )
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  courseGroupSort.key === "enrollments"
                    ? "bg-gradient-to-r from-primary to-primary/70 text-white shadow-sm"
                    : "bg-base-200 text-base-content/50 hover:text-base-content"
                }`}
              >
                Enrollments
                {courseGroupSort.key === "enrollments" && (
                  <svg
                    className={`w-3 h-3 transition-transform ${courseGroupSort.dir === "desc" ? "rotate-180" : ""}`}
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
            )}
          </div>

          {/* Grouped (By Course) */}
          {enrollMode === "grouped" && (
            <div className="space-y-4">
              {courseGroups.length === 0 && (
                <p className="text-center text-base-content/50 py-12">No enrollments found</p>
              )}
              {courseGroups.map((group) => {
                const isOpen = expandedCourses.has(group.courseId);
                return (
                  <div
                    key={group.courseId}
                    className="rounded-2xl border border-base-300 shadow-sm overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => toggleCourse(group.courseId)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-base-200/30 transition-colors cursor-pointer"
                    >
                      <div className="text-left min-w-0">
                        <p className="font-semibold text-base-content">{group.title}</p>
                        <p className="text-xs text-base-content/50 mt-0.5">
                          {group.instructor && <span>{group.instructor}</span>}
                          {group.category && (
                            <span>
                              {group.instructor ? " \u00b7 " : ""}
                              {group.category}
                            </span>
                          )}
                          {group.price > 0 && (
                            <span>
                              {group.instructor || group.category ? " \u00b7 " : ""}\u00a3
                              {group.price}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs bg-base-200 text-base-content/70 px-2.5 py-0.5 rounded-full">
                          {group.enrollments.length} enrollment
                          {group.enrollments.length !== 1 ? "s" : ""}
                        </span>
                        <Chevron open={isOpen} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-base-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-base-100/50 text-left">
                              <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                                Buyer Email
                              </th>
                              <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 hidden sm:table-cell">
                                Phone
                              </th>
                              <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50">
                                Status
                              </th>
                              <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 hidden sm:table-cell">
                                Date
                              </th>
                              <th className="px-3 sm:px-4 py-2 text-xs font-medium text-base-content/50 text-center">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-base-100">
                            {group.enrollments.map((e) => (
                              <EnrollmentRow key={e._id} e={e} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
              {courseGroups.length > 0 && (
                <p className="text-xs text-base-content/50 mt-3">
                  {filteredEnrollments.length} enrollment
                  {filteredEnrollments.length !== 1 ? "s" : ""} &middot; {courseGroups.length}{" "}
                  course
                  {courseGroups.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Ungrouped (flat table) */}
          {enrollMode === "ungrouped" && (
            <>
              <div className="rounded-2xl border border-base-300 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                      <th className="px-3 sm:px-4 py-3 font-semibold text-base-content">Course</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-base-content hidden md:table-cell">
                        Buyer Email
                      </th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-base-content hidden lg:table-cell">
                        Phone
                      </th>
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
                      <th className="px-3 sm:px-4 py-3 font-semibold text-base-content text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-100">
                    {enrollPg.paged.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-base-content/50">
                          No enrollments found
                        </td>
                      </tr>
                    ) : (
                      enrollPg.paged.map((e) => (
                        <tr key={e._id} className="bg-white hover:bg-base-200/30 transition-colors">
                          <td className="px-3 sm:px-4 py-3 font-medium text-base-content">
                            <span className="block truncate max-w-[140px] sm:max-w-none">
                              {e.courseId?.title ?? "\u2014"}
                            </span>
                            <span className="block text-xs text-base-content/50 md:hidden truncate">
                              {e.buyerEmail}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-base-content/70 hidden md:table-cell">
                            {e.buyerEmail}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-base-content/70 hidden lg:table-cell">
                            {e.buyerPhone || "\u2014"}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <StatusBadge status={e.status} />
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-base-content/50">
                            {formatDate(e.createdAt)}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-center">
                            <PrintBtn enrollment={e} />
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
        </div>
      )}

      {/* ── Courses summary view ── */}
      {view === "courses" && (
        <>
          <div className="rounded-2xl border border-base-300 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-base-200 to-base-200 text-left">
                  <th className="px-4 py-3 font-semibold text-base-content">Title</th>
                  <th className="px-4 py-3 font-semibold text-base-content hidden sm:table-cell">
                    Instructor
                  </th>
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
                      <td className="px-4 py-3 text-base-content/70 hidden sm:table-cell">
                        {c.instructor}
                      </td>
                      <td className="px-4 py-3 text-base-content/70">{c.category}</td>
                      <td className="px-4 py-3 text-base-content/70">
                        {c.price > 0 ? `\u00a3${c.price}` : "Free"}
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
