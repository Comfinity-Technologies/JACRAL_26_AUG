import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HeroNavigationProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export default function HeroNavigation({
  total,
  current,
  onSelect,
  onPrev,
  onNext,
}: HeroNavigationProps) {
  if (total <= 1) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          LEFT ARROW
          ===================================================== */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous slide"
        className="absolute left-4 sm:left-7 md:left-10 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm text-[#3B6E4C] flex items-center justify-center shadow-lg border border-white/70 hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E88D36]"
      >
        <ChevronLeft
          size={22}
          strokeWidth={2}
        />
      </button>

      {/* =====================================================
          RIGHT ARROW
          ===================================================== */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next slide"
        className="absolute right-4 sm:right-7 md:right-10 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm text-[#3B6E4C] flex items-center justify-center shadow-lg border border-white/70 hover:bg-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E88D36]"
      >
        <ChevronRight
          size={22}
          strokeWidth={2}
        />
      </button>

      {/* =====================================================
          SLIDE INDICATORS
          ===================================================== */}
      <div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5"
        role="tablist"
        aria-label="Hero slides"
      >
        {Array.from({ length: total }).map(
          (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={
                index === current
              }
              aria-label={`Go to slide ${index + 1
                }`}
              onClick={() =>
                onSelect(index)
              }
              className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E88D36] ${index === current
                  ? "w-8 h-2.5 bg-[#E88D36]"
                  : "w-2.5 h-2.5 bg-white/80 border border-[#3B6E4C]/30 hover:bg-white"
                }`}
            />
          )
        )}
      </div>
    </>
  );
}