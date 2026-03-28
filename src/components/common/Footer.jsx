import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white mt-10">
      {/* Main footer grid */}
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-pink-500/30">
              ASC
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent">
              Ayendah Sazan
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            A community-based organisation in Leeds dedicated to bringing people together through
            cultural, educational, and sporting events.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="hover:text-pink-400 transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-500 group-hover:bg-pink-400 transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Programmes */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
            Programmes
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              { to: "/events/asc", label: "ASC Events" },
              { to: "/events/sports", label: "Sports Events" },
              { to: "/courses", label: "Courses" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="hover:text-pink-400 transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-500 group-hover:bg-pink-400 transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
            Get in Touch
          </h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 text-pink-400 flex-shrink-0"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/40 hover:to-purple-500/40 border border-pink-500/30 text-pink-300 text-xs font-medium transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Bottom bar */}
      <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>&copy; {year} Ayendah Sazan Community Organisation. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-slate-300 transition-colors">
            About
          </Link>
          <Link to="/contact" className="hover:text-slate-300 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
