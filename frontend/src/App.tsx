import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import CustomerLayout from "./layouts/CustomerLayout";
import HomePage from "./pages/customer/HomePage";
import ShopPage from "./pages/customer/ShopPage";
import ProductPage from "./pages/customer/ProductPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import LoginPage from "./pages/customer/LoginPage";
import RegisterPage from "./pages/customer/RegisterPage";
import AccountPage from "./pages/customer/AccountPage";
import OrderSuccessPage from "./pages/customer/OrderSuccessPage";
import NotFoundPage from "./pages/customer/NotFoundPage";
import PolicyPage from "./pages/customer/PolicyPage";
import InvoicePage from "./pages/customer/InvoicePage";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";
import AdminMFASetupPage from "./pages/admin/AdminMFASetupPage";
import AdminLandingPageCMS from "./pages/admin/AdminLandingPageCMS";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminPermissionsPage from "./pages/admin/AdminPermissionsPage";

const router = createBrowserRouter([
  // Customer routes
  {
    element: <CustomerLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/product/:id", element: <ProductPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/account", element: <AccountPage /> },
      { path: "/order-success", element: <OrderSuccessPage /> },
      { path: "/invoice/:orderId", element: <InvoicePage /> },
      { path: "/policy/:slug", element: <PolicyPage /> },
    ],
  },
  
  // Admin Login (No Layout)
  { path: "/admin/login", element: <AdminLoginPage /> },
  
  // Admin Routes (With Layout)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "categories", element: <AdminCategoriesPage /> },
      { path: "analytics", element: <AdminAnalyticsPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "coupons", element: <AdminCouponsPage /> },
      { path: "reviews", element: <AdminReviewsPage /> },
      { path: "content/landing-page", element: <AdminLandingPageCMS /> },
      { path: "settings", element: <AdminMFASetupPage /> },
      { path: "permissions", element: <AdminPermissionsPage /> },
    ],
  },

  // Fallback
  { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}