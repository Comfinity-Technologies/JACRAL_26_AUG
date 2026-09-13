import { Link } from "react-router-dom";
import type { Product } from "../../data/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-[#E5E0D5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-64 items-center justify-center bg-[#F3F0E7]">
        <div className="px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C98B4A]">
            JACRAL
          </p>

          <h3 className="mt-3 font-serif text-2xl text-[#17382B]">
            {product.name}
          </h3>
        </div>
      </div>

      <div className="p-6">

        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C98B4A]">
          {product.category}
        </p>

        <h3 className="mt-2 text-xl font-semibold text-[#17382B]">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-[#718078]">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between">

          <span className="text-lg font-bold text-[#17382B]">
            ₹{product.price}
          </span>

          {product.stock > 0 ? (
            <span className="text-xs font-medium text-green-700">
              In stock
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">
              Out of stock
            </span>
          )}

        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-5 block w-full rounded-full bg-[#17382B] px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          View Product
        </Link>

      </div>
    </div>
  );
}