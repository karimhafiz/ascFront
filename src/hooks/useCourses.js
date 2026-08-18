import { useQuery } from "@tanstack/react-query";
import { API, fetchPublicJSON } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";

export function useCourses() {
  return useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: () => fetchPublicJSON(`${API}courses`),
  });
}

export function useCourse(courseId) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: () => fetchPublicJSON(`${API}courses/${courseId}`),
    enabled: !!courseId,
  });
}
