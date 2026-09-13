import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShoppingBag, Sparkles } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { getImageUrl } from "../../utils/image";

/**
 * FEATURED PRODUCT SPOTLIGHT
 * Large, alternating single-product showcases — one product per row,
 * image on one side and a big story + CTA on the other. Sits between
 * "How to use" and the customer reviews.
 */
export default function FeaturedProductSpotlight() {
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();

  const active = products.filter((p) => p.is_active !== false);
  // Spotlight the next few products after the two already featured above.
  const spotlightProducts = active.slice(2, 5);

  if (isLoading || spotlightProducts.length === 0) return null;

  return (
    <section
      id="featured-products"
      className="relative overflow-hidden py-20 md:py-28 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#FAF6EE" }}
    >
      <style>{`
        @keyframes fpsReveal {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fpsImageFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-14px) rotate(1.2deg); }
        }
        @keyframes fpsRingPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.06); opacity: 0.85; }
        }
        .fps-reveal { animation: fpsReveal .9s cubic-bezier(.22,1,.36,1) both; }
        .fps-float  { animation: fpsImageFloat 6s ease-in-out infinite; }
        .fps-ring   { animation: fpsRingPulse 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fps-reveal, .fps-float, .fps-ring { animation: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="fps-reveal text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF0E2] text-[#C96A1F] text-xs font-bold uppercase tracking-widest border border-[#C96A1F]/15">
            <Sparkles size={14} />
            <span>ONE AT A TIME</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#285B3C]"
            style={{ fontFamily: "Playfair Display, Cormorant Garamond, serif" }}
          >
            Meet the range
          </h2>
          <div className="w-16 h-1 bg-[#285B3C]/30 mx-auto rounded-full mt-2" />
        </div>

        <div className="space-y-20 md:space-y-28">
          {spotlightProducts.map((product, idx) => {
            const reversed = idx % 2 === 1;
            const img = product.image_url ? getImageUrl(product.image_url) : null;

            return (
              <div
                key={product.id}
                className={`fps-reveal grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                {/* Image side */}
                <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
                  <div
                    className="fps-ring absolute inset-6 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(232,141,54,0.16) 0%, transparent 70%)",
                    }}
                  />
                  <div
                    className="absolute inset-10 rounded-full border"
                    style={{ borderColor: "rgba(49,94,66,0.15)" }}
                  />

                  {img ? (
                    <img
                      src={img}
                      alt={product.name}
                      className="fps-float relative z-10 w-3/4 max-w-[320px] object-contain"
                      style={{
                        filter:
                          "drop-shadow(0 30px 40px rgba(80,40,10,0.28))",
                      }}
                    />
                  ) : (
                    <div
                      className="fps-float relative z-10 flex h-40 w-40 items-center justify-center rounded-full text-white"
                      style={{
                        background: "linear-gradient(135deg, #315E42, #1E3D28)",
                        boxShadow: "0 20px 40px rgba(49,94,66,0.32)",
                      }}
                    >
                      <Leaf size={56} strokeWidth={1.2} />
                    </div>
                  )}
                </div>

                {/* Story side */}
                <div className="text-center lg:text-left">
                  <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
                    <span className="h-[2px] w-8 bg-gradient-to-r from-[#C04422] to-[#E88D36]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C04422]">
                      {(typeof product.category === "string"
                        ? product.category
                        : product.category?.name) || "Jacral Selection"}
                    </span>
                  </div>

                  <h3
                    className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#28221D] mb-4"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {product.name}
                  </h3>

                  <p className="mx-auto max-w-md text-[15px] leading-relaxed text-[#685B55] lg:mx-0">
                    {product.description}
                  </p>

                  <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    <span className="text-2xl font-black text-[#28221D]">
                      ₹{product.price}
                    </span>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => addToCart(product.id, 1)}
                        disabled={Number(product.stock) <= 0}
                        className="flex items-center gap-2 rounded-full px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #E88D36 0%, #C96A1F 100%)",
                          boxShadow: "0 10px 24px rgba(200,100,20,0.32)",
                        }}
                      >
                        <ShoppingBag size={14} />
                        {Number(product.stock) <= 0 ? "Sold out" : "Add to cart"}
                      </button>

                      <Link
                        to={`/product/${product.id}`}
                        className="flex items-center gap-1.5 rounded-full border-2 border-[#302923] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-[#302923] transition-colors hover:bg-[#302923] hover:text-white"
                      >
                        View
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
