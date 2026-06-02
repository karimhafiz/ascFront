import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ManageHeader from "../../components/common/ManageHeader";

export default function VenueRoot() {
  const { venueSlug } = useParams();
  return (
    <>
      <ManageHeader
        label="Venue Management"
        icon="venue"
        hideOnPaths={/\/venues\/(new|[^/]+\/edit)/}
        createTo="/venues/new"
        createLabel="Create Venue"
        editTo={venueSlug ? `/venues/${venueSlug}/edit` : undefined}
        editLabel="Edit Venue"
      />
      <Outlet />
    </>
  );
}
