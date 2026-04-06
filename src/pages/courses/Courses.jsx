import React, { useState } from "react";
import { Link, useRouteLoaderData } from "react-router-dom";
import CourseCard from "../../components/courses/CourseCard";
import { isAdmin, isModerator } from "../../auth/auth";

const CATEGORIES = ["All", "Language", "Religious", "Academic", "Arts", "Other"];

export default function CoursesPage() {
  const { courses } = useRouteLoaderData("root");
  const canManage = isAdmin() || isModerator();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = (courses || []).filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const open = filtered.filter((c) => c.enrollmentOpen);
  const closed = filtered.filter((c) => !c.enrollmentOpen);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 md:p-14 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Courses</h1>
          <p className="text-neutral-content/80 text-lg">
            Learn, grow and connect with the community
          </p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Manage bar */}
        {canManage && (
          <div className="flex items-center justify-between mb-6 glass-card px-6 py-4 rounded-2xl border border-white/30 shadow-md">
            <p className="text-sm text-base-content/70 font-medium">Manage Courses</p>
            <Link
              to="/courses/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium shadow transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Course
            </Link>
          </div>
        )}

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-9 py-2.5"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                    : "bg-white/60 text-base-content hover:bg-white/80 border border-base-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Open enrollment */}
        {open.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-base-content mb-5">Open for Enrollment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {open.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </>
        )}

        {/* Closed enrollment */}
        {closed.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-base-content mb-5">Coming Soon / Closed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closed.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center rounded-2xl border border-white/30">
            <p className="text-base-content/70 text-lg">No courses found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
