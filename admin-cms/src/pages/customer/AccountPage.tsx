import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, Package, LogOut, ShoppingBag, Clock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";

interface Order {
  id: number;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  shipment_id?: string;
  items?: { product_name: string; quantity: number; unit_price: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get("/api/v1/orders");
        setOrders(res.data.items || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FCFAF4] px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <User size={54} className="mx-auto text-[#C98B4A]" />
          <h1 className="mt-6 font-serif text-5xl text-[#17382B]">My Account</h1>
          <p className="mt-4 text-[#718078]">Please login to access your account.</p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-full bg-[#17382B] px-8 py-4 font-semibold text-white"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FCFAF4] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C98B4A]">MY ACCOUNT</p>
            <h1 className="mt-2 font-serif text-4xl text-[#17382B]">Welcome, {user.name}!</h1>
            <p className="mt-1 text-[#718078]">{user.email}</p>
          </div>

          <div className="flex gap-3">
            {(user.role === "admin" || user.role === "manager" || user.role === "staff") && (
              <Link
                to="/admin"
                className="rounded-full bg-[#17382B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#285642] transition"
              >
                Go to Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#17382B] px-5 py-2.5 text-sm font-semibold text-[#17382B] transition hover:bg-[#17382B] hover:text-white"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid gap-5 md:grid-cols-2 mb-10">
          <Link
            to="/shop"
            className="flex items-center gap-4 rounded-2xl border border-[#E5E0D5] bg-white p-6 hover:-translate-y-1 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F1EBDD] flex items-center justify-center">
              <ShoppingBag className="text-[#C98B4A]" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#17382B]">Continue Shopping</h2>
              <p className="text-sm text-[#718078]">Browse our jackfruit & cereal products</p>
            </div>
          </Link>

          <Link
            to="/cart"
            className="flex items-center gap-4 rounded-2xl border border-[#E5E0D5] bg-white p-6 hover:-translate-y-1 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E7EEE6] flex items-center justify-center">
              <Package className="text-[#17382B]" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#17382B]">My Cart</h2>
              <p className="text-sm text-[#718078]">View items ready for checkout</p>
            </div>
          </Link>
        </div>

        {/* Order History */}
        <div className="rounded-3xl border border-[#E5E0D5] bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-7 py-5 border-b border-[#E5E0D5]">
            <Clock className="text-[#C98B4A]" size={20} />
            <h2 className="text-xl font-semibold text-[#17382B]">Order History</h2>
          </div>

          {loadingOrders ? (
            <p className="px-7 py-8 text-[#718078]">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="px-7 py-10 text-center">
              <Package size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <Link
                to="/shop"
                className="mt-4 inline-block rounded-full bg-[#17382B] px-6 py-3 text-sm font-semibold text-white"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E0D5]">
              {orders.map((order) => (
                <div key={order.id} className="px-7 py-5 flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#17382B]">Order #{order.id}</p>
                      <p className="text-sm text-[#718078] mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                          STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="font-bold text-[#17382B]">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  
                  {order.shipment_id && (
                    <div className="w-full mt-2 pt-3 border-t border-[#E5E0D5] flex justify-end">
                      <a 
                        href={`https://shiprocket.co/tracking/${order.shipment_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#C98B4A] hover:text-[#b0783f] flex items-center gap-1"
                      >
                        <Package size={14} />
                        Track Shipment: {order.shipment_id}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}