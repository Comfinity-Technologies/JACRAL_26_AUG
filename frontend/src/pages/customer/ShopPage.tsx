import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductGrid from "../../components/customer/ProductGrid";
import CategoryCards from "../../components/customer/CategoryCards";
import { apiClient } from "../../api/client";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

type SortOption = "newest" | "price_low" | "price_high";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  price_low: "Price: Low to High",
  price_high: "Price: High to Low",
};

function effectivePrice(p: any): number {
  const discounted = p.discount_price;
  if (discounted !== null && discounted !== undefined && Number(discounted) > 0) {
    return Number(discounted);
  }
  return Number(p.price) || 0;
}

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

  // Extra filters
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Price bounds derived from the actual catalog, so the inputs always
  // make sense for whatever products the admin has added — never a
  // hardcoded range.
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(effectivePrice);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

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

    if (inStockOnly) {
      result = result.filter((p) => Number(p.stock) > 0);
    }

    const min = minPrice.trim() === "" ? null : Number(minPrice);
    const max = maxPrice.trim() === "" ? null : Number(maxPrice);
    if (min !== null && !Number.isNaN(min)) {
      result = result.filter((p) => effectivePrice(p) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      result = result.filter((p) => effectivePrice(p) <= max);
    }

    if (sortBy === "price_low") {
      result.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    } else if (sortBy === "price_high") {
      result.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    } else {
      // newest first — falls back gracefully if created_at is missing
      result.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    }

    return result;
  }, [selectedCategory, search, products, inStockOnly, minPrice, maxPrice, sortBy]);

  const activeFilterCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minPrice.trim() !== "" ? 1 : 0) +
    (maxPrice.trim() !== "" ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory("All");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("category");
      return next;
    });
  };

  const handleCategoryClick = (name: string) => {
    setSelectedCategory(name);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (name === "All") next.delete("category");
      else next.set("category", name);
      return next;
    });
  };

  const filterPanelContent = (
    <>
      {/* Category */}
      <FilterBlock title="Category">
        <div className="flex flex-col gap-1">
          {categories.map((c) => {
            const active = selectedCategory === c.name;
            return (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c.name)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${active
                    ? "bg-[#2C4F38] text-white font-semibold"
                    : "text-[#4A403A] hover:bg-[#F1EADF]"
                  }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </FilterBlock>

      {/* Price range */}
      <FilterBlock title="Price">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8A7C72]">
              ₹
            </span>
            <input
              type="number"
              min={0}
              placeholder={String(priceBounds.min)}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-[#E5DCDB] bg-white py-2 pl-6 pr-2 text-sm text-[#2C221E] outline-none focus:border-[#2C4F38]"
            />
          </div>
          <span className="text-[#8A7C72]">–</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8A7C72]">
              ₹
            </span>
            <input
              type="number"
              min={0}
              placeholder={String(priceBounds.max)}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-[#E5DCDB] bg-white py-2 pl-6 pr-2 text-sm text-[#2C221E] outline-none focus:border-[#2C4F38]"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[#8A7C72]">
          Catalog range: ₹{priceBounds.min} – ₹{priceBounds.max}
        </p>
      </FilterBlock>

      {/* Availability */}
      <FilterBlock title="Availability">
        <label className="flex items-center gap-2.5 text-sm text-[#4A403A]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 accent-[#2C4F38]"
          />
          In stock only
        </label>
      </FilterBlock>

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="mt-2 w-full rounded-lg border border-[#E5DCDB] px-3 py-2 text-sm font-semibold text-[#685B55] transition-colors hover:bg-[#F1EADF]"
        >
          Clear all filters
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ── CATEGORY CARDS (New Section) ── */}
        <CategoryCards />

        {/* ── SEARCH + SORT BAR ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7C72]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-[#E5DCDB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2C221E] outline-none focus:border-[#2C4F38]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filters trigger */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-full border border-[#E5DCDB] bg-white px-4 py-2.5 text-sm font-semibold text-[#2C221E] lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2C4F38] px-1 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none rounded-full border border-[#E5DCDB] bg-white px-4 py-2.5 pr-9 text-sm font-medium text-[#2C221E] outline-none focus:border-[#2C4F38]"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A7C72]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden w-[260px] shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-[#E5DCDB] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#2C4F38]" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#2C221E]">
                  Filters
                </h2>
              </div>
              {filterPanelContent}
            </div>
          </aside>

          {/* ── MOBILE FILTER DRAWER ── */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 w-[85%] max-w-[340px] overflow-y-auto bg-white p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-[#2C221E]">
                    Filters
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-full p-1.5 hover:bg-[#F1EADF]"
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
                {filterPanelContent}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-5 w-full rounded-full bg-[#2C4F38] px-4 py-3 text-sm font-bold text-white"
                >
                  Show {filteredProducts.length} results
                </button>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-[#685B55]">
                Showing{" "}
                <span className="font-bold text-[#2C221E]">{filteredProducts.length}</span>{" "}
                product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

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
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="btn-primary rounded-full px-7 py-3"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <ProductGrid products={filteredProducts} cols={3} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 border-b border-[#F1EADF] pb-5 last:mb-0 last:border-b-0 last:pb-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#8A7C72]">
        {title}
      </h3>
      {children}
    </div>
  );
}