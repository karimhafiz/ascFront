import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CourseForm from "../components/CourseForm";

export default function CourseFormPage() {
    const { courseId } = useParams();
    const isEditing = !!courseId;

    const { data: course, isLoading, error } = useQuery({
        queryKey: ["course", courseId],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_DEV_URI}courses/${courseId}`);
            if (!res.ok) throw new Error("Failed to fetch course");
            return res.json();
        },
        enabled: isEditing, // only fetch if editing
    });

    if (isEditing && isLoading) return (
        <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">
            <p className="text-purple-600">Loading...</p>
        </div>
    );

    if (isEditing && error) return (
        <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">
            <p className="text-red-500">{error.message}</p>
        </div>
    );

    return (
        <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen py-10 px-4">
            <CourseForm method={isEditing ? "PUT" : "POST"} course={course} />
        </div>
    );
}