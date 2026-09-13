import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";
import { MapPin, User, Mail, Phone, ShoppingBag, Lock, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, delivery, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── Auth guard ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] px-6 py-20">
        <div className="mx-auto max-w-xl text-center natura-card p-14">
          <Lock size={44} className="mx-auto text-[#E88D36] mb-6" strokeWidth={1.5} />
          <span className="section-eyebrow text-[#E88D36]">Checkout</span>
          <h1
            className="mt-3 text-4xl text-[#2C221E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Login Required
          </h1>
          <p className="text-[#685B55] mb-8">
            Please login to your account before continuing to checkout.
          </p>
          <Link
            to="/login"
            state={{ from: "/checkout" }}
            className="btn-primary rounded-full px-8 py-4 inline-flex"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] px-6 py-20">
        <div className="mx-auto max-w-xl text-center natura-card p-14">
          <ShoppingBag size={44} className="mx-auto text-[#E88D36] mb-6" strokeWidth={1.5} />
          <h1
            className="text-4xl text-[#2C221E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your cart is empty
          </h1>
          <p className="text-[#685B55] mb-8">Add products before checking out.</p>
          <Link to="/shop" className="btn-primary rounded-full px-8 py-4 inline-flex">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      setError("Please complete all delivery details.");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_name: name,
        shipping_email: email,
        shipping_phone: phone,
        shipping_address: `${address}, ${city}, ${state} - ${pincode}`,
        notes: "Placed via JACRAL Web",
      };

      const res = await apiClient.post("/api/v1/orders", orderData);
      localStorage.setItem("jacral_last_order", JSON.stringify(res.data));
      await clearCart();
      navigate("/order-success");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[#E5DCDB] bg-white px-4 py-3 text-sm text-[#2C221E] outline-none transition focus:border-[#E88D36] focus:ring-2 focus:ring-[#E88D36]/12 placeholder-[#A8988E]";
  const labelCls = "block text-xs font-bold uppercase tracking-[0.08em] text-[#685B55] mb-2";

  return (
    <div className="min-h-screen bg-[#FAF6EE] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <span className="section-eyebrow text-[#E88D36]">CHECKOUT</span>
          <h1
            className="mt-3 text-5xl text-[#2C221E] md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Complete Your Order
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── DELIVERY FORM ── */}
          <div className="natura-card p-7 md:p-10">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#F2EBDC]">
              <div className="w-10 h-10 rounded-full bg-[#3B6E4C]/10 flex items-center justify-center text-[#3B6E4C]">
                <MapPin size={18} />
              </div>
              <h2
                className="text-xl font-bold text-[#2C221E]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Delivery Information
              </h2>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelCls}>
                  <User size={11} className="inline mr-1.5 mb-0.5" />Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>
                  <Mail size={11} className="inline mr-1.5 mb-0.5" />Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>
                  <Phone size={11} className="inline mr-1.5 mb-0.5" />Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>
                  <MapPin size={11} className="inline mr-1.5 mb-0.5" />Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="House number, street, locality"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>State</label>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={inputCls}
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Pincode</label>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className={inputCls}
                  placeholder="678001"
                  maxLength={6}
                  required
                />
              </div>
            </div>
          </div>

          {/* ── ORDER SUMMARY ── */}
          <aside className="h-fit rounded-3xl bg-[#2C221E] p-7 text-white">
            <h2 className="text-xl font-bold mb-7">Order Summary</h2>

            {/* Item list */}
            <div className="space-y-4 mb-7 max-h-52 overflow-y-auto pr-1 custom-scroll">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-xl overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      "🌿"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/90 truncate text-xs leading-tight">
                      {item.name}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm flex-shrink-0">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-white/12 pt-5 mb-5">
              <div className="flex justify-between text-sm text-white/65">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-white/65">
                <span>Delivery</span>
                <span className={delivery === 0 ? "text-[#3B6E4C] font-semibold" : ""}>
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t border-white/12 text-lg font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#FFB800] px-6 py-4 font-bold text-[#2C221E] hover:brightness-105 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Placing Order…</>
              ) : (
                <>
                  <Lock size={16} />
                  Place Order Securely
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-white/35 leading-5">
              Your order and payment details are encrypted and secure.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}