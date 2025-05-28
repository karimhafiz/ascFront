import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const menuRef = useRef(null); // Reference for the menu
  const location = useLocation();
  const toggleMenu = () => {
    // Directly set the value rather than toggling to avoid race conditions
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    // Close dropdown when closing the menu
    if (!newMenuState) setMobileDropdownOpen(false);
  };

  const toggleMobileDropdown = (e) => {
    // Only for mobile view
    if (window.innerWidth < 768) {
      e.preventDefault();
      e.stopPropagation();
      setMobileDropdownOpen(!mobileDropdownOpen);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false); // Close the menu when a link is clicked
    setMobileDropdownOpen(false); // Also close any open dropdown
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Add scroll effect for the navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks on the menu toggle button
      const isMenuToggleButton = event.target.closest(
        'button[aria-label="Toggle menu"]'
      );
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !isMenuToggleButton
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const menuClasses = isMenuOpen ? "block" : "hidden";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl shadow-lg py-2"
          : "bg-white/30 backdrop-blur-md py-4"
      } border-b border-white/40`}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
            ASC
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-700 bg-clip-text text-transparent drop-shadow-sm group-hover:tracking-wider transition-all duration-300">
            Ayendah Sazan
          </span>
        </Link>{" "}
        {/* Hamburger Menu for Mobile */}{" "}
        <button
          className="block md:hidden text-pink-600 focus:outline-none bg-white/60 hover:bg-pink-100/80 rounded-full p-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling

            if (isMenuOpen) {
              // If menu is open, explicitly close it
              setIsMenuOpen(false);
              setMobileDropdownOpen(false);
            } else {
              // If menu is closed, open it
              setIsMenuOpen(true);
            }
          }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
          )}
        </button>{" "}
        {/* Navigation Links */}{" "}
        <ul
          ref={menuRef}
          className={`${menuClasses} md:flex space-y-6 md:space-y-0 md:space-x-8 absolute md:static top-16 left-0 w-full md:w-auto bg-white/95 md:bg-transparent backdrop-blur-xl p-6 md:p-0 rounded-b-2xl shadow-xl md:shadow-none border-x border-b border-white/30 md:border-none transition-all duration-300 animate-fadeIn`}
        >
          <li>
            <Link
              to="/"
              className={`relative group flex items-center px-3 py-2 rounded-full ${
                isActive("/")
                  ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-700 font-medium"
                  : "text-pink-600 hover:bg-pink-100/40"
              } transition-all duration-300`}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
              {isActive("/") && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></span>
              )}
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`relative group flex items-center px-3 py-2 rounded-full ${
                isActive("/about")
                  ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 font-medium"
                  : "text-purple-600 hover:bg-purple-100/40"
              } transition-all duration-300`}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              About
              {isActive("/about") && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></span>
              )}
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
            </Link>
          </li>{" "}
          <li
            className={`relative group ${
              mobileDropdownOpen ? "active-mobile-dropdown" : ""
            }`}
            tabIndex={0}
          >
            <div
              onClick={toggleMobileDropdown}
              className={`relative flex items-center px-3 py-2 rounded-full cursor-pointer ${
                location.pathname.includes("/events")
                  ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 font-medium"
                  : "text-indigo-600 hover:bg-indigo-100/40"
              } transition-all duration-300`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Events{" "}
              <svg
                className={`ml-1 w-3.5 h-3.5 transition-transform duration-300 ${
                  mobileDropdownOpen ? "rotate-180" : "group-hover:rotate-180"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
              </svg>
              {location.pathname.includes("/events") && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
              )}
            </div>{" "}
            <ul
              className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl opacity-0 transform -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-300 z-50 border border-white/30 overflow-hidden md:left-1/2 md:-translate-x-1/2"
              onMouseLeave={() => {
                if (window.innerWidth >= 768) closeMenu();
              }}
            >
              <li>
                <Link
                  to="/events/asc"
                  className="flex items-center px-5 py-3 hover:bg-gradient-to-r from-pink-100/60 to-purple-100/60 hover:shadow-inner text-pink-600 hover:text-pink-700 transition-all duration-300"
                  onClick={closeMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Ayendah Sazan Events
                </Link>
              </li>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
              <li>
                <Link
                  to="/events/sports"
                  className="flex items-center px-5 py-3 hover:bg-gradient-to-r from-indigo-100/60 to-blue-100/60 hover:shadow-inner text-indigo-600 hover:text-indigo-700 transition-all duration-300"
                  onClick={closeMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sports Events
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              to="/contact"
              className={`relative group flex items-center px-3 py-2 rounded-full ${
                isActive("/contact")
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 font-medium"
                  : "text-blue-600 hover:bg-blue-100/40"
              } transition-all duration-300`}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact
              {isActive("/contact") && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></span>
              )}
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
