
import { createBrowserRouter } from "react-router-dom";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import ChatDemo from "./pages/ChatDemo";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import UserDashboard from "./pages/UserDashboard";
import { DashboardView } from "./components/admin/DashboardView";
import { UsersView } from "./components/admin/UsersView";
import { LawyersView } from "./components/admin/LawyersView";
import { PackagesView } from "./components/admin/PackagesView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard/:userId",
    element: <Dashboard />,
  },
  {
    path: "/user-dashboard",
    element: <UserDashboard />,
  },
  {
    path: "/lawyer-dashboard",
    element: <LawyerDashboard />,
  },
  {
    path: "/chat-demo",
    element: <ChatDemo />,
  },
  {
    path: "/admin",
    element: <Admin />,
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: "users",
        element: <UsersView />,
      },
      {
        path: "lawyers",
        element: <LawyersView />,
      },
      {
        path: "packages",
        element: <PackagesView />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
