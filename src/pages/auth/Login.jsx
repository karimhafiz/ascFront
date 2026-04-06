import React from "react";
import { Form, useActionData, useNavigation, Navigate, Link } from "react-router-dom";
import { isAuthenticated } from "../../auth/auth";
import GoogleLogin from "../../components/auth/GoogleLogin";

const Login = () => {
  const data = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const isGoogleConflict = data?.authMethod === "google";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-8">
      <div
        className="relative w-full max-w-md p-8 md:p-12 rounded-2xl overflow-hidden backdrop-blur-xl border border-base-300/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        style={{ background: "rgba(255, 255, 255, 0.35)" }}
      >
        {/* Decorative glass elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-secondary/10 blur-3xl"></div>

        <h1 className="text-3xl font-bold text-center text-base-content mb-8 relative z-10">
          Login
        </h1>

        <Form method="post" action="/login" className="space-y-7 relative z-10">
          <div className="form-control">
            <label className="label mb-1">
              <span className="glass-label text-lg">Email</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="glass-input py-3"
                required
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label mb-1">
              <span className="glass-label text-lg">Password</span>
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="glass-input py-3"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn w-full text-base font-medium py-3 mt-6 rounded-xl btn-primary border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all ${
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
              "Login"
            )}
          </button>
        </Form>

        {data && data.message && (
          <div
            className={`mt-6 backdrop-blur-sm border rounded-xl p-4 relative z-10 ${
              isGoogleConflict
                ? "bg-blue-50/70 border-blue-200"
                : "bg-red-50/70 border-red-200 animate-pulse"
            }`}
          >
            <p
              className={`text-center font-medium ${
                isGoogleConflict ? "text-blue-600" : "text-red-500"
              }`}
            >
              {data.message}
            </p>
            {isGoogleConflict && (
              <p className="text-center text-sm text-blue-400 mt-1">
                Use the Google button below to sign in
              </p>
            )}
          </div>
        )}

        <div className="relative z-10">
          <p className="text-center text-base-content/70 mt-4">or</p>
          <GoogleLogin />
          <p className="text-center text-sm text-base-content/50 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:text-secondary transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
