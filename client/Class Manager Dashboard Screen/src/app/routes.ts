import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/attendance",
    Component: Attendance,
  },
]);
