import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Courses } from "./pages/Courses";
import { StudentManagement } from "./pages/StudentManagement";
import { Attendance } from "./pages/Attendance";
import { Settings } from "./pages/Settings";
import { Reports } from "./pages/Reports";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "courses", Component: Courses },
      { path: "students", Component: StudentManagement },
      { path: "attendance", Component: Attendance },
      { path: "settings", Component: Settings },
      { path: "reports", Component: Reports },
    ],
  },
]);