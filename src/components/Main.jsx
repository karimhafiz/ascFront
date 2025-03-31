import Navbar from "./MainNavbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
