import React from "react";
import { useParams } from "react-router-dom";
import ManageHeader from "../common/ManageHeader";

export default function CourseHeader() {
  const { courseSlug } = useParams();
  return (
    <ManageHeader
      label="Course Management"
      icon="course"
      hideOnPaths={/\/courses\/(new|[^/]+\/edit)/}
      createTo="/courses/new"
      createLabel="Create Course"
      editTo={courseSlug ? `/courses/${courseSlug}/edit` : undefined}
      editLabel="Edit Course"
    />
  );
}
