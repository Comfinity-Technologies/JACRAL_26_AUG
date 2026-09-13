import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductGrid from "../../components/customer/ProductGrid";
import { apiClient } from "../../api/client";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("created_at_desc");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          apiClient.get("/api/v1/products?limit=100"),
          apiClient.get("/api/v1/categories"),
        ]);
        setProducts(prodRes.data.items ?? []);
        setCategories([{ id: "all", name: "All" }, ...(catRes.data ?? [])]);
      } catch (err) {
        console.error("Shop data fetch failed:", err);
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

    switch (sort) {
      case "price_asc":    result.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price_desc":   result.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "name_asc":     result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    return result;
  }, [selectedCategory, search, sort, products]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSort("created_at_desc");
    setSearchParams({});
  };

  const hasFilters = search || selectedCategory !== "All";

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E]">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white px-6 py-16 md:py-24 border-b border-[#E5DCDB] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#3B6E4C]/5 to-transparent"></div>
        <div className="mx-auto max-w-7xl relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-[#E88D36]/30 bg-[#E88D36]/10 text-[#E88D36] text-sm font-semibold mb-6 uppercase tracking-widest">
            JACRAL Shop
          </span>
          <h1
            className="text-5xl text-[#2C221E] md:text-7xl mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Our Collection
          </h1>
          <p
            className="text-2xl text-[#685B55]"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Pure goodness for your daily life
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* ── FILTERS ROW ── */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 botanica-card p-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8988E]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-[#E5DCDB] bg-[#FAF6EE] py-2.5 pl-11 pr-4 text-sm text-[#2C221E] placeholder-[#A8988E] outline-none transition focus:border-[#E88D36] focus:bg-white"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`nav-pill border ${
                    selectedCategory === cat.name
                      ? "bg-[#2C221E] text-white border-[#2C221E]"
                      : "bg-white text-[#685B55] border-[#E5DCDB] hover:border-[#2C221E] hover:text-[#2C221E]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Clear */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#E88D36] hover:text-[#D47E2A] transition px-3"
              >
                <X size={14} /> Clear
              </button>
            )}
            
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-full border border-[#E5DCDB] bg-white py-2.5 pl-5 pr-10 text-sm font-semibold text-[#2C221E] outline-none hover:border-[#2C221E] transition cursor-pointer"
              >
                <option value="created_at_desc">Sort by: Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#685B55]" />
            </div>
          </div>
        </div>

        {/* ── RESULTS COUNT ── */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-medium text-[#685B55]">
            Showing <span className="font-bold text-[#2C221E]">{filteredProducts.length}</span> products
            {selectedCategory !== "All" && (
              <> in <span className="font-bold text-[#E88D36]">{selectedCategory}</span></>
            )}
          </p>
        </div>

        {/* ── PRODUCT GRID ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-3xl bg-white border border-[#E5DCDB]" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center botanica-card">
            <div className="text-6xl mb-6 opacity-50">🌿</div>
            <h3 className="text-2xl font-bold text-[#2C221E] mb-2" style={{ fontFamily: "var(--font-heading)" }}>No products found</h3>
            <p className="text-[#685B55] mb-6">We couldn't find anything matching your current filters.</p>
            <button onClick={clearFilters} className="btn-primary rounded-full px-8 py-3">
              Clear All Filters
            </button>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} cols={3} />
        )}
      </div>
    </div>
  );
}