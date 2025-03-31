import React, { useState } from "react";
import { getAuthToken } from "../auth/auth";
import {
  Form,
  useNavigate,
  useNavigation,
  useActionData,
  redirect,
} from "react-router-dom";

const EventForm = ({ method, event = {} }) => {
  const [base64Image, setBase64Image] = useState(event.image || null); // Pre-fill with existing image if editing
  const data = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelHandler = () => {
    navigate("..");
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {method === "PATCH" ? "Edit Event" : "Create New Event"}
      </h1>

      {data && data.errors && (
        <div className="alert alert-error mb-4">
          <ul>
            {Object.values(data.errors).map((err, index) => (
              <li key={index} className="text-red-500">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Form method={method} className="space-y-6" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label htmlFor="title" className="label font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              className="input input-bordered w-full"
              required
              defaultValue={event.title || ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="shortDescription" className="label font-medium">
              Short Description
            </label>
            <input
              id="shortDescription"
              type="text"
              name="shortDescription"
              className="input input-bordered w-full"
              required
              defaultValue={event.shortDescription || ""}
            />
          </div>

          <div className="form-control md:col-span-2">
            <label htmlFor="description" className="label font-medium">
              Long Description
            </label>
            <textarea
              id="description"
              name="description"
              className="textarea textarea-bordered w-full"
              required
              defaultValue={event.longDescription || ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="date" className="label font-medium">
              Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              className="input input-bordered w-full"
              required
              defaultValue={event.date ? formatDate(event.date) : ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="openingTime" className="label font-medium">
              Opening Time
            </label>
            <input
              id="openingTime"
              type="time"
              name="openingTime"
              className="input input-bordered w-full"
              defaultValue={event.openingTime || ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="street" className="label font-medium">
              Street
            </label>
            <input
              id="street"
              type="text"
              name="street"
              className="input input-bordered w-full"
              required
              defaultValue={event.street || ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="postCode" className="label font-medium">
              Post Code
            </label>
            <input
              id="postCode"
              type="text"
              name="postCode"
              className="input input-bordered w-full"
              defaultValue={event.postCode || ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="city" className="label font-medium">
              City
            </label>
            <input
              id="city"
              type="text"
              name="city"
              className="input input-bordered w-full"
              required
              defaultValue={event.city || ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="ageRestriction" className="label font-medium">
              Age Restriction
            </label>
            <input
              id="ageRestriction"
              type="text"
              name="ageRestriction"
              className="input input-bordered w-full"
              defaultValue={event.ageRestriction || ""}
            />
          </div>

          <div className="form-control md:col-span-2">
            <label htmlFor="accessibilityInfo" className="label font-medium">
              Accessibility Info
            </label>
            <textarea
              id="accessibilityInfo"
              name="accessibilityInfo"
              className="textarea textarea-bordered w-full"
              defaultValue={event.accessibilityInfo || ""}
            />
          </div>

          <div className="form-control">
            <label htmlFor="ticketPrice" className="label font-medium">
              Ticket Price
            </label>
            <input
              id="ticketPrice"
              type="number"
              step="0.01"
              name="ticketPrice"
              className="input input-bordered w-full"
              required
              defaultValue={event.ticketPrice || ""}
            />
          </div>

          <div className="form-control md:col-span-2">
            <label htmlFor="image" className="label font-medium">
              Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              className="file-input file-input-bordered w-full"
              accept="image/*"
              onChange={handleImageChange}
            />
            {base64Image && (
              <img
                src={base64Image}
                alt="Event preview"
                className="mt-4 max-w-xs rounded-lg shadow-md"
              />
            )}
            {/* Display existing images */}
            {event.images && event.images.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Existing Images:</h3>
                <div className="flex space-x-4">
                  {event.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Event Image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions flex justify-end space-x-4 mt-6">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cancelHandler}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default EventForm;

export async function action({ request, params }) {
  const method = request.method;
  const data = await request.formData();

  const eventData = {
    title: data.get("title"),
    shortDescription: data.get("shortDescription"),
    longDescription: data.get("description"),
    date: data.get("date"),
    openingTime: data.get("openingTime"),
    street: data.get("street"),
    postCode: data.get("postCode"),
    city: data.get("city"),
    ageRestriction: data.get("ageRestriction"),
    accessibilityInfo: data.get("accessibilityInfo"),
    ticketPrice: data.get("ticketPrice"),
  };

  const formData = new FormData();
  formData.append("eventData", JSON.stringify(eventData));
  formData.append("image", data.get("image"));

  let url = "http://localhost:5000/api/events";
  if (method === "PUT" || method === "PATCH" || method === "put") {
    const eventId = params.eventId;

    url = `http://localhost:5000/api/events/${eventId}`;
  }

  const token = getAuthToken();
  try {
    console.log("Token:", token); // Debugging: Ensure the token is being retrieved correctly

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`, // Add the "Bearer" prefix
      },
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    return redirect("/events");
  } catch (error) {
    console.error("Error during form submission:", error);
    throw error;
  }
}
