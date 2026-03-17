import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "./App.css";
import Main from "./components/common/Main";
import Home from "./pages/content/Home";
import About from "./pages/content/About";
import Contact from "./pages/content/Contact";
import EventPage from "./pages/events/Event";
import EventDetails from "./pages/events/EventDetails";
import NewEvent from "./pages/events/NewEvent";
import EditEvent from "./pages/events/EditEvent";
import EventRoot from "./pages/events/EventRoot";
import ErrorPage from "./pages/Errorpage";
import OrderConfirmation from "./pages/payments/OrderConfirmation";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { loginAction, signupAction, logoutAction } from "./auth/authActions";
import { combinedLoader, eventDetailLoader } from "./loaders/loaders";
import { eventAction } from "./api/eventActions";
import CancelPage from "./pages/payments/CancelPage";
import TeamConfirmationPage from "./pages/teams/TeamConfirmationPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ModeratorRoute from "./components/common/ModeratorRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SportsPage from "./pages/content/Sports";
import ProfilePage from "./pages/ProfilePage";
import TicketPage from "./pages/tickets/TicketPage";
import TicketVerify from "./pages/tickets/TicketVerify";
import { courseAction } from "./api/courseActions";
import CoursesPage from "./pages/courses/Courses";
import CourseConfirmation from "./pages/courses/CourseConfirmation";
import CourseDetails from "./pages/courses/CourseDetails";
import CourseFormPage from "./pages/courses/CourseFormPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    id: "root",
    loader: combinedLoader,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "cancel", element: <CancelPage /> },
      { path: "team-confirmation", element: <TeamConfirmationPage /> },
      { path: "order-confirmation", element: <OrderConfirmation /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "tickets/:ticketId", element: <TicketPage /> },
      { path: "tickets/verify/:ticketCode", element: <TicketVerify /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:courseId", element: <CourseDetails /> },
      {
        element: <ModeratorRoute />,
        children: [
          { path: "courses/new", element: <CourseFormPage />, action: courseAction },
          { path: "courses/:courseId/edit", element: <CourseFormPage />, action: courseAction },
        ],
      },
      { path: "course-confirmation", element: <CourseConfirmation /> },
      {
        path: "events",
        element: <EventRoot />,
        children: [
          { index: true, element: <EventPage /> },
          { path: "asc", element: <EventPage /> },
          { path: "sports", element: <SportsPage /> },
          {
            path: ":eventId",
            id: "event-detail",
            loader: eventDetailLoader,
            children: [
              { index: true, element: <EventDetails /> },
              {
                element: <ModeratorRoute />,
                children: [{ path: "edit", element: <EditEvent />, action: eventAction }],
              },
            ],
          },
          {
            element: <ModeratorRoute />,
            children: [{ path: "new", element: <NewEvent />, action: eventAction }],
          },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute />,
        errorElement: <ErrorPage />,
        children: [{ index: true, element: <AdminDashboard /> }],
      },
      { path: "login", element: <Login />, action: loginAction },
      { path: "signup", element: <Signup />, action: signupAction },
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
