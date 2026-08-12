import { useMutation } from "@tanstack/react-query";
import { API, fetchJSON } from "../api/apiClient";

// Shared by EnrolledPanel.jsx (course page) and EnrollmentRow.jsx (profile page) —
// both act on the same enrollment resource, just from different screens.

export function useEnrollmentCancelMutation(enrollmentId) {
  return useMutation({
    mutationFn: () =>
      fetchJSON(`${API}courses/enrollments/${enrollmentId}/cancel`, { method: "POST" }),
  });
}

export function useEnrollmentReactivateMutation(enrollmentId) {
  return useMutation({
    mutationFn: () =>
      fetchJSON(`${API}courses/enrollments/${enrollmentId}/reactivate`, { method: "POST" }),
  });
}

export function useEnrollmentAddParticipantMutation(enrollmentId) {
  return useMutation({
    mutationFn: (participant) =>
      fetchJSON(`${API}courses/enrollments/${enrollmentId}/add-participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participant),
      }),
  });
}

export function useEnrollmentRemoveParticipantMutation(enrollmentId) {
  return useMutation({
    mutationFn: ({ participantId }) =>
      fetchJSON(`${API}courses/enrollments/${enrollmentId}/remove-participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      }),
  });
}

export function useEnrollmentEditParticipantMutation(enrollmentId) {
  return useMutation({
    mutationFn: ({ participantId, name, age }) =>
      fetchJSON(`${API}courses/enrollments/${enrollmentId}/participants/${participantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age }),
      }),
  });
}

export function useEnrollmentUpdatePhoneMutation(enrollmentId) {
  return useMutation({
    mutationFn: (buyerPhone) =>
      fetchJSON(`${API}courses/enrollments/${enrollmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerPhone }),
      }),
  });
}
