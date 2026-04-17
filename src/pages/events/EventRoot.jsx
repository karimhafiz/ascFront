import React from "react";
import { Outlet } from "react-router-dom";
import EventHeader from "../../components/events/EventHeader";
const EventRoot = () => {
  return (
    <>
      <EventHeader />
      <Outlet />
    </>
  );
};

export default EventRoot;
