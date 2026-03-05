import React from "react";
import { useRouteLoaderData, Form, NavLink } from "react-router-dom";
import { isAdmin } from "../auth/auth";

const EventHeader = () => {
  const { token } = useRouteLoaderData("root");

  // Only render the header if the token exists and user is admin
  if (!token || !isAdmin()) {
    return null;
  }

  return (
    <nav className="bg-secondary text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <NavLink
          to="/events/new"
          className="btn text-xl font-bold hover:opacity-80"
        >
          Create New Event
        </NavLink>
        {/* logout moved to navbar; avoid duplicate button here */}
      </div>
    </nav>
  );
};

export default EventHeader;
