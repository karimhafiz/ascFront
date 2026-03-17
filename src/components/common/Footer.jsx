import React from "react";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 text-white text-center p-4 mt-10">
      <p>&copy; {new Date().getFullYear()} Ayendah Sazan. All rights reserved.</p>
    </footer>
  );
}
