import React from "react";
import { Outlet } from "react-router-dom";
import EventHeader from "../components/EventHeader";
const EventRoot = () => {
  return (
    <>
      <EventHeader />
      <Outlet />
    </>
  );
};

export default EventRoot;
