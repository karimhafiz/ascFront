import React from "react";
import Navbar from "./MainNavbar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";

const NO_FOOTER = ["/login", "/signup"];

export default function Main() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER.includes(pathname);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
