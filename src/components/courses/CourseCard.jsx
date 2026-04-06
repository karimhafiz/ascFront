import React, { useState } from "react";
import { Link } from "react-router-dom";
import { isAdmin, isModerator, getAuthToken } from "../../auth/auth";
import { optimizeCloudinaryUrl, toSlug } from "../../util/util";
import { Badge, GlassCard } from "../ui";

const CATEGORY_COLORS = {
  Language: { bg: "from-primary to-secondary", badge: "primary" },
  Religious: { bg: "from-accent to-success", badge: "accent" },
  Academic: { bg: "from-info to-info/70", badge: "info" },
  Arts: { bg: "from-secondary to-primary", badge: "secondary" },
  Other: { bg: "from-warning to-warning/70", badge: "warning" },
};

export default function CourseCard({ course }) {
  const colors = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;
  const spotsLeft = course.maxEnrollment ? course.maxEnrollment - course.currentEnrollment : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const canManage = isAdmin() || isModerator();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${course._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  return (
    <div className="group">
      <GlassCard className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <Link to={`/courses/${toSlug(course.title, course._id)}`} className="block">
          {/* Image or gradient banner */}
          {course.images && course.images.length > 0 ? (
            <img
              src={optimizeCloudinaryUrl(course.images[0])}
              alt={course.title}
              className="w-full h-44 object-cover"
              width="400"
              height="176"
            />
          ) : (
            <div
              className={`w-full h-44 bg-gradient-to-br ${colors.bg} flex items-center justify-center`}
            >
              <svg
                className="w-14 h-14 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}

          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Badge color={colors.badge}>{course.category}</Badge>
              <span className="text-sm font-bold text-base-content">
                {course.price > 0 ? `£${course.price}` : "Free"}
              </span>
            </div>

            <h3 className="text-lg font-bold text-base-content mb-1 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
              {course.shortDescription || course.description}
            </p>

            <div className="space-y-1.5 text-xs text-base-content/70">
              {course.instructor && (
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{course.instructor}</span>
                </div>
              )}
              {course.schedule && (
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{course.schedule}</span>
                </div>
              )}
              {course.city && (
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{course.city}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              {spotsLeft !== null ? (
                <Badge color={isFull ? "error" : "success"}>
                  {isFull ? "Full" : `${spotsLeft} spots left`}
                </Badge>
              ) : (
                <span className="text-xs text-base-content/50">
                  {course.currentEnrollment} enrolled
                </span>
              )}
              {!course.enrollmentOpen && (
                <span className="text-xs bg-base-200 text-base-content/70 px-2 py-0.5 rounded-full">
                  Enrollment closed
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Admin/mod action bar */}
        {canManage && (
          <div className="flex gap-2 p-3 bg-base-100/50 border-t border-base-300">
            <Link
              to={`/courses/${toSlug(course.title, course._id)}/edit`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
