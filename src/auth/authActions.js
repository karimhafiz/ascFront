import { redirect } from "react-router-dom";

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
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const resData = await response.json();
      return { message: resData.message || "An error occurred. Please try again later." };
    }

    const resData = await response.json();
    const token = resData.token;
    localStorage.setItem("token", token);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem("expiration", expiration.toISOString());

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "admin" || payload.role === "moderator") {
        return redirect("/admin");
      }
    } catch (err) {
      console.error("Error parsing token payload:", err);
    }
    return redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    return { message: "An error occurred. Please try again later." };
  }
}

// helper used by non-form code (eg. OAuth callback) to perform a login
export async function googleLogin(tokenId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_DEV_URI}users/google`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      }
    );

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Google login failed: ${msg}`);
    }

    const resData = await response.json();
    const token = resData.token;
    const user = resData.user || null;
    localStorage.setItem("token", token);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem("expiration", expiration.toISOString());
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    let role = null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role;
    } catch (err) {
      console.error("Error parsing token payload:", err);
    }

    return { token, role, user };
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
      return { message: resData.message || "An error occurred. Please try again later." };
    }

    return redirect("/login");
  } catch (error) {
    console.error("Error during signup:\n", error);
    return { message: "An error occurred. Please try again later." };
  }
}