import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ShoppingBag, ChevronRight, Minus, Plus,
  Shield, Truck, RefreshCw, CheckCircle2, Loader2, Check
} from "lucide-react";
import { apiClient } from "../../api/client";
import { useCart } from "../../hooks/useCart";
import { getImageUrl } from "../../utils/image";
import ProductGrid from "../../components/customer/ProductGrid";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [cartState, setCartState] = useState<"idle" | "loading" | "success">("idle");
  const [activeTab, setActiveTab] = useState<"description" | "details">("description");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQty(1);
    setCartState("idle");
    apiClient
      .get(`/api/v1/products/${id}`)
      .then((r) => {
        setProduct(r.data);
        const catId = r.data.category_id;
        if (catId) {
          apiClient
            .get(`/api/v1/products?category_id=${catId}&limit=5`)
            .then((cr) => {
              setRelated((cr.data.items ?? []).filter((p: any) => p.id !== Number(id)));
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || cartState !== "idle") return;
    setCartState("loading");
    try {
      await addToCart(product.id, qty);
      setCartState("success");
      setTimeout(() => setCartState("idle"), 2500);
    } catch {
      setCartState("idle");
    }
  };

  /* ── SKELETON ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] px-6 py-12">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2">
          <div className="skeleton h-[560px] rounded-[28px]" />
          <div className="space-y-6 pt-10">
            <div className="skeleton h-5 w-28 rounded-full" />
            <div className="skeleton h-16 w-3/4 rounded-2xl" />
            <div className="skeleton h-10 w-36 rounded-2xl" />
            <div className="skeleton h-28 rounded-2xl" />
            <div className="skeleton h-14 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ── NOT FOUND ── */
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-6">
        <div className="natura-card p-14 text-center max-w-md w-full">
          <p className="text-6xl mb-5 opacity-50">🌿</p>
          <h1
            className="text-3xl text-[#2C221E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Product Not Found
          </h1>
          <p className="text-[#685B55] mb-8 text-sm">
            This product may have been removed or is currently unavailable.
          </p>
          <Link to="/shop" className="btn-primary rounded-full px-8 py-3.5 inline-flex">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const price = parseFloat(product.price);
  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name ?? "";

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E] pb-24">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white/60 border-b border-[#E5DCDB] px-6 py-4 backdrop-blur-sm sticky top-[69px] z-40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-medium text-[#685B55]">
          <Link to="/" className="hover:text-[#2C221E] transition">Home</Link>
          <ChevronRight size={13} className="opacity-40" />
          <Link to="/shop" className="hover:text-[#2C221E] transition">Shop</Link>
          {categoryName && (
            <>
              <ChevronRight size={13} className="opacity-40" />
              <Link
                to={`/shop?category=${encodeURIComponent(categoryName)}`}
                className="hover:text-[#2C221E] transition"
              >
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={13} className="opacity-40" />
          <span className="font-bold text-[#2C221E] truncate max-w-[180px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* ── MAIN AREA ── */}
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-start">

          {/* IMAGE */}
          <div className="sticky top-[126px]">
            <div className="natura-card p-4">
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#F2EBDC] to-[#E9E1D0]"
                style={{ minHeight: 480 }}
              >
                {product.image_url ? (
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    style={{ minHeight: 480 }}
                  />
                ) : (
                  <div className="text-[8rem] opacity-80 drop-shadow-xl py-16">
                    {categoryName.toLowerCase().includes("cereal") ? "🌾" : "🌳"}
                  </div>
                )}

                {/* Overlaid badges */}
                <div className="absolute left-5 top-5 flex flex-col gap-2">
                  {product.featured && (
                    <span className="product-tag text-[#3B6E4C]">Best Seller</span>
                  )}
                  {product.badge && (
                    <span className="product-tag text-[#E88D36]">{product.badge}</span>
                  )}
                  {isOutOfStock && (
                    <span className="product-tag bg-[#2C221E]/80 text-white">Sold Out</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className="flex flex-col pt-4 lg:pt-8">

            {/* Category */}
            <Link
              to={`/shop?category=${encodeURIComponent(categoryName)}`}
              className="inline-block mb-4"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E88D36] hover:text-[#D47E2A] transition">
                {categoryName}
              </span>
            </Link>

            {/* Product name */}
            <h1
              className="text-4xl leading-tight text-[#2C221E] md:text-5xl mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-[#3B6E4C]">
                ₹{price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-[#685B55] uppercase tracking-wider">
                Incl. all taxes
              </span>
            </div>

            <div className="section-divider !my-0 !mb-6 opacity-40" />

            {/* Description */}
            {product.description && (
              <p className="max-w-xl leading-[1.8] text-[#685B55] mb-7 text-base">
                {product.description}
              </p>
            )}

            {/* Benefits */}
            <ul className="space-y-2.5 mb-8">
              {["100% Organic & Natural", "No artificial preservatives", "Sustainably sourced"].map(
                (item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#2C221E] text-sm font-medium">
                    <CheckCircle2 size={17} className="text-[#3B6E4C] flex-shrink-0" />
                    {item}
                  </li>
                )
              )}
            </ul>

            {/* Availability */}
            <div className="mb-6 flex items-center gap-2.5">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isOutOfStock ? "bg-red-500" : "bg-[#3B6E4C]"
                }`}
              />
              <p
                className={`text-sm font-bold uppercase tracking-wider ${
                  isOutOfStock ? "text-red-500" : "text-[#3B6E4C]"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : `In Stock (${product.stock} available)`}
              </p>
            </div>

            {/* Quantity + CTA */}
            {!isOutOfStock ? (
              <div className="flex flex-wrap items-center gap-4 mb-10">
                {/* Qty */}
                <div className="qty-selector h-14 w-[148px]">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-value text-base">{qty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartState === "loading"}
                  className={`flex-1 min-w-[200px] h-14 flex items-center justify-center gap-3 rounded-full text-base font-bold transition-all shadow-md ${
                    cartState === "success"
                      ? "bg-[#3B6E4C] text-white shadow-[#3B6E4C]/25"
                      : "bg-[#2C221E] text-white hover:bg-[#3B6E4C] hover:shadow-[#3B6E4C]/30 hover:-translate-y-1 disabled:opacity-70"
                  }`}
                >
                  {cartState === "loading" ? (
                    <><Loader2 size={20} className="animate-spin" /> Adding…</>
                  ) : cartState === "success" ? (
                    <><Check size={20} strokeWidth={2.5} /> Added to Cart!</>
                  ) : (
                    <><ShoppingBag size={20} /> Add to Cart</>
                  )}
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full h-14 rounded-full bg-[#E5DCDB] text-base font-bold text-[#685B55] cursor-not-allowed mb-10"
              >
                Currently Out of Stock
              </button>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-[#E5DCDB] pt-7">
              {[
                { icon: <Truck size={20} />, label: "Free Shipping", sub: "Orders over ₹999" },
                { icon: <Shield size={20} />, label: "Secure Payment", sub: "100% Protected" },
                { icon: <RefreshCw size={20} />, label: "Easy Returns", sub: "7-day policy" },
              ].map((tb) => (
                <div key={tb.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-11 h-11 rounded-full bg-white border border-[#E5DCDB] flex items-center justify-center text-[#E88D36] shadow-sm">
                    {tb.icon}
                  </div>
                  <div>
                    <p className="text-[0.75rem] font-bold text-[#2C221E] leading-tight">{tb.label}</p>
                    <p className="text-[0.68rem] text-[#685B55] mt-0.5">{tb.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRODUCT TABS ── */}
        <div className="mt-20 pt-10 border-t border-[#E5DCDB]">
          <div className="flex justify-center gap-8 mb-10">
            {(["description", "details"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`text-base font-bold capitalize transition-all relative pb-2 ${
                  activeTab === tab
                    ? "text-[#2C221E]"
                    : "text-[#A8988E] hover:text-[#685B55]"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {tab === "description" ? "Description" : "Additional Information"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E88D36] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-3xl">
            {activeTab === "description" ? (
              <div className="natura-card p-8 md:p-12 text-[#685B55] leading-[1.9] text-base">
                <p>{product.description ?? "No description available for this product."}</p>
                <p className="mt-5">
                  Our products are carefully processed to ensure that all natural nutrients are
                  retained. We take pride in delivering farm-fresh quality directly to your
                  doorstep, making healthy eating accessible and delicious.
                </p>
              </div>
            ) : (
              <div className="natura-card overflow-hidden">
                {[
                  { label: "Product Name", value: product.name },
                  { label: "Category", value: categoryName },
                  { label: "Price", value: `₹${price.toLocaleString("en-IN")}` },
                  { label: "Availability", value: isOutOfStock ? "Out of Stock" : `${product.stock} units in stock` },
                  { label: "SKU", value: product.slug ?? `JCRL-${product.id}` },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex flex-col sm:flex-row sm:gap-8 px-8 py-5 ${
                      i % 2 === 0 ? "bg-white" : "bg-[#FAF6EE]"
                    }`}
                  >
                    <span className="sm:w-1/3 text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-1 sm:mb-0">
                      {row.label}
                    </span>
                    <span className="sm:w-2/3 text-sm text-[#685B55]">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="mb-12 text-center">
              <span className="section-eyebrow text-[#E88D36]">You may also like</span>
              <h2
                className="mt-3 text-4xl text-[#2C221E]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Similar Products
              </h2>
            </div>
            <ProductGrid products={related.slice(0, 4)} cols={4} />
          </div>
        )}
      </div>
    </div>
  );
}