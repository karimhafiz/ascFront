import React, { Suspense } from "react";
import { Await, useRouteLoaderData } from "react-router-dom";
import EventForm from "../components/EventForm";

function EditEvent() {
  const event = useRouteLoaderData("event-detail");

  return (
    <Suspense fallback={<p style={{ textAlign: "center" }}> Loading ...</p>}>
      <Await resolve={event}>
        {(loadedEvent) => <EventForm method="PUT" event={loadedEvent} />}
      </Await>
    </Suspense>
  );
}

export default EditEvent;
