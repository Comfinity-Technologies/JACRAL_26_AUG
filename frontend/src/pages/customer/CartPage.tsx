import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { getImageUrl } from "../../utils/image";

export default function CartPage() {
  const {
    items,
    subtotal,
    delivery,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center px-6 py-20">
        <style>{`
          @keyframes float-bag {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          .float-anim { animation: float-bag 3s ease-in-out infinite; }
        `}</style>

        {/* Floating bag */}
        <div className="float-anim mb-8">
          <div className="w-28 h-28 rounded-full bg-[#E88D36]/10 flex items-center justify-center">
            <ShoppingBag size={52} strokeWidth={1.3} className="text-[#E88D36]" />
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E88D36] mb-3">YOUR BAG</p>
        <h1 className="text-5xl sm:text-6xl text-[#2C221E] mb-4 text-center" style={{ fontFamily: "var(--font-display)" }}>
          Your Cart is Empty
        </h1>
        <p className="text-[#685B55] mb-10 text-center max-w-sm">
          Looks like you haven't added anything yet. Explore our wholesome jackfruit products!
        </p>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-[#3B6E4C] px-8 py-4 font-semibold text-white transition hover:bg-[#2E583C] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Browse Products <ArrowRight size={18} />
        </Link>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-[#685B55] text-xs font-semibold">
          <div className="flex items-center gap-2"><Truck size={16} className="text-[#3B6E4C]" /> Free Delivery on ₹499+</div>
          <div className="flex items-center gap-2"><Shield size={16} className="text-[#3B6E4C]" /> Secure Checkout</div>
          <div className="flex items-center gap-2"><RotateCcw size={16} className="text-[#3B6E4C]" /> Easy Returns</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] px-4 sm:px-6 py-10 sm:py-14">
      <style>{`
        @keyframes slideInItem {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .cart-item-enter { animation: slideInItem 0.4s ease both; }
      `}</style>

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E88D36]">YOUR BAG</p>
          <h1 className="mt-2 text-4xl sm:text-6xl text-[#2C221E]" style={{ fontFamily: "var(--font-display)" }}>
            Your Cart
          </h1>
          <p className="mt-1 text-[#685B55] text-sm">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* ITEMS LIST */}
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="cart-item-enter bg-white rounded-2xl sm:rounded-3xl border border-[#E5DCDB] p-5 sm:p-6 flex gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Image */}
                <div className="h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#F2EBDC] to-[#E9E1D0] flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl opacity-40">🌿</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#E88D36] mb-0.5">{item.category}</p>
                  <h3 className="text-base sm:text-lg font-bold text-[#2C221E] leading-tight truncate pr-2">{item.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#3B6E4C]">₹{item.unit_price} each</p>

                  <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                    {/* Qty Control */}
                    <div className="flex items-center rounded-full border border-[#DCD7CB] bg-[#FAF6EE] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-white text-[#2C221E] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-[#2C221E]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-white text-[#2C221E] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg text-[#2C221E]">₹{item.subtotal}</p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#A8988E] hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2C221E] text-[#2C221E] px-7 py-3 text-sm font-bold hover:bg-[#2C221E] hover:text-white transition-all mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* ORDER SUMMARY */}
          <aside className="h-fit">
            <div className="rounded-3xl bg-[#2C221E] p-7 text-white shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 border-b border-white/15 pb-5 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-white/70">
                    <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                    <span className="flex-shrink-0">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-white/75">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/75">Delivery</span>
                  <span className={delivery === 0 ? "text-[#7BC89A] font-bold" : "text-white"}>
                    {delivery === 0 ? "FREE ✓" : `₹${delivery}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-5 border-t border-white/15 mt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#FFB800]">₹{total}</span>
              </div>

              {/* Coupon hint */}
              <div className="flex items-center gap-2 text-xs text-white/50 mb-5">
                <Tag size={12} />
                <span>Have a coupon? Apply it at checkout.</span>
              </div>

              <Link
                to="/checkout"
                className="block rounded-full bg-[#FFB800] px-6 py-4 text-center font-bold text-[#2C221E] hover:brightness-110 transition hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout →
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/50"><Shield size={12} /> 100% Secure Payment</div>
                <div className="flex items-center gap-2 text-xs text-white/50"><Truck size={12} /> Free Delivery on ₹499+</div>
                <div className="flex items-center gap-2 text-xs text-white/50"><RotateCcw size={12} /> 7-Day Return Policy</div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}