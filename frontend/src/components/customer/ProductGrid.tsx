import { useCart } from "../../hooks/useCart";
import ProductCard from "./ProductCard";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  stock: number;
  featured?: boolean;
  badge?: string;
  image_url?: string;
  category?: { name: string } | string;
};

type ProductGridProps = {
  products: Product[];
  cols?: 2 | 3 | 4;
};

export default function ProductGrid({ products, cols = 3 }: ProductGridProps) {
  const { addToCart } = useCart();

  if (!products || products.length === 0) {
    return (
      <div className="natura-card p-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1EBDD] text-3xl">
          🌿
        </div>
        <h3
          className="text-2xl text-[#2C221E] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          No products found
        </h3>
        <p className="text-sm text-[#685B55]">
          We couldn't find any products matching your selection.
        </p>
      </div>
    );
  }

  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return (
    <div className={`grid gap-6 ${colClass}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={async () => {
            await addToCart(product.id, 1);
          }}
        />
      ))}
    </div>
  );
}