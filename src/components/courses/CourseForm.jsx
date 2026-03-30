import React, { useState } from "react";
import { Form, useNavigate, useNavigation, useActionData } from "react-router-dom";

const CATEGORIES = ["Language", "Religious", "Academic", "Arts", "Other"];

const CourseForm = ({ method, course = {} }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const data = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const labelClass = "glass-label";
  const fieldClass = "glass-input";
  const selectClass = "glass-input glass-select";
  const textareaClass = "glass-input";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto rounded-xl border border-white/30 bg-white/90 backdrop-blur-md p-4 sm:p-8 shadow-xl">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-slate-900">
        {method === "PUT" ? "Edit Course" : "Create New Course"}
      </h1>

      {data?.errors && (
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
            {Object.values(data.errors).map((err, i) => (
              <li key={i} className="text-sm">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Form method={method} className="space-y-6" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="form-control md:col-span-2">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              name="title"
              className={fieldClass}
              required
              defaultValue={course.title || ""}
            />
          </div>

          {/* Short Description */}
          <div className="form-control md:col-span-2">
            <label className={labelClass}>Short Description</label>
            <input
              type="text"
              name="shortDescription"
              className={fieldClass}
              defaultValue={course.shortDescription || ""}
              placeholder="One line summary shown on the course card"
            />
          </div>

          {/* Description */}
          <div className="form-control md:col-span-2">
            <label className={labelClass}>Full Description</label>
            <textarea
              name="description"
              className={textareaClass}
              required
              defaultValue={course.description || ""}
            />
          </div>

          {/* Instructor */}
          <div className="form-control">
            <label className={labelClass}>Instructor</label>
            <input
              type="text"
              name="instructor"
              className={fieldClass}
              required
              defaultValue={course.instructor || ""}
            />
          </div>

          {/* Category */}
          <div className="form-control">
            <label className={labelClass}>Category</label>
            <select
              name="category"
              className={selectClass}
              defaultValue={course.category || "Other"}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className="form-control md:col-span-2">
            <label className={labelClass}>Schedule</label>
            <input
              type="text"
              name="schedule"
              className={fieldClass}
              defaultValue={course.schedule || ""}
              placeholder="e.g. Every Saturday, 10:00 – 12:00"
            />
          </div>

          {/* Price */}
          <div className="form-control">
            <label className={labelClass}>Price (£) — 0 for free</label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              className={fieldClass}
              required
              defaultValue={course.price ?? 0}
            />
          </div>

          {/* Subscription */}
          <div className="form-control">
            <label className={labelClass}>Billing Type</label>
            <select
              name="billingType"
              className={selectClass}
              defaultValue={
                course.isSubscription
                  ? course.billingInterval === "year"
                    ? "year"
                    : "month"
                  : "one-time"
              }
            >
              <option value="one-time">One-time payment</option>
              <option value="month">Monthly subscription</option>
              <option value="year">Yearly subscription</option>
            </select>
          </div>

          {/* Max Enrollment */}
          <div className="form-control">
            <label className={labelClass}>Max Enrollment (leave blank for unlimited)</label>
            <input
              type="number"
              name="maxEnrollment"
              min="1"
              className={fieldClass}
              defaultValue={course.maxEnrollment || ""}
            />
          </div>

          {/* Street */}
          <div className="form-control">
            <label className={labelClass}>Street</label>
            <input
              type="text"
              name="street"
              className={fieldClass}
              defaultValue={course.street || ""}
            />
          </div>

          {/* City */}
          <div className="form-control">
            <label className={labelClass}>City</label>
            <input
              type="text"
              name="city"
              className={fieldClass}
              defaultValue={course.city || ""}
            />
          </div>

          {/* Post Code */}
          <div className="form-control">
            <label className={labelClass}>Post Code</label>
            <input
              type="text"
              name="postCode"
              className={fieldClass}
              defaultValue={course.postCode || ""}
            />
          </div>

          {/* Enrollment Open */}
          <div className="form-control">
            <label className={labelClass}>Enrollment Open</label>
            <select
              name="enrollmentOpen"
              className={selectClass}
              defaultValue={course.enrollmentOpen === false ? "false" : "true"}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Featured */}
          <div className="form-control">
            <label className={labelClass}>Featured</label>
            <select
              name="featured"
              className={selectClass}
              defaultValue={course.featured ? "true" : "false"}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Image */}
          <div className="form-control md:col-span-2">
            <label className={labelClass}>Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="glass-input-file"
              onChange={handleImageChange}
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-3 max-w-xs rounded-lg shadow-md"
              />
            )}
            {!previewImage && course.images && course.images.length > 0 && (
              <img
                src={course.images[0]}
                alt="Current"
                className="mt-3 max-w-xs rounded-lg shadow-md"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save Course"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default CourseForm;
