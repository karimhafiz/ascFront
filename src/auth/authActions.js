import { redirect } from "react-router-dom";
import { setAuth, clearAuth } from "./auth";

const API = import.meta.env.VITE_DEV_URI;

export async function loginAction({ request }) {
  const data = await request.formData();
  const email = data.get("email");
  const password = data.get("password");
  try {
    const response = await fetch(
      `${import.meta.env.VITE_DEV_URI}users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const resData = await response.json();
      return {
        message: resData.message || "An error occurred. Please try again later.",
        authMethod: resData.authMethod || null,
      };
    }

    const resData = await response.json();
    setAuth(resData.accessToken, resData.user);

    const role = resData.user?.role;
    if (role === "admin" || role === "moderator") {
      return redirect("/admin");
    }
    return redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    return { message: "An error occurred. Please try again later." };
  }
}

export async function googleLogin(tokenId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_DEV_URI}users/google`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tokenId }),
      }
    );

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Google login failed: ${msg}`);
    }

    const resData = await response.json();
    setAuth(resData.accessToken, resData.user);

    const role = resData.user?.role;
    return { role, user: resData.user };
  } catch (err) {
    console.error("Error during google login:", err);
    throw err;
  }
}

export async function signupAction({ request }) {
  const data = await request.formData();
  const name = data.get("name");
  const email = data.get("email");
  const password = data.get("password");
  try {
    const response = await fetch(
      `${import.meta.env.VITE_DEV_URI}users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }
    );

    if (!response.ok) {
      const resData = await response.json();
      return {
        message: resData.message || "An error occurred. Please try again later.",
        authMethod: resData.authMethod || null,
      };
    }

    return redirect("/login");
  } catch (error) {
    console.error("Error during signup:\n", error);
    return { message: "An error occurred. Please try again later." };
  }
}

export async function logoutAction() {
  try {
    await fetch(`${API}users/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // clear local state anyway
  }
  clearAuth();
  return redirect("/");
}
