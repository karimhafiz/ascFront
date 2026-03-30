import { redirect } from "react-router-dom";
import { getAuthToken } from "../auth/auth";
import { compressImage } from "../util/compressImage";
import { slugToId } from "../util/util";

export async function courseAction({ request, params }) {
  const method = request.method.toUpperCase();
  const formData = await request.formData();

  const courseData = {
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    instructor: formData.get("instructor"),
    category: formData.get("category"),
    schedule: formData.get("schedule"),
    price: parseFloat(formData.get("price")) || 0,
    maxEnrollment: formData.get("maxEnrollment")
      ? parseInt(formData.get("maxEnrollment"))
      : undefined,
    street: formData.get("street"),
    city: formData.get("city"),
    postCode: formData.get("postCode"),
    enrollmentOpen: formData.get("enrollmentOpen") === "true",
    isSubscription: formData.get("billingType") !== "one-time",
    billingInterval:
      formData.get("billingType") !== "one-time" ? formData.get("billingType") : "month",
    featured: formData.get("featured") === "true",
  };

  const token = getAuthToken();
  const body = new FormData();
  body.append("courseData", JSON.stringify(courseData));
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const compressed = await compressImage(imageFile);
    body.append("image", compressed);
  }

  const courseId = params.courseSlug ? slugToId(params.courseSlug) : null;
  const url = courseId
    ? `${import.meta.env.VITE_DEV_URI}courses/${courseId}`
    : `${import.meta.env.VITE_DEV_URI}courses`;

  try {
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok)
      return { errors: { message: resData.error || resData.message || "Unknown error" } };
    return redirect("/courses");
  } catch (err) {
    return { errors: { message: err.message } };
  }
}
