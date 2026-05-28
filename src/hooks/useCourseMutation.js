import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { API } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";
import { fetchWithAuth } from "../auth/auth";
import { compressImage } from "../util/compressImage";
import { slugToId } from "../util/util";

export function useCourseMutation(method, courseSlug) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const courseId = courseSlug ? slugToId(courseSlug) : null;

  return useMutation({
    mutationFn: async (formData) => {
      const courseData = {
        title: formData.get("title"),
        shortDescription: formData.get("shortDescription"),
        description: formData.get("description"),
        instructor: formData.get("instructor"),
        category: formData.get("category"),
        schedule: formData.get("schedule"),
        price: parseFloat(formData.get("price")) || 0,
        maxEnrollment: formData.get("maxEnrollment")
          ? parseInt(formData.get("maxEnrollment"))
          : undefined,
        street: formData.get("street"),
        city: formData.get("city"),
        postCode: formData.get("postCode"),
        enrollmentOpen: formData.get("enrollmentOpen") === "true",
        isSubscription: formData.get("billingType") !== "one-time",
        billingInterval:
          formData.get("billingType") !== "one-time" ? formData.get("billingType") : "month",
        featured: formData.get("featured") === "true",
      };

      const body = new FormData();
      body.append("courseData", JSON.stringify(courseData));
      const imageFile = formData.get("image");
      if (imageFile instanceof File && imageFile.size > 0) {
        const compressed = await compressImage(imageFile);
        body.append("image", compressed);
      }

      const url = courseId ? `${API}courses/${courseId}` : `${API}courses`;

      const res = await fetchWithAuth(url, { method, body });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Unknown error");
      }
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) });
      }
      navigate("/courses");
    },
  });
}
