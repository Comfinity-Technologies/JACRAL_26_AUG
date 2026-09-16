import { useState, useEffect, useRef } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { useReviews } from "../../hooks/useReviews";
import { getImageUrl } from "../../utils/image";

interface ReviewItem {
  id: number;
  customer_name: string;
  customer_location?: string | null;
  customer_image_url?: string | null;
  review_text: string;
  rating: number;
}

const DEFAULT_REVIEWS: ReviewItem[] = [];

export default function ReviewsSection() {
  const { reviews } = useReviews();
  const [items, setItems] = useState<ReviewItem[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      setItems(reviews);
    } else {
      setItems(DEFAULT_REVIEWS);
    }
  }, [reviews]);

  if (items.length === 0) return null;

  // Render initials avatar if no image
  const renderAvatar = (name: string, imageUrl?: string | null) => {
    if (imageUrl) {
      return (
        <img
          src={getImageUrl(imageUrl)}
          alt={name}
          className="w-16 h-16 object-cover rounded shadow-md border-2 border-white"
        />
      );
    }
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    return (
      <div className="w-16 h-16 rounded shadow-md border-2 border-white bg-[#3B6E4C] text-white flex items-center justify-center text-xl font-bold">
        {initials}
      </div>
    );
  };

  return (
    <section id="reviews" className="relative bg-gradient-to-br from-[#FFB703] to-[#FB8500] overflow-hidden py-24 sm:py-32">
      {/* Background Leaves & Grains (Decorative) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-24">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-[#3B6E4C]" />
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#3B6E4C]">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" />
              <path d="M11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="currentColor" />
            </svg>
            <span className="w-12 h-[1px] bg-[#3B6E4C]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1E3B27]"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-[#4A433E] uppercase tracking-[0.2em] font-semibold mt-4">
            REAL PEOPLE • REAL EXPERIENCES • NATURAL RESULTS
          </p>
        </div>

        {/* ── Hanging Reviews Layout ── */}
        <div className="relative max-w-6xl mx-auto">
          {/* Ribbon SVG */}
          <div className="absolute top-0 sm:top-0 left-20 right-20 h-30 pointer-events-none hidden md:block">
            <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="none">
              <path
                d="M-100,50 C200,150 400,-20 600,80 C800,180 1000,20 1300,100"
                stroke="#0e7e3bff"
                strokeWidth="28"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-6 relative z-10 mt-8 md:mt-0 px-4 md:px-0">
            {items.slice(0, 3).map((item, idx) => {
              // Create staggered "hanging" effect based on index
              const marginTop = idx === 0 ? "md:mt-13" : idx === 1 ? "md:mt-13" : "md:mt-13";
              const rotate = idx === 0 ? "rotate-[-3deg]" : idx === 1 ? "rotate-[2deg]" : "rotate-[-1deg]";

              return (
                <div key={item.id} className={`relative flex flex-col items-center ${marginTop}`}>

                  {/* String & Pin (Hidden on mobile for simplicity, or keep small) */}
                  <div className="hidden md:flex flex-col items-center -mb-2 z-20">
                    <div className="w-1 h-16 sm:h-24 bg-gradient-to-b from-[#A57C43] to-[#E5C185]" />
                    <div className="w-4 h-4 rounded-full border-4 border-[#C79D5C] bg-[#FFF9E6] shadow-md z-30 -mt-2" />
                  </div>

                  {/* Card */}
                  <div
                    className={`
                      w-full bg-[#FFFBF0] rounded-2xl p-6 sm:p-8 
                      shadow-[0_15px_35px_rgba(40,20,5,0.08)] 
                      border border-[#EBDCC5] ${rotate}
                      transition-transform duration-300 hover:scale-[1.02] hover:rotate-0
                      relative overflow-hidden
                    `}
                  >
                    {/* Top tape/clip illusion */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-white/50 backdrop-blur-sm shadow-sm opacity-50" />

                    <div className="flex gap-4 sm:gap-6">
                      <div className="flex-shrink-0">
                        {renderAvatar(item.customer_name, item.customer_image_url)}
                        <div className="mt-4 flex flex-col items-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#7DA362]" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-3">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} size={16} className="fill-[#F0B429] text-[#F0B429]" />
                          ))}
                        </div>

                        <p className="text-[#3E4E42] text-sm sm:text-base leading-relaxed italic mb-4">
                          &ldquo;{item.review_text}&rdquo;
                        </p>

                        <div>
                          <h4 className="font-bold text-[#1E3B27] text-base">{item.customer_name}</h4>
                          <div className="flex items-center gap-1 mt-1 text-[#3B6E4C] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} strokeWidth={2.5} />
                            <span>Verified Buyer</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
