import { useQuery } from "@tanstack/react-query";
import { API } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";

export function useCourses() {
  return useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: async () => {
      const res = await fetch(`${API}courses`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });
}

export function useCourse(courseId) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: async () => {
      const res = await fetch(`${API}courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
    enabled: !!courseId,
  });
}
