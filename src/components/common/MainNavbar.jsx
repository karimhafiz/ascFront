import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { isAuthenticated, isAdmin, parseJwt, getAuthToken, clearAuth } from "../../auth/auth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const userCloseTimer = useRef(null);
  const location = useLocation();

  const authenticated = isAuthenticated();
  const admin = isAdmin();

  // Get user email from JWT for the dropdown label
  const userEmail = (() => {
    try {
      const payload = parseJwt(getAuthToken());
      return payload?.email ?? null;
    } catch {
      return null;
    }
  })();

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_DEV_URI}users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // clear local state anyway
    }
    clearAuth();
    navigate("/");
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
      const isMenuToggleButton = event.target.closest('button[aria-label="Toggle menu"]');
      if (menuRef.current && !menuRef.current.contains(event.target) && !isMenuToggleButton) {
        setIsMenuOpen(false);
        setDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const menuClasses = isMenuOpen ? "block" : "hidden";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-xl shadow-lg py-2"
          : "bg-white/75 backdrop-blur-md py-3 lg:py-4"
      }`}
    >
      <div className="flex justify-between items-center px-4 lg:px-4 xl:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
            ASC
          </div>
          <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-700 bg-clip-text text-transparent drop-shadow-sm group-hover:tracking-wider transition-all duration-300  sm:inline">
            Ayendah Sazan
          </span>
        </Link>{" "}
        {/* Hamburger Menu for Mobile */}{" "}
        <button
          className="block lg:hidden text-pink-600 focus:outline-none bg-white/60 hover:bg-pink-100/80 rounded-full p-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling

            if (isMenuOpen) {
              // If menu is open, explicitly close it
              setIsMenuOpen(false);
              setDropdownOpen(false);
              setUserDropdownOpen(false);
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
          className={`${menuClasses} lg:flex lg:items-center space-y-6 lg:space-y-0 lg:space-x-2 xl:space-x-5 absolute lg:static top-full left-0 w-full lg:w-auto bg-white/95 lg:bg-transparent backdrop-blur-xl p-6 lg:p-0 rounded-b-2xl shadow-xl lg:shadow-none border-x border-b border-white/30 lg:border-none transition-all duration-300 animate-fadeIn`}
        >
          <li>
            <Link
              to="/"
              className={`relative group flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full  ${
                isActive("/")
                  ? "bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-700 font-semibold shadow-sm"
                  : "text-pink-600 hover:bg-pink-200/60 hover:shadow-sm"
              } transition-all duration-300`}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
              {isActive("/") && (
                <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></span>
              )}
              <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
            </Link>
          </li>
          <li ref={dropdownRef} className="relative" tabIndex={0}>
            <div
              onClick={toggleDropdown}
              className={`relative flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full cursor-pointer ${
                location.pathname.includes("/events")
                  ? "bg-gradient-to-r from-rose-500/30 to-fuchsia-500/30 text-rose-700 font-semibold shadow-sm"
                  : "text-rose-600 hover:bg-rose-200/60 hover:shadow-sm"
              } transition-all duration-300`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Events
              <svg
                className={`ml-1 w-3.5 h-3.5 transition-transform duration-300 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
              </svg>
              {location.pathname.includes("/events") && (
                <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full"></span>
              )}
            </div>
            <ul
              className={`absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 border border-white/30 overflow-hidden lg:left-1/2 lg:-translate-x-1/2 transition-all duration-300 ${
                dropdownOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <li>
                <Link
                  to="/events/asc"
                  className="flex items-center px-5 py-3 hover:bg-gradient-to-r from-rose-100/60 to-pink-100/60 hover:shadow-inner text-rose-600 hover:text-rose-700 transition-all duration-300"
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
                  className="flex items-center px-5 py-3 hover:bg-gradient-to-r from-fuchsia-100/60 to-purple-100/60 hover:shadow-inner text-fuchsia-600 hover:text-fuchsia-700 transition-all duration-300"
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
              to="/courses"
              className={`relative group flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full ${isActive("/courses") ? "bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 text-fuchsia-700 font-semibold shadow-sm" : "text-fuchsia-600 hover:bg-fuchsia-200/60 hover:shadow-sm"} transition-all duration-300`}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5 mr-1.5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Courses
              {isActive("/courses") && (
                <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full"></span>
              )}
              <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`relative group flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full ${
                isActive("/about")
                  ? "bg-gradient-to-r from-purple-500/30 to-violet-500/30 text-purple-700 font-semibold shadow-sm"
                  : "text-purple-600 hover:bg-purple-200/60 hover:shadow-sm"
              } transition-all duration-300`}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5 mr-1.5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              About
              {isActive("/about") && (
                <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></span>
              )}
              <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`relative group flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full ${
                isActive("/contact")
                  ? "bg-gradient-to-r from-violet-500/30 to-indigo-500/30 text-violet-700 font-semibold shadow-sm"
                  : "text-violet-600 hover:bg-violet-200/60 hover:shadow-sm"
              } transition-all duration-300`}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact
              {isActive("/contact") && (
                <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"></span>
              )}
              <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
            </Link>
          </li>
          {/* authentication links */}
          {!authenticated && (
            <>
              <li>
                <Link
                  to="/login"
                  className={`relative group flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full ${
                    isActive("/login")
                      ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-700 font-semibold shadow-sm"
                      : "text-pink-600 hover:bg-pink-200/60 hover:shadow-sm"
                  } transition-all duration-300`}
                  onClick={closeMenu}
                >
                  Login
                  {isActive("/login") && (
                    <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></span>
                  )}
                  <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className={`relative group flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full ${
                    isActive("/signup")
                      ? "bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-700 font-semibold shadow-sm"
                      : "text-purple-600 hover:bg-purple-200/60 hover:shadow-sm"
                  } transition-all duration-300`}
                  onClick={closeMenu}
                >
                  Sign Up
                  {isActive("/signup") && (
                    <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></span>
                  )}
                  <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
                </Link>
              </li>
            </>
          )}
          {admin && (
            <li>
              <Link
                to="/admin"
                className={`relative group flex items-center px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full ${
                  isActive("/admin")
                    ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-700 font-semibold shadow-sm"
                    : "text-indigo-600 hover:bg-indigo-200/60 hover:shadow-sm"
                } transition-all duration-300`}
                onClick={closeMenu}
              >
                Dashboard
                {isActive("/admin") && (
                  <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                )}
                <span className="hidden lg:block absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full group-hover:w-1/2 transition-all duration-300"></span>
              </Link>
            </li>
          )}
          {/* ── User dropdown ── */}
          {authenticated && (
            <li
              ref={userDropdownRef}
              className="relative"
              onMouseEnter={() => {
                if (window.innerWidth >= 1024) {
                  clearTimeout(userCloseTimer.current);
                  setUserDropdownOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (window.innerWidth >= 1024) {
                  userCloseTimer.current = setTimeout(() => setUserDropdownOpen(false), 150);
                }
              }}
            >
              <div
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-2 lg:py-2 lg:px-4 xl:py-2.5 xl:px-5 text-sm lg:text-sm xl:text-base rounded-full cursor-pointer transition-all duration-300 ${
                  userDropdownOpen
                    ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 shadow-sm"
                    : "hover:bg-indigo-200/60 hover:shadow-sm"
                }`}
              >
                <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm shadow-indigo-200">
                  {userEmail ? userEmail[0].toUpperCase() : "?"}
                </div>
                <span className="text-sm font-medium max-w-[180px] truncate text-indigo-700">
                  {userEmail}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-indigo-500 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
                </svg>
              </div>

              {/* Desktop: absolute dropdown — only rendered when open, hidden below lg */}
              {userDropdownOpen && (
                <div className="hidden lg:block absolute right-0 mt-1 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-indigo-100/60 bg-gradient-to-r from-indigo-50/60 to-purple-50/60">
                    <p className="text-xs font-medium text-indigo-600 truncate">{userEmail}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50/60 hover:to-purple-50/60 hover:text-indigo-700 transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </Link>

                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-100 to-transparent mx-3" />

                  <button
                    onClick={(e) => {
                      handleLogout(e);
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50/60 hover:text-red-600 transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </button>
                </div>
              )}

              {/* Mobile: inline expanded items — only rendered when mobile menu is open */}
              {userDropdownOpen && isMenuOpen && (
                <div className="lg:hidden mt-2 space-y-1 bg-indigo-50/40 rounded-xl p-2 animate-fadeIn">
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-white/60 rounded-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </Link>

                  <button
                    onClick={(e) => {
                      handleLogout(e);
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/60 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
