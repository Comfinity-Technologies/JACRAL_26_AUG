import {
  CheckCircle2,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function OrderSuccessPage() {
  let orderId = "JCR-10001";

  const storedOrder =
    localStorage.getItem(
      "jacral_last_order"
    );

  if (storedOrder) {
    try {
      const order = JSON.parse(
        storedOrder
      );

      if (order.id) {
        orderId = order.id;
      }
    } catch {
      // Keep fallback order ID.
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFAF4] px-6 py-20">

      <div className="mx-auto max-w-2xl text-center">

        <CheckCircle2
          size={72}
          strokeWidth={1.4}
          className="mx-auto text-[#C98B4A]"
        />

        <p className="mt-8 text-sm font-semibold tracking-[0.25em] text-[#C98B4A]">
          ORDER CONFIRMED
        </p>

        <h1 className="mt-4 font-serif text-6xl text-[#17382B]">
          Thank you.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#718078]">
          Your Jacral order has been placed
          successfully. We're getting it ready
          for you.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-3xl border border-[#E5E0D5] bg-white p-7">

          <p className="text-sm text-[#718078]">
            Order Number
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#17382B]">
            {orderId}
          </p>

        </div>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

          <Link
            to="/shop"
            className="rounded-full bg-[#17382B] px-7 py-4 font-semibold text-white hover:bg-[#1F4D3A]"
          >
            Continue Shopping
          </Link>

          <Link
            to="/account"
            className="rounded-full border border-[#17382B] px-7 py-4 font-semibold text-[#17382B] hover:bg-[#17382B] hover:text-white"
          >
            View Account
          </Link>

        </div>

      </div>

    </div>
  );
}