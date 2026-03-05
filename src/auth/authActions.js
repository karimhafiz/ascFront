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

    const resData = await response.json();
    const token = resData.token;
    localStorage.setItem("token", token);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem("expiration", expiration.toISOString());
    // determine role from token payload and redirect accordingly
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "admin") {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      }
    );

    if (response.status === 400) {
      const resp = await response.json();
      return { message: resp.message || "Invalid data." };
    }

    if (!response.ok) {
      throw new Error("Could not sign up user.");
    }

    return redirect("/login");
  } catch (error) {
    console.error("Error during signup:\n", error);
    return { message: "An error occurred. Please try again later." };
  }
}
