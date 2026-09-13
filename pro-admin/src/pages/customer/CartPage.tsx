import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  useCart,
} from "../../hooks/useCart";

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
      <div className="min-h-screen bg-[#FAF6EE] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <ShoppingBag
            size={56}
            strokeWidth={1.5}
            className="mx-auto text-[#E88D36]"
          />

          <h1 className="mt-8 text-6xl text-[#2C221E]" style={{ fontFamily: "var(--font-display)" }}>
            Your Cart
          </h1>

          <p className="mt-5 text-[#685B55]">
            Your cart is currently empty.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-[#3B6E4C] px-8 py-4 font-medium text-white transition hover:bg-[#2E583C]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-12">
          <p className="text-sm font-semibold tracking-[0.25em] text-[#E88D36]">
            YOUR BAG
          </p>

          <h1 className="mt-3 text-6xl text-[#2C221E]" style={{ fontFamily: "var(--font-display)" }}>
            Your Cart
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ITEMS */}
          {/* ITEMS */}
          <div className="botanica-card p-6 md:p-8">

            <div className="mb-8 border-b border-[#E8E3D9] pb-5">
              <h2 className="text-2xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>
                Your Items
              </h2>

              <p className="mt-1 text-sm font-medium text-[#718078]">
                {items.length} product
                {items.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-7">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 border-b border-[#E5DCDB] pb-7 last:border-0"
                >

                  {/* PRODUCT IMAGE */}
                  <div className="flex gap-5">

                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#F2EBDC] to-[#E9E1D0]">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover mix-blend-multiply"
                        />
                      ) : (
                        <span className="text-[3rem] opacity-50">
                          🌿
                        </span>
                      )}

                    </div>

                    <div className="flex-1">

                      <p className="text-xs font-bold uppercase tracking-wider text-[#E88D36]">
                        {item.category}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-[#2C221E] leading-tight">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-[#3B6E4C]">
                        ₹{item.price}
                      </p>

                    </div>

                  </div>

                  {/* CONTROLS */}

                  <div className="flex items-center justify-between mt-2">

                    <div className="flex items-center rounded-full border border-[#DCD7CB] bg-[#FAF6EE]">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white text-[#2C221E] transition-colors"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="w-10 text-center font-bold text-[#2C221E]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white text-[#2C221E] transition-colors"
                      >
                        <Plus size={15} />
                      </button>

                    </div>

                    <div className="text-right">

                      <p className="font-bold text-lg text-[#2C221E]">
                        ₹{item.price * item.quantity}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E88D36] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>

            <Link
              to="/shop"
              className="mt-10 inline-block rounded-full border-2 border-[#2C221E] text-[#2C221E] px-8 py-3.5 text-sm font-bold hover:bg-[#2C221E] hover:text-white transition-all"
            >
              Continue Shopping
            </Link>

          </div>

          {/* SUMMARY */}

          <aside className="h-fit rounded-3xl bg-[#2C221E] p-8 text-white">

            <h2 className="text-2xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-8 space-y-5 border-b border-white/15 pb-6">

              <div className="flex justify-between text-sm text-white/75">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-sm text-white/75">
                <span>Delivery</span>

                <span>
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery}`}
                </span>
              </div>

            </div>

            <div className="flex justify-between py-6">

              <span className="text-lg">
                Total
              </span>

              <span className="text-2xl font-semibold">
                ₹{total}
              </span>

            </div>

            <Link
              to="/checkout"
              className="block rounded-full bg-[#FFB800] px-6 py-4 text-center font-semibold text-[#2C221E] hover:brightness-105 transition"
            >
              Proceed to Checkout
            </Link>

          </aside>

        </div>

      </div>
    </div>
  );
}