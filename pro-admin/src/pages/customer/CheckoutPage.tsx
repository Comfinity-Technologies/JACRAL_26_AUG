import { useState, type FormEvent } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const {
    items,
    subtotal,
    delivery,
    total,
    clearCart,
  } = useCart();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const [name, setName] =
    useState(user?.name || "");

  const [email, setEmail] =
    useState(user?.email || "");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [pincode, setPincode] =
    useState("");

  const [error, setError] =
    useState("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FCFAF4] px-6 py-20">

        <div className="mx-auto max-w-xl text-center">

          <p className="text-sm font-semibold tracking-[0.25em] text-[#C98B4A]">
            CHECKOUT
          </p>

          <h1 className="mt-4 font-serif text-5xl text-[#17382B]">
            Login Required
          </h1>

          <p className="mt-4 text-[#718078]">
            Please login before continuing
            to checkout.
          </p>

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFAF4] px-6 py-20">

        <div className="mx-auto max-w-xl text-center">

          <h1 className="font-serif text-5xl text-[#17382B]">
            Your cart is empty
          </h1>

          <p className="mt-4 text-[#718078]">
            Add products before checking out.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-[#17382B] px-8 py-4 font-semibold text-white"
          >
            Shop Now
          </Link>

        </div>

      </div>
    );
  }

  const handleSubmit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      setError(
        "Please complete all delivery details."
      );
      return;
    }

    const submitOrder = async () => {
      try {
        const orderData = {
          items: items.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          })),
          shipping_name: name,
          shipping_email: email,
          shipping_phone: phone,
          shipping_address: `${address}, ${city}, ${state}, ${pincode}`,
          notes: "Placed via Web UI"
        };

        const res = await apiClient.post("/api/v1/orders", orderData);
        
        localStorage.setItem(
          "jacral_last_order",
          JSON.stringify(res.data)
        );

        clearCart();
        navigate("/order-success");
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to place order.");
      }
    };

    submitOrder();
  };

  return (
    <div className="min-h-screen bg-[#FCFAF4] px-6 py-12">

      <div className="mx-auto max-w-7xl">

        <div className="mb-12">

          <p className="text-sm font-semibold tracking-[0.25em] text-[#C98B4A]">
            CHECKOUT
          </p>

          <h1 className="mt-3 font-serif text-6xl text-[#17382B]">
            Complete your order
          </h1>

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >

          {/* DELIVERY */}
          <div className="botanica-card p-8 md:p-10">

            <h2 className="text-2xl font-semibold text-[#17382B]">
              Delivery Information
            </h2>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <div className="md:col-span-2">

                <label className="text-sm font-medium text-[#17382B]">
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
                  placeholder="Your full name"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-[#17382B]">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
                  placeholder="you@example.com"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-[#17382B]">
                  Phone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
                  placeholder="+91 98765 43210"
                />

              </div>

              <div className="md:col-span-2">

                <label className="text-sm font-medium text-[#17382B]">
                  Address
                </label>

                <textarea
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
                  placeholder="House number, street, locality"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-[#17382B]">
                  City
                </label>

                <input
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
                  placeholder="City"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-[#17382B]">
                  State
                </label>

                <input
                  value={state}
                  onChange={(event) =>
                    setState(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
                  placeholder="State"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-[#17382B]">
                  Pincode
                </label>

                <input
                  value={pincode}
                  onChange={(event) =>
                    setPincode(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
                  placeholder="678001"
                />

              </div>

            </div>

          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-3xl bg-[#17382B] p-8 text-white">

            <h2 className="text-2xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-8 space-y-5">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-sm"
                >

                  <span className="text-white/75">
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₹{item.price * item.quantity}
                  </span>

                </div>
              ))}

            </div>

            <div className="mt-8 space-y-4 border-t border-white/15 pt-6">

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

              <div className="flex justify-between border-t border-white/15 pt-5 text-xl font-semibold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-full bg-[#C98B4A] px-6 py-4 font-semibold text-white hover:opacity-90"
            >
              Place Order
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-white/60">
              Payment gateway will be connected
              during the backend phase.
            </p>

          </aside>

        </form>

      </div>

    </div>
  );
}