import React, { useState } from "react";
import { Form, useNavigate, useNavigation, useActionData } from "react-router-dom";

const EventForm = ({ method, event = {} }) => {
  const [base64Image, setBase64Image] = useState(event.image || null); // Pre-fill with existing image if editing
  const [isReoccurring, setIsReoccurring] = useState(event.isReoccurring || false); // Manage isReoccurring state dynamically

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

  const labelClass = "glass-label";
  const fieldClass = "glass-input";
  const selectClass = "glass-input glass-select";
  const textareaClass = "glass-input";
  const fileClass = "glass-input-file";

  return (
    <div className="max-w-4xl mx-auto rounded-xl border border-white/30 bg-white/90 backdrop-blur-md p-8 shadow-xl">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-slate-900">
        {method === "PATCH" ? "Edit Event" : "Create New Event"}
      </h1>

      {data && data.errors && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50/90 backdrop-blur-sm px-5 py-4 text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="font-semibold text-sm">Please fix the following:</p>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-7">
            {Object.values(data.errors).map((err, index) => (
              <li key={index} className="text-sm">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Form
        method={method}
        className="space-y-6"
        encType="multipart/form-data"
        data-testid="event-form"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="form-control">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              className={fieldClass}
              required
              defaultValue={event.title || ""}
            />
          </div>

          {/* Short Description */}
          <div className="form-control">
            <label htmlFor="shortDescription" className={labelClass}>
              Short Description
            </label>
            <input
              id="shortDescription"
              type="text"
              name="shortDescription"
              className={fieldClass}
              required
              defaultValue={event.shortDescription || ""}
            />
          </div>

          {/* Long Description */}
          <div className="form-control md:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Long Description
            </label>
            <textarea
              id="description"
              name="description"
              className={textareaClass}
              required
              defaultValue={event.longDescription || ""}
            />
          </div>

          {/* Date */}
          <div className="form-control">
            <label htmlFor="date" className={labelClass}>
              Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              className={fieldClass}
              required
              defaultValue={event.date ? formatDate(event.date) : ""}
            />
          </div>

          {/* Opening Time */}
          <div className="form-control">
            <label htmlFor="openingTime" className={labelClass}>
              Opening Time
            </label>
            <input
              id="openingTime"
              type="time"
              name="openingTime"
              className={fieldClass}
              defaultValue={event.openingTime || ""}
            />
          </div>

          {/* Street */}
          <div className="form-control">
            <label htmlFor="street" className={labelClass}>
              Street
            </label>
            <input
              id="street"
              type="text"
              name="street"
              className={fieldClass}
              required
              defaultValue={event.street || ""}
            />
          </div>

          {/* Post Code */}
          <div className="form-control">
            <label htmlFor="postCode" className={labelClass}>
              Post Code
            </label>
            <input
              id="postCode"
              type="text"
              name="postCode"
              className={fieldClass}
              defaultValue={event.postCode || ""}
            />
          </div>

          {/* City */}
          <div className="form-control">
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input
              id="city"
              type="text"
              name="city"
              className={fieldClass}
              required
              defaultValue={event.city || ""}
            />
          </div>

          {/* Age Restriction */}
          <div className="form-control">
            <label htmlFor="ageRestriction" className={labelClass}>
              Age Restriction
            </label>
            <input
              id="ageRestriction"
              type="text"
              name="ageRestriction"
              className={fieldClass}
              defaultValue={event.ageRestriction || ""}
            />
          </div>

          {/* Accessibility Info */}
          <div className="form-control md:col-span-2">
            <label htmlFor="accessibilityInfo" className={labelClass}>
              Accessibility Info
            </label>
            <textarea
              id="accessibilityInfo"
              name="accessibilityInfo"
              className={textareaClass}
              defaultValue={event.accessibilityInfo || ""}
            />
          </div>

          {/* Ticket Price */}
          <div className="form-control">
            <label htmlFor="ticketPrice" className={labelClass}>
              Ticket Price
            </label>
            <input
              id="ticketPrice"
              type="number"
              step="0.01"
              name="ticketPrice"
              className={fieldClass}
              required
              defaultValue={event.ticketPrice || ""}
            />
          </div>
          {/* Tickets Available */}
          <div className="form-control">
            <label htmlFor="ticketsAvailable" className={labelClass}>
              Tickets Available
            </label>
            <input
              id="ticketsAvailable"
              type="number"
              min="0"
              name="ticketsAvailable"
              className={fieldClass}
              defaultValue={event.ticketsAvailable ?? ""}
            />
          </div>

          {/* Featured */}
          <div className="form-control">
            <label htmlFor="featured" className={labelClass}>
              Featured
            </label>
            <select
              id="featured"
              name="featured"
              className={selectClass}
              defaultValue={event.featured ? "true" : "false"}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Is Reoccurring */}
          <div className="form-control">
            <label htmlFor="isReoccurring" className={labelClass}>
              Is Reoccurring
            </label>
            <select
              id="isReoccurring"
              name="isReoccurring"
              className={selectClass}
              value={isReoccurring ? "true" : "false"}
              onChange={(e) => setIsReoccurring(e.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Reoccurring Start Date */}
          {isReoccurring && (
            <div className="form-control">
              <label htmlFor="reoccurringStartDate" className={labelClass}>
                Reoccurring Start Date
              </label>
              <input
                id="reoccurringStartDate"
                type="date"
                name="reoccurringStartDate"
                className={fieldClass}
                defaultValue={
                  event.reoccurringStartDate ? formatDate(event.reoccurringStartDate) : ""
                }
              />
            </div>
          )}

          {/* Reoccurring End Date */}
          {isReoccurring && (
            <div className="form-control">
              <label htmlFor="reoccurringEndDate" className={labelClass}>
                Reoccurring End Date
              </label>
              <input
                id="reoccurringEndDate"
                type="date"
                name="reoccurringEndDate"
                className={fieldClass}
                defaultValue={event.reoccurringEndDate ? formatDate(event.reoccurringEndDate) : ""}
              />
            </div>
          )}

          {/* Reoccurring Frequency */}
          {isReoccurring && (
            <div className="form-control">
              <label htmlFor="reoccurringFrequency" className={labelClass}>
                Reoccurring Frequency
              </label>
              <select
                id="reoccurringFrequency"
                name="reoccurringFrequency"
                className={selectClass}
                defaultValue={event.reoccurringFrequency || ""}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          {/* Day of the Week */}
          {isReoccurring && (
            <div className="form-control">
              <label htmlFor="dayOfWeek" className={labelClass}>
                Day of the Week
              </label>
              <select
                id="dayOfWeek"
                name="dayOfWeek"
                className={selectClass}
                defaultValue={event.dayOfWeek || ""}
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          )}

          {/* Type of Event */}
          <div className="form-control">
            <label htmlFor="typeOfEvent" className={labelClass}>
              Type of Event
            </label>
            <select
              id="typeOfEvent"
              name="typeOfEvent"
              className={selectClass}
              defaultValue={event.typeOfEvent || "ASC"}
              required
            >
              <option value="Sports">Sports</option>
              <option value="ASC">ASC</option>
            </select>
          </div>

          {/* is tournament */}
          <div className="form-control">
            <label htmlFor="isTournament" className={labelClass}>
              Is Tournament
            </label>
            <select
              id="isTournament"
              name="isTournament"
              className={selectClass}
              defaultValue={event.isTournament ? "true" : "false"}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="form-control md:col-span-2">
            <label htmlFor="image" className={labelClass}>
              Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              className={fileClass}
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
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Existing Images:</h3>
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

        {/* Form Actions */}
        <div className="form-actions flex justify-end space-x-4 mt-6">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            onClick={cancelHandler}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
              isSubmitting ? "loading" : ""
            }`}
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
