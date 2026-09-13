import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminMFASetupPage from "./pages/admin/AdminMFASetupPage";
import AdminExportsPage from "./pages/admin/AdminExportsPage";
import AdminPoliciesPage from "./pages/admin/AdminPoliciesPage";
import AdminLandingPageCMS from "./pages/admin/AdminLandingPageCMS";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";

const router = createBrowserRouter([
  { path: "/login", element: <AdminLoginPage /> },
  { path: "/admin/login", element: <Navigate to="/login" replace /> },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "categories", element: <AdminCategoriesPage /> },
      { path: "analytics", element: <AdminAnalyticsPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "coupons", element: <AdminCouponsPage /> },
      { path: "settings", element: <AdminMFASetupPage /> },
      { path: "exports", element: <AdminExportsPage /> },
      { path: "policies", element: <AdminPoliciesPage /> },
      { path: "landing-page", element: <AdminLandingPageCMS /> },
      { path: "content/landing-page", element: <AdminLandingPageCMS /> },
      { path: "reviews", element: <AdminReviewsPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}