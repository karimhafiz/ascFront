import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/50 bg-neutral text-neutral-content">
      <div className="page-section grid grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1 text-center sm:text-left">
          <div className="mb-4 flex items-center justify-center sm:justify-start gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary via-primary to-primary/90 text-sm font-bold text-white shadow-lg shadow-black/20">
              ASC
            </div>
            <span className="text-lg font-semibold tracking-[0.04em] text-white">
              Ayendah Sazan
            </span>
          </div>
          <p className="max-w-xs mx-auto sm:mx-0 text-sm leading-relaxed text-neutral-content/68">
            A community-based organisation in Leeds dedicated to bringing people together through
            cultural, educational, and sporting events.
          </p>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-neutral-content/65 inline-block sm:block">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex items-center gap-2 transition-colors duration-200 hover:text-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary transition-colors group-hover:bg-white" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">
            Programmes
          </h3>
          <ul className="space-y-2 text-sm text-neutral-content/65 inline-block sm:block">
            {[
              { to: "/events", label: "Events" },
              { to: "/courses", label: "Courses" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex items-center gap-2 transition-colors duration-200 hover:text-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary transition-colors group-hover:bg-white" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">
            Get in Touch
          </h3>
          <ul className="space-y-3 text-sm text-neutral-content/68">
            <li className="flex items-start justify-center sm:justify-start gap-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Leeds, United Kingdom</span>
            </li>
            <li>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-white/12"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send us a message
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10" />

      <div className="page-section flex flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-neutral-content/45 sm:flex-row">
        <p>&copy; {year} Ayendah Sazan Community Organisation. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/about" className="transition-colors hover:text-white">
            About
          </Link>
          <Link to="/contact" className="transition-colors hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
