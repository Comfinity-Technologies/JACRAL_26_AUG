import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useCart } from "../../hooks/useCart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
}: CartDrawerProps) {
  const {
    items,
    subtotal,
    delivery,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100]">

      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/30"
      />

      {/* DRAWER */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FCFAF4] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E5E0D5] px-6 py-5">

          <div className="flex items-center gap-3">

            <ShoppingBag
              size={21}
              className="text-[#C98B4A]"
            />

            <h2 className="text-xl font-semibold text-[#17382B]">
              Your Cart
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F3EFE5]"
          >
            <X size={20} />
          </button>

        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">

              <ShoppingBag
                size={46}
                strokeWidth={1.5}
                className="text-[#C98B4A]"
              />

              <h3 className="mt-5 font-serif text-3xl text-[#17382B]">
                Your cart is empty
              </h3>

              <p className="mt-2 text-sm text-[#718078]">
                Add something from the shop.
              </p>

              <Link
                to="/shop"
                onClick={onClose}
                className="mt-6 rounded-full bg-[#17382B] px-6 py-3 text-sm font-semibold text-white"
              >
                Shop Now
              </Link>

            </div>
          ) : (
            <div className="space-y-6">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-[#E5E0D5] pb-6"
                >

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F3EFE5]">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="font-serif text-2xl text-[#17382B]">
                        J
                      </span>
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold tracking-widest text-[#C98B4A]">
                      {item.category?.toUpperCase() || "PRODUCT"}
                    </p>

                    <h3 className="mt-1 truncate font-semibold text-[#17382B]">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#718078]">
                      ₹{item.unit_price}
                    </p>

                    <div className="mt-3 flex items-center justify-between">

                      <div className="flex items-center rounded-full border border-[#DCD7CB] bg-white">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                          <Minus size={13} />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.id)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                          <Plus size={13} />
                        </button>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        className="text-[#8A6B54] hover:text-[#17382B]"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* SUMMARY */}
        {items.length > 0 && (
          <div className="border-t border-[#E5E0D5] bg-white px-6 py-6">

            <div className="space-y-3 text-sm">

              <div className="flex justify-between text-[#718078]">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-[#718078]">
                <span>Delivery</span>
                <span>
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery}`}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#E5E0D5] pt-4 text-lg font-semibold text-[#17382B]">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

            </div>

            <Link
              to="/cart"
              onClick={onClose}
              className="mt-5 block rounded-full border border-[#17382B] px-6 py-3 text-center font-semibold text-[#17382B] hover:bg-[#17382B] hover:text-white"
            >
              View Cart
            </Link>

            <Link
              to="/checkout"
              onClick={onClose}
              className="mt-3 block rounded-full bg-[#C98B4A] px-6 py-4 text-center font-semibold text-white hover:opacity-90"
            >
              Checkout
            </Link>

          </div>
        )}

      </aside>

    </div>
  );
}