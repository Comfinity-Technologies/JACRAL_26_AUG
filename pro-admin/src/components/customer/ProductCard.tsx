import { Link } from "react-router-dom";
import { ShoppingBag, Eye, Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  stock: number;
  featured?: boolean;
  badge?: string;
  image_url?: string;
  category?: { name: string } | string;
  slug?: string;
}

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

function getCategoryName(cat: Product["category"]): string {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  return cat.name;
}

function getBadgeClass(badge?: string) {
  if (!badge) return "";
  const b = badge.toLowerCase();
  if (b.includes("best") || b.includes("popular") || b.includes("top")) return "badge-forest";
  if (b.includes("sale") || b.includes("new") || b.includes("fresh")) return "badge-accent";
  return "badge-cream";
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const categoryName = getCategoryName(product.category);

  return (
    <article className="botanica-card group flex flex-col h-full relative">
      {/* ── IMAGE AREA ── */}
      <Link to={`/product/${product.id}`} className="relative block h-64 overflow-hidden bg-gradient-to-br from-[#F2EBDC] to-[#E9E1D0]">
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-[6rem] opacity-90 drop-shadow-lg">
              {categoryName.toLowerCase().includes("cereal") ? "🌾" : "🌳"}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
          {product.featured && (
            <span className="product-tag text-[#3B6E4C]">Best Seller</span>
          )}
          {product.badge && (
            <span className="product-tag text-[#E88D36]">{product.badge}</span>
          )}
          {isOutOfStock && (
            <span className="product-tag bg-[#2C221E] text-white">Sold Out</span>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-[#2C221E]/0 opacity-0 transition-all duration-300 group-hover:bg-[#2C221E]/10 group-hover:opacity-100 flex items-center justify-center">
          <span className="nav-pill bg-white text-[#2C221E] shadow-lg flex items-center gap-2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 font-bold">
            <Eye size={16} /> Quick View
          </span>
        </div>
      </Link>

      {/* ── CONTENT ── */}
      <div className="flex flex-col flex-1 p-6 bg-white z-10">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`}>
            <h3
              className="text-lg font-bold text-[#2C221E] transition-colors hover:text-[#E88D36] leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {product.name}
            </h3>
          </Link>
          <p className="text-xl font-bold text-[#3B6E4C] ml-3 whitespace-nowrap">
            ₹{price.toLocaleString("en-IN")}
          </p>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-[#E88D36] mb-3">
          {categoryName}
        </p>

        {product.description && (
          <p className="text-sm text-[#685B55] line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < 4 ? "fill-[#FFB800] text-[#FFB800]" : "fill-none text-[#DCD7CB]"} />
            ))}
            <span className="text-xs text-[#685B55] ml-1">(24)</span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
            className="group/btn relative overflow-hidden rounded-full bg-[#FAF6EE] border border-[#E5DCDB] w-10 h-10 flex items-center justify-center transition-colors hover:border-[#3B6E4C] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isOutOfStock ? "Sold out" : `Add ${product.name} to cart`}
          >
            <div className="absolute inset-0 bg-[#3B6E4C] scale-0 transition-transform duration-300 rounded-full group-hover/btn:scale-100 origin-center"></div>
            <ShoppingBag size={16} strokeWidth={2} className="relative z-10 text-[#2C221E] group-hover/btn:text-white transition-colors" />
          </button>
        </div>
      </div>
    </article>
  );
}