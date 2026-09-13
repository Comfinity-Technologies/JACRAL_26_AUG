import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ShoppingBag, ChevronRight, Minus, Plus,
  Star, Shield, Truck, RefreshCw, CheckCircle2
} from "lucide-react";
import { apiClient } from "../../api/client";
import ProductGrid from "../../components/customer/ProductGrid";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details">("description");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQty(1);
    setAddedToCart(false);
    apiClient.get(`/api/v1/products/${id}`)
      .then((r) => {
        setProduct(r.data);
        // Fetch related (same category)
        const catId = r.data.category_id;
        if (catId) {
          apiClient.get(`/api/v1/products?category_id=${catId}&limit=4`)
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
    if (!product) return;
    try {
      await apiClient.post("/api/v1/cart", { product_id: product.id, quantity: qty });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] px-6 py-12">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">
          <div className="h-[600px] animate-pulse rounded-[32px] bg-white border border-[#E5DCDB]" />
          <div className="space-y-6 pt-12">
            <div className="h-6 w-32 animate-pulse rounded-full bg-[#E5DCDB]" />
            <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-[#E5DCDB]" />
            <div className="h-10 w-40 animate-pulse rounded-2xl bg-[#E5DCDB]" />
            <div className="h-32 animate-pulse rounded-2xl bg-[#E5DCDB]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-6">
        <div className="botanica-card p-16 text-center max-w-lg w-full">
          <p className="text-6xl mb-6 opacity-50">🌿</p>
          <h1
            className="text-4xl text-[#2C221E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Product Not Found
          </h1>
          <p className="text-[#685B55] mb-8">This product may have been removed or is currently unavailable.</p>
          <Link to="/shop" className="btn-primary rounded-full px-8 py-3.5 inline-flex">
            <ArrowLeft size={18} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const price = parseFloat(product.price);
  const categoryName = typeof product.category === "string" ? product.category : product.category?.name ?? "";

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E] pb-24">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white/50 border-b border-[#E5DCDB] px-6 py-4 backdrop-blur-sm sticky top-[64px] z-40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-medium text-[#685B55]">
          <Link to="/" className="hover:text-[#2C221E] transition">Home</Link>
          <ChevronRight size={14} className="opacity-50" />
          <Link to="/shop" className="hover:text-[#2C221E] transition">Shop</Link>
          {categoryName && (
            <>
              <ChevronRight size={14} className="opacity-50" />
              <Link to={`/shop?category=${categoryName}`} className="hover:text-[#2C221E] transition">
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="opacity-50" />
          <span className="font-bold text-[#2C221E] truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* ── MAIN PRODUCT AREA ── */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start">

          {/* IMAGE */}
          <div className="sticky top-[140px]">
            <div className="botanica-card p-4">
              <div className="relative flex min-h-[500px] lg:min-h-[600px] items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#F2EBDC] to-[#E9E1D0]">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-[10rem] opacity-90 drop-shadow-2xl">
                    {categoryName.toLowerCase().includes("cereal") ? "🌾" : "🌳"}
                  </div>
                )}

                {/* Badges overlay */}
                <div className="absolute left-6 top-6 flex flex-col gap-2">
                  {product.featured && <span className="product-tag text-[#3B6E4C]">Best Seller</span>}
                  {product.badge && <span className="product-tag text-[#E88D36]">{product.badge}</span>}
                  {isOutOfStock && <span className="product-tag bg-[#2C221E] text-white">Sold Out</span>}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col pt-4 lg:pt-10">
            {/* Category & title */}
            <Link to={`/shop?category=${categoryName}`} className="inline-block mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E88D36] hover:text-[#D47E2A] transition-colors">
                {categoryName}
              </span>
            </Link>
            
            <h1
              className="text-4xl leading-tight text-[#2C221E] md:text-5xl lg:text-6xl mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < 4 ? "fill-[#FFB800] text-[#FFB800]" : "fill-none text-[#DCD7CB]"} />
                ))}
              </div>
              <span className="text-sm font-medium text-[#685B55] underline decoration-[#E5DCDB] underline-offset-4">24 Reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-bold text-[#3B6E4C]">
                ₹{price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-semibold text-[#685B55] uppercase tracking-wider">Incl. of all taxes</span>
            </div>

            <div className="section-divider !my-0 !mb-8 opacity-50"></div>

            {/* Short description */}
            {product.description && (
              <p className="max-w-xl leading-relaxed text-[#685B55] mb-8 text-lg">
                {product.description}
              </p>
            )}

            {/* Key benefits list (Botanica style addition) */}
            <ul className="space-y-3 mb-10">
              {["100% Organic & Natural", "No artificial preservatives", "Sustainably sourced"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#2C221E] font-medium">
                  <CheckCircle2 size={20} className="text-[#3B6E4C]" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Availability */}
            <div className="mb-6 flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-[#3B6E4C]"}`} />
              <p className={`text-sm font-bold uppercase tracking-wider ${isOutOfStock ? "text-red-500" : "text-[#3B6E4C]"}`}>
                {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} available)`}
              </p>
            </div>

            {/* Quantity + Add to Cart */}
            {!isOutOfStock ? (
              <div className="flex flex-wrap items-center gap-4 mb-10">
                {/* Qty selector */}
                <div className="flex items-center rounded-full border-2 border-[#E5DCDB] bg-white overflow-hidden h-14 w-[140px]">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex-1 h-full flex items-center justify-center text-[#2C221E] hover:bg-[#F2EBDC] transition"
                    disabled={qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-[#2C221E]">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="flex-1 h-full flex items-center justify-center text-[#2C221E] hover:bg-[#F2EBDC] transition"
                    disabled={qty >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 min-w-[200px] h-14 flex items-center justify-center gap-3 rounded-full text-base font-bold transition-all shadow-lg ${
                    addedToCart
                      ? "bg-[#3B6E4C] text-white shadow-[#3B6E4C]/30"
                      : "bg-[#2C221E] text-white hover:bg-[#E88D36] hover:shadow-[#E88D36]/30 hover:-translate-y-1"
                  }`}
                >
                  <ShoppingBag size={20} />
                  {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
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
            <div className="grid grid-cols-3 gap-4 border-t border-[#E5DCDB] pt-8">
              {[
                { icon: <Truck size={22} />, label: "Free Shipping", sub: "Orders over ₹999" },
                { icon: <Shield size={22} />, label: "Secure Payment", sub: "100% Protected" },
                { icon: <RefreshCw size={22} />, label: "Easy Returns", sub: "7-Day policy" },
              ].map((tb) => (
                <div key={tb.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E5DCDB] flex items-center justify-center text-[#E88D36] shadow-sm">
                    {tb.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2C221E] leading-tight mb-1">{tb.label}</p>
                    <p className="text-[10px] text-[#685B55] uppercase tracking-wider">{tb.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRODUCT TABS ── */}
        <div className="mt-24 pt-12 border-t border-[#E5DCDB]">
          <div className="flex justify-center gap-8 mb-12">
            {(["description", "details"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`text-lg font-bold capitalize transition-all relative pb-2 ${
                  activeTab === tab
                    ? "text-[#2C221E]"
                    : "text-[#A8988E] hover:text-[#685B55]"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {tab === "description" ? "Description" : "Additional Information"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E88D36] rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-3xl">
            {activeTab === "description" ? (
              <div className="botanica-card p-8 md:p-12 text-[#685B55] leading-relaxed text-lg">
                <p>{product.description ?? "No description available for this product."}</p>
                {/* Dummy extended text for visual fullness */}
                <p className="mt-6">Our products are carefully processed to ensure that all the natural nutrients are retained. We take pride in delivering farm-fresh quality right to your doorstep, making healthy eating accessible and delicious.</p>
              </div>
            ) : (
              <div className="botanica-card overflow-hidden">
                {[
                  { label: "Product Name", value: product.name },
                  { label: "Category", value: categoryName },
                  { label: "Price", value: `₹${price.toLocaleString("en-IN")}` },
                  { label: "Availability", value: `${product.stock} units in stock` },
                  { label: "SKU", value: product.slug ?? `JCRL-${product.id}` },
                  { label: "Ingredients", value: "100% Natural, No Preservatives" },
                ].map((row, i) => (
                  <div key={row.label} className={`flex flex-col sm:flex-row sm:gap-8 px-8 py-5 ${i % 2 === 0 ? "bg-white" : "bg-[#FAF6EE]"}`}>
                    <span className="sm:w-1/3 text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-1 sm:mb-0">{row.label}</span>
                    <span className="sm:w-2/3 text-base text-[#685B55]">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div className="mt-24">
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