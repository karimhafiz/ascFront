import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { slugToId } from "../../util/util";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, GlassCard, PageContainer, Spinner } from "../../components/ui";
import { fetchWithAuth } from "../../auth/auth";
import { queryKeys } from "../../api/queryKeys";

const API = import.meta.env.VITE_DEV_URI;

const INITIAL_FORM = {
  name: "",
  description: "",
  street: "",
  city: "",
  postCode: "",
  capacity: "",
  pricePerHour: "",
  amenities: "",
  rules: "",
  cancellationPolicy: "",
  isActive: true,
};

export default function VenueFormPage() {
  const { venueSlug } = useParams();
  const venueId = venueSlug ? slugToId(venueSlug) : null;
  const isEditing = !!venueId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: venue,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: queryKeys.venues.detail(venueId),
    queryFn: async () => {
      const response = await fetch(`${API}venues/${venueId}`);
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Failed to load venue.");
      return data;
    },
    enabled: isEditing,
  });

  const venueToForm = (v) => ({
    name: v.name || "",
    description: v.description || "",
    street: v.street || "",
    city: v.city || "",
    postCode: v.postCode || "",
    capacity: v.capacity ?? "",
    pricePerHour: v.pricePerHour ?? "",
    amenities: v.amenities?.join(", ") || "",
    rules: v.rules || "",
    cancellationPolicy: v.cancellationPolicy || "",
    isActive: v.isActive ?? true,
  });

  const [formData, setFormData] = useState(() =>
    isEditing && venue ? venueToForm(venue) : INITIAL_FORM
  );

  useEffect(() => {
    if (venue) setFormData(venueToForm(venue));
  }, [venue]);

  const set = (field) => (e) =>
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const body = {
      ...formData,
      capacity: Number(formData.capacity),
      pricePerHour: Number(formData.pricePerHour),
      amenities: formData.amenities
        ? formData.amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const url = isEditing ? `${API}venues/${venueId}` : `${API}venues`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Failed to save venue.");

      queryClient.invalidateQueries({ queryKey: queryKeys.venues.all });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: queryKeys.venues.detail(venueId) });
      }

      navigate("/venues/booking");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isEditing && loadError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-500">{loadError.message}</p>
      </div>
    );
  }

  return (
    <PageContainer className="pb-12">
      <Helmet>
        <title>{isEditing ? "Edit Venue" : "New Venue"} | Ayendah Sazan</title>
      </Helmet>

      <section className="page-section pt-6 md:pt-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <span className="section-kicker mb-3">{isEditing ? "Edit Venue" : "New Venue"}</span>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-base-content">
              {isEditing ? "Update venue details" : "Create a venue listing"}
            </h1>
          </div>

          <GlassCard className="rounded-[2rem] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="glass-label" htmlFor="name">
                  Venue Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className="glass-input"
                  value={formData.name}
                  onChange={set("name")}
                  required
                />
              </div>

              <div>
                <label className="glass-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className="glass-input"
                  value={formData.description}
                  onChange={set("description")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="glass-label" htmlFor="street">
                    Street *
                  </label>
                  <input
                    id="street"
                    type="text"
                    className="glass-input"
                    value={formData.street}
                    onChange={set("street")}
                    required
                  />
                </div>
                <div>
                  <label className="glass-label" htmlFor="city">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    className="glass-input"
                    value={formData.city}
                    onChange={set("city")}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="glass-label" htmlFor="postCode">
                    Post Code
                  </label>
                  <input
                    id="postCode"
                    type="text"
                    className="glass-input"
                    value={formData.postCode}
                    onChange={set("postCode")}
                  />
                </div>
                <div>
                  <label className="glass-label" htmlFor="capacity">
                    Capacity *
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    className="glass-input"
                    value={formData.capacity}
                    onChange={set("capacity")}
                    required
                  />
                </div>
                <div>
                  <label className="glass-label" htmlFor="pricePerHour">
                    Price per Slot (£) *
                  </label>
                  <input
                    id="pricePerHour"
                    type="number"
                    min="0"
                    step="0.01"
                    className="glass-input"
                    value={formData.pricePerHour}
                    onChange={set("pricePerHour")}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="glass-label" htmlFor="amenities">
                  Amenities{" "}
                  <span className="text-base-content/50 normal-case font-normal">
                    (comma-separated)
                  </span>
                </label>
                <input
                  id="amenities"
                  type="text"
                  className="glass-input"
                  placeholder="e.g. WiFi, Projector, Parking"
                  value={formData.amenities}
                  onChange={set("amenities")}
                />
              </div>

              <div>
                <label className="glass-label" htmlFor="rules">
                  Venue Rules
                </label>
                <textarea
                  id="rules"
                  rows="3"
                  className="glass-input"
                  value={formData.rules}
                  onChange={set("rules")}
                />
              </div>

              <div>
                <label className="glass-label" htmlFor="cancellationPolicy">
                  Cancellation Policy
                </label>
                <textarea
                  id="cancellationPolicy"
                  rows="3"
                  className="glass-input"
                  value={formData.cancellationPolicy}
                  onChange={set("cancellationPolicy")}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.isActive}
                  onChange={set("isActive")}
                />
                <span className="text-sm font-semibold text-base-content">
                  Active (visible to users)
                </span>
              </label>

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                      ? "Save Changes"
                      : "Create Venue"}
                </Button>
                <Button
                  type="button"
                  className="btn-ghost"
                  onClick={() => navigate("/venues/booking")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </section>
    </PageContainer>
  );
}
