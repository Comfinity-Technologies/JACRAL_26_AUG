import type { RouteObject } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminCouponsPage from "../pages/admin/AdminCouponsPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "", element: <DashboardPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "categories", element: <AdminCategoriesPage /> },
      { path: "analytics", element: <AdminAnalyticsPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "coupons", element: <AdminCouponsPage /> },
    ],
  },
];
