import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductGrid from "../../components/customer/ProductGrid";
import { apiClient } from "../../api/client";
import { ArrowRight, Leaf, Sprout, Wheat, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featRes, allRes] = await Promise.all([
          apiClient.get("/api/v1/products?limit=4&featured=true"),
          apiClient.get("/api/v1/products?limit=8"),
        ]);
        setFeaturedProducts(featRes.data.items ?? []);
        setAllProducts(allRes.data.items ?? []);
      } catch (e) {
        console.error("Products fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 4);

  return (
    <div className="bg-[#FAF6EE] text-[#2C221E] overflow-hidden">
      {/* ═══════════════════════════════════════
          HERO (Botanica Style)
          ═══════════════════════════════════════ */}
      <section className="relative px-6 py-12 md:py-24 min-h-[90vh] flex items-center">
        {/* Organic Blobs */}
        <div className="hero-blob bg-[#E88D36] w-[600px] h-[600px] -top-20 -left-20"></div>
        <div className="hero-blob bg-[#3B6E4C] w-[500px] h-[500px] bottom-0 -right-20" style={{ animationDelay: '2s' }}></div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          {/* Left copy - Editorial Style */}
          <div className="z-10">
            <span
              className="inline-block px-4 py-1.5 rounded-full border border-[#E88D36]/30 bg-[#E88D36]/10 text-[#E88D36] text-sm font-semibold mb-6 tracking-wider uppercase"
            >
              100% Organic & Natural
            </span>

            <h1
              className="text-[4rem] leading-[1.05] md:text-[5.5rem] text-[#2C221E] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Discover
              <br />
              <span className="text-[#3B6E4C] italic" style={{ fontFamily: "var(--font-heading)" }}>Nature's</span>
              <br />
              Bounty.
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-[#685B55] mb-10">
              Premium jackfruit products and wholesome cereals, sourced directly from trusted farmers. 
              Elevate your daily nutrition with our natural, minimally processed ingredients.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/shop" className="btn-primary rounded-full px-8 py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Shop Collection <ArrowRight size={18} />
              </Link>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FAF6EE] bg-[#E5DCDB] flex items-center justify-center text-xs font-bold text-[#685B55]">
                    {['JD', 'SM', 'AK'][i-1]}
                  </div>
                ))}
                <div className="pl-6 text-sm font-semibold text-[#2C221E]">
                  Loved by 5k+<br/><span className="text-[#685B55] font-normal">happy customers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right visual - Premium Cards */}
          <div className="relative z-10 hidden lg:flex justify-end pr-10">
            {/* Main Featured Card */}
            <div className="botanica-card w-[340px] p-4 relative z-20 transform translate-x-12 -translate-y-8">
              <div className="h-[400px] rounded-2xl bg-gradient-to-br from-[#E9E1D0] to-[#D8CDB8] flex items-center justify-center relative overflow-hidden group">
                <div className="text-[8rem] group-hover:scale-110 transition-transform duration-500">🌳</div>
                <div className="absolute top-4 left-4">
                  <span className="product-tag text-[#3B6E4C]">Best Seller</span>
                </div>
              </div>
              <div className="mt-5 px-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>Premium Jackfruit Flour</h3>
                  <span className="font-semibold text-[#E88D36]">₹349</span>
                </div>
                <p className="text-sm text-[#685B55] line-clamp-2">Finely milled, gluten-free flour made from 100% raw green jackfruit.</p>
              </div>
            </div>

            {/* Secondary Floating Card */}
            <div className="botanica-card w-[260px] p-3 absolute bottom-[-40px] left-[-20px] z-30 shadow-2xl">
              <div className="h-[220px] rounded-xl bg-gradient-to-br from-[#E7EEE6] to-[#CFDECE] flex items-center justify-center relative group overflow-hidden">
                <div className="text-[5rem] group-hover:scale-110 transition-transform duration-500">🌾</div>
              </div>
              <div className="mt-4 px-2 pb-2">
                <h3 className="font-bold text-[#2C221E]">Wholesome Millets</h3>
                <p className="text-xs text-[#685B55] mt-1">Rich in fiber & nutrients</p>
              </div>
            </div>
            
            {/* Trust Badge */}
            <div className="absolute top-10 -right-10 bg-white rounded-full p-4 shadow-xl flex flex-col items-center justify-center w-28 h-28 border border-[#E5DCDB] z-40 rotate-12">
              <span className="text-[#3B6E4C] text-2xl mb-1">100%</span>
              <span className="text-[10px] font-bold text-[#685B55] tracking-widest uppercase text-center">Natural<br/>Quality</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* ═══════════════════════════════════════
          CATEGORIES (Botanica Style Horizontal)
          ═══════════════════════════════════════ */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="section-eyebrow text-[#E88D36]">Curated Selections</span>
              <h2
                className="mt-3 text-4xl text-[#2C221E] md:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Shop by Category
              </h2>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-2 font-semibold text-[#2C221E] hover:text-[#E88D36] transition-colors border-b-2 border-transparent hover:border-[#E88D36] pb-1">
              View All Categories <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                emoji: "🌳",
                title: "Jackfruit Products",
                desc: "Flour, seeds, and ready-to-eat natural jackfruit items.",
                bg: "from-[#F1EBDD] to-[#E3D5BD]",
                tag: "Popular"
              },
              {
                emoji: "🌾",
                title: "Wholesome Cereals",
                desc: "Nutritious millets, oats, and daily breakfast essentials.",
                bg: "from-[#E7EEE6] to-[#CFDECE]",
                tag: "Daily Needs"
              },
              {
                emoji: "🍯",
                title: "Natural Preserves",
                desc: "Locally sourced honey and traditional fruit preserves.",
                bg: "from-[#FCEFE3] to-[#F3D5B9]",
                tag: "New"
              },
            ].map((cat) => (
              <Link
                key={cat.title}
                to={`/shop?category=${cat.title.split(' ')[0]}`}
                className="botanica-card group p-6 flex flex-col h-full bg-gradient-to-br relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <div className="text-5xl bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {cat.emoji}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/60 px-3 py-1 rounded-full text-[#2C221E]">
                    {cat.tag}
                  </span>
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="text-2xl font-bold text-[#2C221E] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {cat.title}
                  </h3>
                  <p className="text-[#685B55] text-sm leading-relaxed mb-6">{cat.desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#3B6E4C] group-hover:translate-x-2 transition-transform">
                    Explore Range <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
          ═══════════════════════════════════════ */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="section-eyebrow text-[#E88D36]">Our Bestsellers</span>
            <h2
              className="mt-3 text-4xl text-[#2C221E] md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Customer Favorites
            </h2>
          </div>

          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-[#E9E1D0]" />
                ))}
              </div>
            ) : (
              <ProductGrid products={displayFeatured} cols={4} />
            )}
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/shop" className="btn-outline rounded-full px-8 py-3.5 border-2 border-[#2C221E] text-[#2C221E] hover:bg-[#2C221E] hover:text-white transition-colors font-bold">
              View Entire Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STORY / PROMO SECTION
          ═══════════════════════════════════════ */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="botanica-card bg-[#3B6E4C] p-10 md:p-16 overflow-hidden relative">
            {/* Decorative BG elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="text-white">
                <span className="text-[#FFB800] text-lg font-script mb-4 block" style={{ fontFamily: "var(--font-script)" }}>
                  The JACRAL Promise
                </span>
                <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Ethically Sourced.<br/>Naturally Prepared.
                </h2>
                <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
                  We believe in keeping food as close to its natural state as possible. No artificial preservatives, just pure, wholesome goodness delivered straight to your door.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {["100% Organic Ingredients", "Sourced from local farmers", "Eco-friendly packaging"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/90">
                      <CheckCircle2 size={20} className="text-[#FFB800]" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/shop" className="btn-cta rounded-full px-8 py-4 bg-[#FFB800] text-[#2C221E] hover:bg-white transition-colors inline-flex font-bold">
                  Discover Our Quality <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
              
              <div className="hidden md:flex justify-center relative">
                <div className="w-[380px] h-[480px] rounded-[40px] bg-white/10 backdrop-blur-sm border border-white/20 p-4 transform rotate-3">
                  <div className="w-full h-full rounded-[30px] bg-gradient-to-br from-[#E9E1D0] to-[#3B6E4C]/40 flex items-center justify-center overflow-hidden">
                     <div className="text-[10rem] opacity-90 drop-shadow-2xl transform -rotate-12 hover:scale-110 transition-transform duration-700">🌿</div>
                  </div>
                </div>
                {/* Floating element */}
                <div className="absolute -bottom-6 -left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="w-12 h-12 rounded-full bg-[#E88D36]/20 flex items-center justify-center text-[#E88D36]">
                    <Sprout size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-[#685B55] font-bold uppercase tracking-wider">Quality</p>
                    <p className="text-lg font-bold text-[#2C221E]">Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}