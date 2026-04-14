import React from "react";
import { Outlet } from "react-router-dom";
import CourseHeader from "../../components/courses/CourseHeader";

const CourseRoot = () => {
  return (
    <>
      <CourseHeader />
      <Outlet />
    </>
  );
};

export default CourseRoot;
