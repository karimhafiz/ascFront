import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ManageHeader from "../../components/common/ManageHeader";

export default function VenueRoot() {
  const { venueId } = useParams();
  return (
    <>
      <ManageHeader
        label="Venue Management"
        icon="venue"
        hideOnPaths={/\/venues\/(new|[^/]+\/edit)/}
        createTo="/venues/new"
        createLabel="Create Venue"
        editTo={venueId ? `/venues/${venueId}/edit` : undefined}
        editLabel="Edit Venue"
      />
      <Outlet />
    </>
  );
}
