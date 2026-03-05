import React from "react";
import EventForm from "../components/EventForm";
import { isAdmin } from "../auth/auth";
import { Navigate } from "react-router-dom";

const NewEvent = () => {
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <EventForm method="POST" />;
};

export default NewEvent;
