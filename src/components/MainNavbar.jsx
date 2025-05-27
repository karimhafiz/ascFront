import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference for the menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false); // Close the menu when a link is clicked
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white/30 backdrop-blur-md shadow-xl z-50 relative rounded-xl border border-white/30">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold hover:opacity-80 text-pink-600 drop-shadow-glow"
        >
          Ayendah Sazan
        </Link>

        {/* Hamburger Menu for Mobile */}
        <button
          className="block md:hidden text-pink-600 focus:outline-none bg-white/40 rounded-lg p-2 shadow hover:scale-105 transition-all"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        {/* Navigation Links */}
        <ul
          ref={menuRef}
          className={`$
            {isMenuOpen ? "block" : "hidden"}
          } md:flex space-y-6 md:space-y-0 md:space-x-8 absolute md:static top-16 left-0 w-full md:w-auto bg-white/30 md:bg-transparent backdrop-blur-md p-4 md:p-0 rounded-xl shadow-xl border border-white/20`}
        >
          <li>
            <Link
              to="/"
              className="hover:underline block md:inline hover:bg-pink-100/60 hover:scale-105 transition-all rounded-xl px-2 py-1 text-pink-700"
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="hover:underline block md:inline hover:bg-purple-100/60 hover:scale-105 transition-all rounded-xl px-2 py-1 text-purple-700"
              onClick={closeMenu}
            >
              About
            </Link>
          </li>
          <li className="relative group" tabIndex={0}>
            <span className="hover:underline block md:inline cursor-pointer focus:outline-none hover:bg-indigo-100/60 hover:scale-105 transition-all rounded-xl px-2 py-1 text-indigo-700">
              Event
              <svg
                className="inline ml-1 w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
              </svg>
            </span>
            <ul
              className="absolute left-0 mt-2 w-40 bg-white/80 backdrop-blur-md text-pink-700 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus:opacity-100 group-focus:pointer-events-auto transition-opacity z-50 border border-white/20"
              onMouseLeave={closeMenu}
            >
              <li>
                <Link
                  to="/events/asc"
                  className="block px-4 py-2 hover:bg-pink-100/60 hover:scale-105 transition-all rounded-xl"
                  onClick={closeMenu}
                >
                  Ayendah Sazan Events
                </Link>
              </li>
              <li>
                <Link
                  to="/events/sports"
                  className="block px-4 py-2 hover:bg-purple-100/60 hover:scale-105 transition-all rounded-xl"
                  onClick={closeMenu}
                >
                  Sports Events
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:underline block md:inline hover:bg-indigo-100/60 hover:scale-105 transition-all rounded-xl px-2 py-1 text-indigo-700"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
