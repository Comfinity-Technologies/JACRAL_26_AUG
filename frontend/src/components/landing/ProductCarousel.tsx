import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../customer/ProductCard";
import type { ProductCardItem } from "../customer/ProductCard";

interface ProductCarouselProps {
  products: ProductCardItem[];
  onAddToCart?: (product: any) => Promise<void> | void;
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    if (offsetWidth > 0) {
      const idx = Math.round(scrollLeft / (offsetWidth * 0.8));
      setActiveIndex(Math.min(idx, Math.max(0, products.length - 1)));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateIndex);
  }, [products.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 380;
      const offset = direction === "left" ? -(cardWidth + 28) : (cardWidth + 28);
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 380;
    scrollRef.current.scrollTo({ left: index * (cardWidth + 28), behavior: "smooth" });
    setActiveIndex(index);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* ── TOP CONTROLS (ARROWS) ── */}
      {products.length > 1 && (
        <div className="flex items-center justify-end gap-3 mb-6">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous product"
            className="w-11 h-11 rounded-full border-2 border-[#2C221E]/15 bg-white text-[#2C221E] hover:bg-[#3B6E4C] hover:text-white hover:border-[#3B6E4C] transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next product"
            className="w-11 h-11 rounded-full border-2 border-[#2C221E]/15 bg-white text-[#2C221E] hover:bg-[#3B6E4C] hover:text-white hover:border-[#3B6E4C] transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── CAROUSEL TRACK (LARGER CARD SIZE) ── */}
      <div
        ref={scrollRef}
        className="flex gap-6 sm:gap-7 lg:gap-8 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[86vw] max-w-[370px] sm:w-[calc(50%-14px)] lg:w-[calc(33.333%-18px)] flex-shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* ── PAGINATION DOTS (● ○ ○) ── */}
      {products.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {products.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to product slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeIndex
                  ? "w-8 h-2 bg-[#3B6E4C]"
                  : "w-2 h-2 bg-[#D4C8C6] hover:bg-[#A8988E]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
