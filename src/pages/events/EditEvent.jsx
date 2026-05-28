import React from "react";
import { useParams } from "react-router-dom";
import EventForm from "../../components/events/EventForm";
import { useEvent } from "../../hooks/useEvents";
import { slugToId } from "../../util/util";
import { Spinner } from "../../components/ui";

function EditEvent() {
  const { eventSlug } = useParams();
  const eventId = slugToId(eventSlug);
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  return <EventForm method="PUT" event={event} />;
}

export default EditEvent;
