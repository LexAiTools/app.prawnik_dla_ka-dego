
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import ChatDemo from "./pages/ChatDemo";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/index",
    element: <Index />,
  },
  {
    path: "/chat-demo",
    element: <ChatDemo />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
