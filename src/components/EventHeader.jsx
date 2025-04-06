import React from "react";
import { useRouteLoaderData, Form, NavLink } from "react-router-dom";

const EventHeader = () => {
  const { token } = useRouteLoaderData("root");

  // Only render the header if the token exists
  if (!token) {
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
        <Form method="post" action="/logout" className="flex items-center">
          <button className="btn btn-secondary">Logout</button>
        </Form>
      </div>
    </nav>
  );
};

export default EventHeader;
