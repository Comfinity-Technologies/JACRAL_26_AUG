import { Link } from "react-router-dom";
import { CheckCircle2, Package, Home, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jacral_last_order");
    if (stored) {
      try {
        setOrder(JSON.parse(stored));
      } catch {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EE] px-6 py-16 flex items-center justify-center">
      <div className="mx-auto max-w-xl w-full">

        {/* Success card */}
        <div className="natura-card p-10 md:p-14 text-center">

          {/* Animated success icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-[#3B6E4C]/12 flex items-center justify-center mb-6 fade-up-1">
            <CheckCircle2
              size={44}
              className="text-[#3B6E4C]"
              strokeWidth={1.5}
            />
          </div>

          <span className="section-eyebrow text-[#3B6E4C] fade-up-2">
            Order Confirmed
          </span>

          <h1
            className="mt-3 text-4xl md:text-5xl text-[#2C221E] mb-4 fade-up-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Thank You! 🎉
          </h1>

          <p className="text-[#685B55] text-base leading-relaxed mb-8 fade-up-4">
            Your order has been placed successfully. You'll receive a
            confirmation email shortly with your order details.
          </p>

          {/* Order number */}
          {order?.id && (
            <div className="fade-up-4 inline-flex items-center gap-2.5 rounded-2xl bg-[#3B6E4C]/8 border border-[#3B6E4C]/20 px-6 py-3 mb-8">
              <Package size={18} className="text-[#3B6E4C]" />
              <div className="text-left">
                <p className="text-[0.72rem] font-bold uppercase tracking-wider text-[#685B55]">Order ID</p>
                <p className="font-bold text-[#2C221E]">#{order.id}</p>
              </div>
            </div>
          )}

          {/* Order summary snippet */}
          {order?.total_amount && (
            <div className="fade-up-5 rounded-2xl bg-[#FAF6EE] border border-[#E5DCDB] p-5 mb-8 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#685B55]">Order Total</span>
                <span className="font-bold text-[#2C221E]">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </span>
              </div>
              {order.status && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-[#685B55]">Status</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3B6E4C] bg-[#3B6E4C]/10 px-3 py-1 rounded-full capitalize">
                    {order.status}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="fade-up-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/account" className="btn-primary rounded-full px-7 py-3.5">
              View My Orders <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn-outline rounded-full px-7 py-3.5">
              <Home size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Reassurance strip */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-[#685B55]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#3B6E4C]" /> Free shipping on ₹999+
          </span>
          <span className="hidden sm:block opacity-30">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#3B6E4C]" /> 100% Natural Products
          </span>
          <span className="hidden sm:block opacity-30">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#3B6E4C]" /> Secure Checkout
          </span>
        </div>
      </div>
    </div>
  );
}