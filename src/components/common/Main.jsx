import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./MainNavbar";
import Footer from "./Footer";

const NO_FOOTER = ["/login", "/signup"];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function Main() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER.includes(pathname);

  return (
    <div className="professional-shell min-h-[calc(100vh-72px)]">
      <ScrollToTop />
      <Navbar />
      <main className="relative min-h-screen">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
