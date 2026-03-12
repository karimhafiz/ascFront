import React from "react";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = {
    Language: { bg: "from-blue-500 to-indigo-600", badge: "bg-blue-100 text-blue-700" },
    Religious: { bg: "from-emerald-500 to-teal-600", badge: "bg-emerald-100 text-emerald-700" },
    Academic: { bg: "from-purple-500 to-violet-600", badge: "bg-purple-100 text-purple-700" },
    Arts: { bg: "from-pink-500 to-rose-600", badge: "bg-pink-100 text-pink-700" },
    Other: { bg: "from-amber-500 to-orange-600", badge: "bg-amber-100 text-amber-700" },
};

export default function CourseCard({ course }) {
    const colors = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.Other;
    const spotsLeft = course.maxEnrollment ? course.maxEnrollment - course.currentEnrollment : null;
    const isFull = spotsLeft !== null && spotsLeft <= 0;

    return (
        <Link to={`/courses/${course._id}`} className="block group">
            <div className="glass-card rounded-2xl shadow-lg border border-white/30 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Image or gradient banner */}
                {course.images && course.images.length > 0 ? (
                    <img src={course.images[0]} alt={course.title} className="w-full h-44 object-cover" />
                ) : (
                    <div className={`w-full h-44 bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                        <svg className="w-14 h-14 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                )}

                <div className="p-5">
                    {/* Category + price row */}
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                            {course.category}
                        </span>
                        <span className="text-sm font-bold text-purple-700">
                            {course.price > 0 ? `£${course.price}` : "Free"}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-purple-900 mb-1 group-hover:text-pink-600 transition-colors">{course.title}</h3>
                    <p className="text-sm text-purple-600 mb-3 line-clamp-2">{course.shortDescription || course.description}</p>

                    <div className="space-y-1.5 text-xs text-purple-600">
                        {course.instructor && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{course.instructor}</span>
                            </div>
                        )}
                        {course.schedule && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{course.schedule}</span>
                            </div>
                        )}
                        {course.city && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{course.city}</span>
                            </div>
                        )}
                    </div>

                    {/* Spots / enrollment status */}
                    <div className="mt-4 flex items-center justify-between">
                        {spotsLeft !== null ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                                {isFull ? "Full" : `${spotsLeft} spots left`}
                            </span>
                        ) : (
                            <span className="text-xs text-purple-400">{course.currentEnrollment} enrolled</span>
                        )}
                        {!course.enrollmentOpen && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Enrollment closed</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}