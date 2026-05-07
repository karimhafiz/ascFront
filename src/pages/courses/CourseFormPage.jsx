import React from "react";
import { useParams } from "react-router-dom";
import CourseForm from "../../components/courses/CourseForm";
import { slugToId } from "../../util/util";
import { useCourse } from "../../hooks/useCourses";

export default function CourseFormPage() {
  const { courseSlug } = useParams();
  const courseId = courseSlug ? slugToId(courseSlug) : null;
  const isEditing = !!courseId;

  const { data: course, isLoading, error } = useCourse(courseId);

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
