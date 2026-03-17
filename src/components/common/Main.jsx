import React from "react";
import Navbar from "./MainNavbar";

import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
