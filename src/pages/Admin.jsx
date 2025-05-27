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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
      <div
        className="relative w-full max-w-md p-8 md:p-12 rounded-2xl overflow-hidden backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
        style={{ background: "rgba(255, 255, 255, 0.25)" }}
      >
        {/* Decorative glass elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-pink-300/30 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-purple-300/30 blur-3xl"></div>

        <h1 className="text-3xl font-bold text-center text-pink-700 mb-8 relative z-10">
          Admin Portal
        </h1>

        <Form method="post" action="/admin" className="space-y-7 relative z-10">
          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text text-purple-700 font-medium text-lg">
                Email
              </span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="input w-full bg-white/40 border-white/30 backdrop-blur-sm rounded-xl px-5 py-3 focus:border-pink-300 focus:ring focus:ring-pink-200 transition-all"
                required
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text text-purple-700 font-medium text-lg">
                Password
              </span>
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="input w-full bg-white/40 border-white/30 backdrop-blur-sm rounded-xl px-5 py-3 focus:border-pink-300 focus:ring focus:ring-pink-200 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn w-full text-base font-medium py-3 mt-6 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all ${
              isSubmitting ? "opacity-70" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </Form>

        {data && data.message && (
          <div className="mt-6 bg-red-50/70 backdrop-blur-sm border border-red-200 rounded-xl p-4 animate-pulse relative z-10">
            <p className="text-center text-red-500 font-medium">
              {data.message}
            </p>
          </div>
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
    const response = await fetch(
      `${import.meta.env.VITE_DEV_URI}admins/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

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
