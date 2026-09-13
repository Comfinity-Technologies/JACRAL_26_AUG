import type { RouteObject } from "react-router-dom";

import CustomerLayout from "../layouts/CustomerLayout";

import HomePage from "../pages/customer/HomePage";
import ShopPage from "../pages/customer/ShopPage";
import ProductPage from "../pages/customer/ProductPage";
import CartPage from "../pages/customer/CartPage";
import CheckoutPage from "../pages/customer/CheckoutPage";
import LoginPage from "../pages/customer/LoginPage";
import RegisterPage from "../pages/customer/RegisterPage";
import AccountPage from "../pages/customer/AccountPage";
import OrderSuccessPage from "../pages/customer/OrderSuccessPage";
import NotFoundPage from "../pages/customer/NotFoundPage";

export const customerRoutes: RouteObject[] = [
  {
    element: <CustomerLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/shop",
        element: <ShopPage />,
      },
      {
        path: "/product/:id",
        element: <ProductPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/account",
        element: <AccountPage />,
      },
      {
        path: "/order-success",
        element: <OrderSuccessPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];