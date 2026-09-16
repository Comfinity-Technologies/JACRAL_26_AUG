import { useState, useEffect } from "react";
import { getImageUrl } from "../../utils/image";
import type { BrandInfo } from "../../types/landingPage";

interface NaturalGoodnessSectionProps {
  brand?: BrandInfo | null;
}

const MASCOT_POSES = [
  {
    src: "/images/mascot/mascot_crop_3.png",
    alt: "JACRAL Mascot - Thumbs Up & Pointing",
    title: "100% Natural Power",
  },
  {
    src: "/images/mascot/mascot_crop_1.png",
    alt: "JACRAL Mascot - Welcoming Gesture",
    title: "Sustained Energy",
  },
  {
    src: "/images/mascot/mascot_crop_2.png",
    alt: "JACRAL Mascot - Confident & Fit",
    title: "Healthy Choice",
  },
];

export default function NaturalGoodnessSection({ brand }: NaturalGoodnessSectionProps) {
  const [activePoseIdx, setActivePoseIdx] = useState(0);

  // Resolve the product image: admin-uploaded takes priority, fallback to default
  const productImageUrl = brand?.natural_goodness_image_url
    ? getImageUrl(brand.natural_goodness_image_url)
    : "/images/products_serving_board_clean.jpg";

  // Auto-cycle through the 3 boy mascot poses smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePoseIdx((prev) => (prev + 1) % MASCOT_POSES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="natural-goodness"
      className="relative overflow-hidden py-16 sm:py-24 bg-[#FAF6EE] select-none"
    >
      <style>{`
        @keyframes ngFloatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes ngFloatMedium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes ngPulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.06); }
        }
        @keyframes mascotSway {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        .ng-float-slow   { animation: ngFloatSlow 6s ease-in-out infinite; }
        .ng-float-medium { animation: ngFloatMedium 5s ease-in-out infinite; }
        .ng-glow         { animation: ngPulseGlow 7s ease-in-out infinite; }
        .mascot-sway     { animation: mascotSway 4.5s ease-in-out infinite; }
      `}</style>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="ng-glow absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(245,228,176,0.6) 0%, transparent 70%)" }}
        />

        {/* Drifting Leaves */}
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="ng-float-slow absolute left-[8%] top-[12%] w-12 h-12 opacity-80 rotate-[-20deg]"
        />
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="ng-float-medium absolute right-[12%] top-[18%] w-10 h-10 opacity-75 rotate-[25deg]"
        />
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="ng-float-slow absolute right-[6%] bottom-[20%] w-14 h-14 opacity-80 rotate-[-15deg]"
        />
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="ng-float-medium absolute left-[15%] bottom-[10%] w-10 h-10 opacity-60 rotate-[40deg]"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── On mobile: top row = mascot boy + title side by side; bottom = product image ── */}
        {/* ── On desktop: left=mascot (5 cols), right=title+image (7 cols) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">

          {/* Left Column: Mascot Cycling 3 Poses */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">

            {/* Mobile: mascot + title in one flex row */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end w-full lg:w-auto gap-4 lg:gap-0">

              <div
                className="mascot-sway relative flex-shrink-0 w-[140px] h-[180px] sm:w-[200px] sm:h-[240px] md:w-[320px] md:h-[380px] lg:w-[420px] lg:h-[530px] flex items-end justify-center cursor-pointer overflow-visible"
                onClick={() => setActivePoseIdx((prev) => (prev + 1) % MASCOT_POSES.length)}
                title="Click to change pose"
              >
                {/* 3 Mascot Poses with smooth opacity crossfade */}
                {MASCOT_POSES.map((pose, idx) => (
                  <img
                    key={pose.src}
                    src={pose.src}
                    alt={pose.alt}
                    className={`absolute bottom-0 w-full h-full object-contain object-bottom transition-opacity duration-700 ease-in-out ${
                      idx === activePoseIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                    style={{
                      filter: "drop-shadow(0 18px 30px rgba(50,30,10,0.14))",
                    }}
                  />
                ))}
              </div>

              {/* Mobile-only: Title + subtitle shown beside mascot */}
              <div className="lg:hidden flex flex-col items-start justify-center flex-1 min-w-0">
                <h2
                  className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#285B3C] leading-tight"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  NATURAL<br />GOODNESS
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="h-px w-5 bg-[#3B6E4C]/40" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-[#3B6E4C] leading-snug">
                    HEALTHY YOU · BETTER TOMORROW
                  </span>
                </div>
              </div>
            </div>

            {/* Pose Indicator Dots */}
            <div className="flex items-center gap-2 mt-3 z-20">
              {MASCOT_POSES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePoseIdx(idx)}
                  aria-label={`Show pose ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activePoseIdx
                      ? "w-6 bg-[#285B3C]"
                      : "w-2 bg-[#285B3C]/25 hover:bg-[#285B3C]/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Title & Serving Board */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Desktop-only Header Section */}
            <div className="hidden lg:block mb-6 sm:mb-8 space-y-2.5">
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#285B3C]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                NATURAL GOODNESS
              </h2>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="h-px w-6 sm:w-8 bg-[#3B6E4C]/40" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.24em] text-[#3B6E4C]">
                  HEALTHY YOU &nbsp;·&nbsp; BETTER TOMORROW
                </span>
                <span className="h-px w-6 sm:w-8 bg-[#3B6E4C]/40" />
              </div>
            </div>

            {/* Serving Board / Product Image */}
            <div className="relative w-full max-w-[680px] rounded-3xl overflow-hidden shadow-[0_16px_45px_rgba(70,40,15,0.14)] border border-[#E8DFC9]/80 bg-white/40 backdrop-blur-sm group">
              <img
                src={productImageUrl}
                alt="JACRAL Natural Goodness Product"
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
