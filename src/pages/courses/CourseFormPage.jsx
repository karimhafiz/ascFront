import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CourseForm from "../../components/courses/CourseForm";
import { slugToId } from "../../util/util";

export default function CourseFormPage() {
  const { courseSlug } = useParams();
  const courseId = courseSlug ? slugToId(courseSlug) : null;
  const isEditing = !!courseId;

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
    enabled: isEditing,
  });

  if (isEditing && isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base-content/70">Loading...</p>
      </div>
    );

  if (isEditing && error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error.message}</p>
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4">
      <CourseForm method={isEditing ? "PUT" : "POST"} course={course} key={course?._id || "new"} />
    </div>
  );
}
