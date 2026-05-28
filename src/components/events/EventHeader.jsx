import React from "react";
import { useParams } from "react-router-dom";
import ManageHeader from "../common/ManageHeader";

export default function EventHeader() {
  const { eventSlug } = useParams();
  return (
    <ManageHeader
      label="Event Management"
      icon="event"
      hideOnPaths={/\/events\/(new|[^/]+\/edit)/}
      createTo="/events/new"
      createLabel="Create Event"
      editTo={eventSlug ? `/events/${eventSlug}/edit` : undefined}
      editLabel="Edit Event"
    />
  );
}
