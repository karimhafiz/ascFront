import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "./App.css";
import Main from "./components/Main";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EventPage from "./pages/Event";
import EventDetails from "./pages/EventDetails";
import NewEvent from "./pages/NewEvent";
import EditEvent from "./pages/EditEvent";
import EventRoot from "./pages/EventRoot";
import ErrorPage from "./pages/Errorpage";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { loginAction, signupAction } from "./auth/authActions";
import { logoutAction, combinedLoader } from "./auth/auth";
import { action as eventAction } from "./components/EventForm";
import CancelPage from "./pages/CancelPage";
import SuccessPage from "./pages/SuccessPage";
import TeamConfirmationPage from "./pages/TeamConfirmationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import SportsPage from "./pages/Sports";
import { eventDetailLoader } from "./util/util";

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
      { path: "success", element: <SuccessPage /> },
      { path: "team-confirmation", element: <TeamConfirmationPage /> },
      { path: "order-confirmation", element: <OrderConfirmation /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
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
              { path: "edit", element: <EditEvent />, action: eventAction },
            ],
          },
          { path: "new", element: <NewEvent />, action: eventAction },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute />,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
        action: loginAction,
      },
      {
        path: "signup",
        element: <Signup />,
        action: signupAction,
      },
      {
        path: "logout",
        action: logoutAction,
      },
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
