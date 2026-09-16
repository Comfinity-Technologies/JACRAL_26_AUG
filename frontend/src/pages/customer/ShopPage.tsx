import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductGrid from "../../components/customer/ProductGrid";
import { apiClient } from "../../api/client";
import { Search } from "lucide-react";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync URL params → state
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All");
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [prodRes, catRes] = await Promise.all([
          apiClient.get("/api/v1/products?limit=100"),
          apiClient.get("/api/v1/categories"),
        ]);
        setProducts(prodRes.data.items ?? []);
        setCategories([{ id: "all", name: "All" }, ...(catRes.data ?? [])]);
      } catch (err) {
        console.error("Shop data fetch failed:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => {
        const catName = typeof p.category === "string" ? p.category : p.category?.name ?? "";
        return catName.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [selectedCategory, search, products]);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E]">

      {/* ── PAGE HEADER ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1E3B27] via-[#2C4F38] to-[#1A3022] px-6 py-20 md:py-28">
        {/* Decorative Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-[10%] w-72 h-72 rounded-full bg-[#E88D36] opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-[5%] w-96 h-64 rounded-full bg-[#3B6E4C] opacity-20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E88D36]/40 bg-[#E88D36]/15 text-[#E88D36] text-xs font-bold mb-6 uppercase tracking-widest">
            🌿 JACRAL Shop
          </span>
          <h1
            className="text-5xl text-white md:text-7xl mb-5 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Our Collection
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Pure, wholesome jackfruit products and nourishing cereals — for a better you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/50 text-xs font-semibold">
            <span>✓ 20% Natural Protein</span>
            <span>✓ 25% Prebiotic Fiber</span>
            <span>✓ Zero Added Sugar</span>
            <span>✓ 100% Sustainable</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ── RESULTS COUNT ── */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-[#685B55]">
            Showing{" "}
            <span className="font-bold text-[#2C221E]">{filteredProducts.length}</span>{" "}
            product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── PRODUCT GRID / STATES ── */}
        {error ? (
          <div className="natura-card py-20 text-center">
            <p className="text-4xl mb-4 opacity-40">⚠️</p>
            <h3 className="text-xl font-bold text-[#2C221E] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Something went wrong
            </h3>
            <p className="text-[#685B55] text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary rounded-full px-7 py-3"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-[400px] rounded-[24px]" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="natura-card py-20 text-center">
            <div className="text-5xl mb-5 opacity-40">🌿</div>
            <h3
              className="text-2xl font-bold text-[#2C221E] mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              No products found
            </h3>
            <p className="text-[#685B55] text-sm mb-6">
              We couldn't find anything matching your current filters.
            </p>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} cols={3} />
        )}
      </div>
    </div>
  );
}