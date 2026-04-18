import React, { useState } from "react";
import emailjs from "@emailjs/browser";

import { Button } from "../../components/ui";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setIsSubmitting(false);
          setSuccessMessage("Your message has been sent successfully!");
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            subject: "",
            message: "",
          });
        },
        () => {
          setIsSubmitting(false);
          setErrorMessage("Failed to send your message. Please try again later.");
        }
      );
  };

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="container mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center text-base-content mb-8">
          Get in Touch
        </h1>
        <p className="text-center text-lg text-base-content/70 mb-12">
          Please fill out the form below to send us your query. Alternatively, you can email us at{" "}
          <a href="mailto:info@ascuk.org.uk" className="text-primary font-semibold hover:underline">
            info@ascuk.org.uk
          </a>
        </p>
        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg glass-card shadow-xl rounded-2xl px-5 sm:px-8 py-8 sm:py-10 border border-white/30 backdrop-blur-md"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
              <div className="w-full sm:w-1/2">
                <label className="glass-label" htmlFor="firstName">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="glass-input py-3"
                  required
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="glass-label" htmlFor="lastName">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="glass-input py-3"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="glass-label" htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="glass-input py-3"
                required
              />
            </div>
            <div className="mb-6">
              <label className="glass-label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="glass-input py-3"
              />
            </div>
            <div className="mb-6">
              <label className="glass-label" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={handleChange}
                className="glass-input py-3"
                required
              ></textarea>
            </div>
            <div className="text-center">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
            {successMessage && (
              <div className="mt-4 flex items-center gap-2 bg-green-50/80 border border-green-200 text-green-700 text-sm p-3 rounded-xl backdrop-blur-sm">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 bg-red-50/80 border border-red-200 text-red-600 text-sm p-3 rounded-xl backdrop-blur-sm">
                <svg
                  className="w-4 h-4 flex-shrink-0"
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
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
