import React from "react";

export default function ErrorPage({ error }) {
  console.log("Error caught:", error); // Debugging
  return (
    <div>
      <h1>Oops!</h1>
      <p>Something went wrong.</p>
    </div>
  );
}
