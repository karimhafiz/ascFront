import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./MainNavbar";
import Footer from "./Footer";

const NO_FOOTER = ["/login", "/signup"];

export default function Main() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER.includes(pathname);

  return (
    <div className="professional-shell min-h-[calc(100vh-72px)]">
      <Navbar />
      <main className="relative">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
