import { lazy, Suspense, createElement } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "./App.css";
import Main from "./components/common/Main";
import ErrorPage from "./pages/Errorpage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ModeratorRoute from "./components/common/ModeratorRoute";
import { loginAction, signupAction, logoutAction } from "./auth/authActions";
import { combinedLoader, eventDetailLoader } from "./loaders/loaders";
import { eventAction } from "./api/eventActions";
import { courseAction } from "./api/courseActions";

const Home = lazy(() => import("./pages/content/Home"));
const About = lazy(() => import("./pages/content/About"));
const Contact = lazy(() => import("./pages/content/Contact"));
const EventPage = lazy(() => import("./pages/events/Event"));
const EventDetails = lazy(() => import("./pages/events/EventDetails"));
const NewEvent = lazy(() => import("./pages/events/NewEvent"));
const EditEvent = lazy(() => import("./pages/events/EditEvent"));
const EventRoot = lazy(() => import("./pages/events/EventRoot"));
const OrderConfirmation = lazy(() => import("./pages/payments/OrderConfirmation"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const CancelPage = lazy(() => import("./pages/payments/CancelPage"));
const TeamConfirmationPage = lazy(() => import("./pages/teams/TeamConfirmationPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SportsPage = lazy(() => import("./pages/content/Sports"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TicketPage = lazy(() => import("./pages/tickets/TicketPage"));
const TicketVerify = lazy(() => import("./pages/tickets/TicketVerify"));
const CoursesPage = lazy(() => import("./pages/courses/Courses"));
const CourseConfirmation = lazy(() => import("./pages/courses/CourseConfirmation"));
const CourseDetails = lazy(() => import("./pages/courses/CourseDetails"));
const CourseFormPage = lazy(() => import("./pages/courses/CourseFormPage"));

const fallback = (
  <div className="flex justify-center items-center p-12">
    <span className="loading loading-spinner loading-lg" />
  </div>
);

const w = (C) => <Suspense fallback={fallback}>{createElement(C)}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    id: "root",
    loader: combinedLoader,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: w(Home) },
      { path: "cancel", element: w(CancelPage) },
      { path: "team-confirmation", element: w(TeamConfirmationPage) },
      { path: "order-confirmation", element: w(OrderConfirmation) },
      { path: "about", element: w(About) },
      { path: "contact", element: w(Contact) },
      { path: "profile", element: w(ProfilePage) },
      { path: "tickets/:ticketCode", element: w(TicketPage) },
      { path: "tickets/verify/:ticketCode", element: w(TicketVerify) },
      { path: "courses", element: w(CoursesPage) },
      { path: "courses/:courseSlug", element: w(CourseDetails) },
      {
        element: <ModeratorRoute />,
        children: [
          { path: "courses/new", element: w(CourseFormPage), action: courseAction },
          { path: "courses/:courseSlug/edit", element: w(CourseFormPage), action: courseAction },
        ],
      },
      { path: "course-confirmation", element: w(CourseConfirmation) },
      {
        path: "events",
        element: w(EventRoot),
        children: [
          { index: true, element: w(EventPage) },
          { path: "asc", element: w(EventPage) },
          { path: "sports", element: w(SportsPage) },
          {
            path: ":eventSlug",
            id: "event-detail",
            loader: eventDetailLoader,
            children: [
              { index: true, element: w(EventDetails) },
              {
                element: <ModeratorRoute />,
                children: [{ path: "edit", element: w(EditEvent), action: eventAction }],
              },
            ],
          },
          {
            element: <ModeratorRoute />,
            children: [{ path: "new", element: w(NewEvent), action: eventAction }],
          },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute />,
        errorElement: <ErrorPage />,
        children: [{ index: true, element: w(AdminDashboard) }],
      },
      { path: "login", element: w(Login), action: loginAction },
      { path: "signup", element: w(Signup), action: signupAction },
      { path: "logout", action: logoutAction },
    ],
  },
]);

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
