import React from "react";
import { useRouteLoaderData, useLocation, useParams } from "react-router-dom";
import { isAdmin, isModerator } from "../../auth/auth";
import { Button } from "../ui";

const CourseHeader = () => {
  const { token } = useRouteLoaderData("root");
  const location = useLocation();
  const { courseSlug } = useParams();

  if (/\/courses\/(new|[^/]+\/edit)/.test(location.pathname)) {
    return null;
  }

  if (!token || (!isAdmin() && !isModerator())) {
    return null;
  }

  const isDetailPage = !!courseSlug;

  return (
    <div className="container mx-auto px-6 pt-6">
      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 px-6 py-4 shadow-sm gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-base-content">Course Management</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isDetailPage && (
            <Button
              variant="primary"
              to={`/courses/${courseSlug}/edit`}
              className="shadow-md shadow-primary/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Course
            </Button>
          )}
          <Button variant="primary" to="/courses/new" className="shadow-md shadow-primary/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
