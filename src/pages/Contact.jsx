import React, { useState } from "react";
import emailjs from "@emailjs/browser";

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
        "your_service_id", // Replace with your EmailJS Service ID
        "your_template_id", // Replace with your EmailJS Template ID
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        "your_public_key" // Replace with your EmailJS Public Key
      )
      .then(
        (response) => {
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
        (error) => {
          setIsSubmitting(false);
          setErrorMessage(
            "Failed to send your message. Please try again later."
          );
        }
      );
  };

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 min-h-screen px-4 py-16">
      <div className="container mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-purple-700 mb-8">
          Get in Touch
        </h1>
        <p className="text-center text-lg text-indigo-700 mb-12">
          Please fill out the form below to send us your query. Alternatively,
          you can email us at{" "}
          <a
            href="mailto:info@ascuk.org.uk"
            className="text-pink-600 font-semibold hover:underline"
          >
            info@ascuk.org.uk
          </a>
        </p>
        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg glass-card shadow-xl rounded-2xl px-8 py-10 border border-white/30 backdrop-blur-md"
          >
            <div className="flex gap-6 mb-6">
              <div className="w-1/2">
                <label
                  className="block text-purple-700 text-sm font-medium mb-2"
                  htmlFor="firstName"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-purple-900"
                  required
                />
              </div>
              <div className="w-1/2">
                <label
                  className="block text-purple-700 text-sm font-medium mb-2"
                  htmlFor="lastName"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-purple-900"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label
                className="block text-purple-700 text-sm font-medium mb-2"
                htmlFor="email"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-purple-900"
                required
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-purple-700 text-sm font-medium mb-2"
                htmlFor="subject"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-purple-900"
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-purple-700 text-sm font-medium mb-2"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                id="message"
                rows="5"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-purple-900"
                required
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
            {successMessage && (
              <p className="text-green-600 text-center mt-4 bg-green-100/30 p-3 rounded-xl backdrop-blur-sm">
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-red-600 text-center mt-4 bg-red-100/30 p-3 rounded-xl backdrop-blur-sm">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
