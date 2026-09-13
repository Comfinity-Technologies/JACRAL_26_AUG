import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminIntegrationsPage from "./pages/admin/AdminIntegrationsPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminMFASetupPage from "./pages/admin/AdminMFASetupPage";

const router = createBrowserRouter([
  { path: "/login", element: <AdminLoginPage /> },
  { path: "/admin/login", element: <Navigate to="/login" replace /> },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "analytics", element: <AdminAnalyticsPage /> },
      { path: "clients", element: <AdminClientsPage /> },
      { path: "integrations", element: <AdminIntegrationsPage /> },
      { path: "services", element: <AdminServicesPage /> },
      { path: "security", element: <AdminSecurityPage /> },
      { path: "audit-logs", element: <AdminAuditLogsPage /> },
      { path: "settings", element: <AdminMFASetupPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}