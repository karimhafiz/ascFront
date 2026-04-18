import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getAuthToken, isAdmin, isAuthenticated, parseJwt } from "../../auth/auth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const userDropdownRef = useRef(null);
  const userCloseTimer = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const authenticated = isAuthenticated();
  const admin = isAdmin();

  const userEmail = (() => {
    try {
      const payload = parseJwt(getAuthToken());
      return payload?.email ?? null;
    } catch {
      return null;
    }
  })();

  const closeMenu = () => {
    setIsMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_DEV_URI}users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Clear local auth state even if the network request fails.
    }
    clearAuth();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isMenuToggleButton = event.target.closest('button[aria-label="Toggle menu"]');
      if (menuRef.current && !menuRef.current.contains(event.target) && !isMenuToggleButton) {
        setIsMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuClasses = isMenuOpen ? "block" : "hidden";

  const linkClass = (active) =>
    `relative group flex items-center rounded-full px-3 py-2 text-sm transition-all duration-300 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 xl:text-base ${
      active
        ? "bg-primary/10 text-primary shadow-sm shadow-primary/10 font-semibold"
        : "text-base-content/72 hover:bg-base-200/80 hover:text-base-content hover:shadow-sm"
    }`;

  const indicator = (active) => (
    <>
      {active && (
        <span className="absolute bottom-0.5 left-1/2 hidden h-0.5 w-1/2 -translate-x-1/2 rounded-full bg-secondary lg:block" />
      )}
      <span className="absolute bottom-0.5 left-1/2 hidden h-0.5 w-0 -translate-x-1/2 rounded-full bg-secondary transition-all duration-300 group-hover:w-1/2 lg:block" />
    </>
  );

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/60 bg-white/88 py-2 shadow-[0_18px_50px_-30px_rgba(16,38,58,0.5)] backdrop-blur-2xl"
          : "border-b border-transparent bg-white/60 py-3 backdrop-blur-xl lg:py-4"
      }`}
    >
      <div className="page-section flex items-center justify-between px-4 lg:px-4 xl:px-6">
        <Link to="/" className="group flex shrink-0 items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary via-primary to-primary/90 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
            ASC
          </div>
          <span className="text-lg font-semibold tracking-[0.06em] text-base-content transition-colors duration-300 group-hover:text-primary lg:text-xl">
            Ayendah Sazan
          </span>
        </Link>

        <button
          className="block cursor-pointer rounded-full border border-base-300/80 bg-white/80 p-2 text-base-content/70 shadow-md transition-all duration-300 hover:bg-white hover:shadow-lg focus:outline-none lg:hidden"
          onClick={(e) => {
            e.stopPropagation();
            if (isMenuOpen) {
              setIsMenuOpen(false);
              setUserDropdownOpen(false);
            } else {
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
              className="h-6 w-6"
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
              />
            </svg>
          )}
        </button>

        <ul
          ref={menuRef}
          className={`${menuClasses} absolute left-0 top-full w-full space-y-6 rounded-b-3xl border-x border-b border-white/50 bg-white/95 p-6 shadow-[0_20px_50px_-30px_rgba(16,38,58,0.6)] backdrop-blur-2xl transition-all duration-300 animate-fadeIn lg:static lg:flex lg:w-auto lg:items-center lg:space-x-2 lg:space-y-0 lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none xl:space-x-5`}
        >
          <li>
            <Link to="/" className={linkClass(isActive("/"))} onClick={closeMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-4 w-4 xl:h-5 xl:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
              {indicator(isActive("/"))}
            </Link>
          </li>
          <li>
            <Link
              to="/events"
              className={linkClass(location.pathname.includes("/events"))}
              onClick={closeMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-4 w-4 xl:h-5 xl:w-5"
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
              {indicator(location.pathname.includes("/events"))}
            </Link>
          </li>
          <li>
            <Link to="/courses" className={linkClass(isActive("/courses"))} onClick={closeMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-4 w-4 shrink-0 xl:h-5 xl:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Courses
              {indicator(isActive("/courses"))}
            </Link>
          </li>
          <li>
            <Link to="/about" className={linkClass(isActive("/about"))} onClick={closeMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-4 w-4 shrink-0 xl:h-5 xl:w-5"
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
              {indicator(isActive("/about"))}
            </Link>
          </li>
          <li>
            <Link to="/contact" className={linkClass(isActive("/contact"))} onClick={closeMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-4 w-4 xl:h-5 xl:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact
              {indicator(isActive("/contact"))}
            </Link>
          </li>
          {!authenticated && (
            <>
              <li>
                <Link to="/login" className={linkClass(isActive("/login"))} onClick={closeMenu}>
                  Login
                  {indicator(isActive("/login"))}
                </Link>
              </li>
              <li>
                <Link to="/signup" className={linkClass(isActive("/signup"))} onClick={closeMenu}>
                  Sign Up
                  {indicator(isActive("/signup"))}
                </Link>
              </li>
            </>
          )}
          {admin && (
            <li>
              <Link to="/admin" className={linkClass(isActive("/admin"))} onClick={closeMenu}>
                Dashboard
                {indicator(isActive("/admin"))}
              </Link>
            </li>
          )}
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
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setUserDropdownOpen((prev) => !prev);
                  }
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm transition-all duration-300 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 xl:text-base ${
                  userDropdownOpen
                    ? "bg-primary/10 shadow-sm shadow-primary/10"
                    : "hover:bg-base-200/80 hover:shadow-sm"
                }`}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-xs font-bold text-white shadow-sm shadow-primary/20 xl:h-8 xl:w-8">
                  {userEmail ? userEmail[0].toUpperCase() : "?"}
                </div>
                <span className="max-w-[180px] truncate text-sm font-medium text-base-content">
                  {userEmail}
                </span>
                <svg
                  className={`h-3.5 w-3.5 text-base-content/50 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
                </svg>
              </div>

              {userDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 hidden w-56 overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-[0_30px_60px_-35px_rgba(16,38,58,0.7)] backdrop-blur-2xl animate-fadeIn lg:block">
                  <div className="border-b border-base-300/60 bg-base-200/60 px-4 py-3">
                    <p className="truncate text-xs font-medium text-base-content/70">{userEmail}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-base-content/72 transition-all duration-200 hover:bg-base-200/60 hover:text-primary"
                  >
                    <svg
                      className="h-4 w-4 text-base-content/50"
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

                  <div className="mx-3 h-px bg-gradient-to-r from-transparent via-base-300 to-transparent" />

                  <button
                    onClick={(e) => {
                      handleLogout(e);
                      closeMenu();
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-red-500 transition-all duration-200 hover:bg-red-50/70 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {userDropdownOpen && isMenuOpen && (
                <div className="mt-2 space-y-1 rounded-2xl bg-base-200/50 p-2 animate-fadeIn lg:hidden">
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-base-content/72 transition-all duration-200 hover:bg-white/70"
                  >
                    <svg
                      className="h-4 w-4 text-base-content/50"
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
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-500 transition-all duration-200 hover:bg-red-50/70"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
