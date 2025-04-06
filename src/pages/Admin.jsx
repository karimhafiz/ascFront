import React from "react";
import {
  Form,
  useActionData,
  useNavigation,
  Navigate,
  redirect,
} from "react-router-dom";

const Admin = () => {
  const data = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const token = localStorage.getItem("token");
  const expiration = localStorage.getItem("expiration");

  // Redirect to /admin if the user is already logged in
  if (token && new Date(expiration) > new Date()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Admin Login
        </h1>
        <Form method="post" action="/admin" className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="input input-bordered w-full"
              required
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary w-full ${
              isSubmitting ? "loading" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </Form>
        {data && data.message && (
          <p className="text-center text-red-500">{data.message}</p>
        )}
      </div>
    </div>
  );
};

export default Admin;

export async function action({ request }) {
  const data = await request.formData();
  const email = data.get("email");
  const password = data.get("password");
  try {
    const response = await fetch("http://localhost:5000/api/admins/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 422 || response.status === 401) {
      return { message: "Invalid email or password." };
    }

    if (!response.ok) {
      throw new Error("Could not authenticate user.");
    }

    // Use .json() to parse the response body
    const resData = await response.json();
    const token = resData.token;
    localStorage.setItem("token", token);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem("expiration", expiration.toISOString());
    return redirect("/admin");
  } catch (error) {
    console.error("Error during login:", error);
    return { message: "An error occurred. Please try again later." };
  }
}
