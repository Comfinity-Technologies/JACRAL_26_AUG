import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  User, Package, LogOut, ShoppingBag, Clock, ArrowRight, CheckCircle2
} from "lucide-react";
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

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  processing: { label: "Processing", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped:    { label: "Shipped",    cls: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered:  { label: "Delivered",  cls: "bg-[#3B6E4C]/10 text-[#3B6E4C] border-[#3B6E4C]/20" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-50 text-red-700 border-red-200" },
};

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await apiClient.get("/api/v1/orders");
        setOrders(res.data.items || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, [isAuthenticated]);

  /* ── Login gate ── */
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] px-6 py-20">
        <div className="mx-auto max-w-md text-center natura-card p-14">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#E88D36]/12 flex items-center justify-center mb-6">
            <User size={30} className="text-[#E88D36]" strokeWidth={1.5} />
          </div>
          <h1
            className="text-4xl text-[#2C221E] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Account
          </h1>
          <p className="text-[#685B55] mb-8">Please login to access your account.</p>
          <Link to="/login" className="btn-primary rounded-full px-8 py-4 inline-flex">
            Login <ArrowRight size={16} />
          </Link>
          <p className="mt-4 text-sm text-[#685B55]">
            New here?{" "}
            <Link to="/register" className="text-[#3B6E4C] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <span className="section-eyebrow text-[#E88D36]">MY ACCOUNT</span>
            <h1
              className="mt-2 text-4xl text-[#2C221E]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="mt-1 text-sm text-[#685B55]">{user.email}</p>
          </div>

          <button
            onClick={handleLogout}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#E5DCDB] bg-white px-5 py-2.5 text-sm font-semibold text-[#685B55] hover:border-red-300 hover:text-red-600 transition shadow-sm self-start md:self-auto"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          <Link
            to="/shop"
            className="natura-card flex items-center gap-4 p-6 hover:border-[#3B6E4C]/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E88D36]/12 flex items-center justify-center text-[#E88D36] flex-shrink-0">
              <ShoppingBag size={22} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-[#2C221E]">Continue Shopping</h2>
              <p className="text-xs text-[#685B55] mt-0.5">Browse jackfruit & cereal products</p>
            </div>
            <ArrowRight size={18} className="text-[#A8988E]" />
          </Link>

          <Link
            to="/cart"
            className="natura-card flex items-center gap-4 p-6 hover:border-[#3B6E4C]/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#3B6E4C]/10 flex items-center justify-center text-[#3B6E4C] flex-shrink-0">
              <Package size={22} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-[#2C221E]">My Cart</h2>
              <p className="text-xs text-[#685B55] mt-0.5">View items ready for checkout</p>
            </div>
            <ArrowRight size={18} className="text-[#A8988E]" />
          </Link>
        </div>

        {/* ── ORDER HISTORY ── */}
        <div className="natura-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[#F2EBDC]">
            <Clock className="text-[#E88D36]" size={20} strokeWidth={1.8} />
            <h2
              className="text-xl font-bold text-[#2C221E]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Order History
            </h2>
            {orders.length > 0 && (
              <span className="ml-auto text-xs font-bold text-[#685B55] bg-[#FAF6EE] border border-[#E5DCDB] px-3 py-1 rounded-full">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loadingOrders ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-2xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Package size={40} className="mx-auto text-[#D4C8C6] mb-4" strokeWidth={1.5} />
              <p className="text-[#685B55] font-medium mb-2">No orders yet</p>
              <p className="text-sm text-[#A8988E] mb-6">
                You haven't placed any orders. Start shopping!
              </p>
              <Link
                to="/shop"
                className="btn-primary rounded-full px-6 py-3 inline-flex"
              >
                Start Shopping <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F2EBDC]">
              {orders.map((order) => {
                const statusCfg =
                  STATUS_CONFIG[order.status?.toLowerCase()] ?? {
                    label: order.status,
                    cls: "bg-gray-50 text-gray-600 border-gray-200",
                  };

                return (
                  <div key={order.id} className="px-6 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#2C221E]">Order #{order.id}</p>
                        <p className="text-xs text-[#685B55] mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${statusCfg.cls}`}
                        >
                          {statusCfg.label}
                        </span>
                        {order.payment_status && (
                          <span className={`text-xs font-semibold flex items-center gap-1 ${
                            order.payment_status.toLowerCase() === "paid"
                              ? "text-[#3B6E4C]"
                              : "text-[#685B55]"
                          }`}>
                            {order.payment_status.toLowerCase() === "paid" && (
                              <CheckCircle2 size={13} />
                            )}
                            {order.payment_status}
                          </span>
                        )}
                        <p className="font-bold text-[#2C221E]">
                          ₹{Number(order.total_amount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {order.shipment_id && (
                      <div className="mt-3 pt-3 border-t border-[#F2EBDC] flex justify-end gap-4">
                        <Link
                          to={`/invoice/${order.id}`}
                          className="text-xs font-semibold text-[#3B6E4C] hover:text-[#2c5239] flex items-center gap-1.5 transition"
                        >
                          <Package size={13} />
                          Invoice
                        </Link>
                        <a
                          href={`https://shiprocket.co/tracking/${order.shipment_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#E88D36] hover:text-[#D47E2A] flex items-center gap-1.5 transition"
                        >
                          <Package size={13} />
                          Track: {order.shipment_id}
                        </a>
                      </div>
                    )}
                    {!order.shipment_id && (
                      <div className="mt-3 pt-3 border-t border-[#F2EBDC] flex justify-end">
                        <Link
                          to={`/invoice/${order.id}`}
                          className="text-xs font-semibold text-[#3B6E4C] hover:text-[#2c5239] flex items-center gap-1.5 transition"
                        >
                          <Package size={13} />
                          Invoice
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}