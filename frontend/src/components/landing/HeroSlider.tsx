import { useState, useEffect, useRef, useCallback } from "react";
import HeroSlide from "./HeroSlide";
import HeroNavigation from "./HeroNavigation";
import type { HeroSlide as HeroSlideType } from "../../types/landingPage";

interface HeroSliderProps {
  slides?: HeroSlideType[];
}

// No hardcoded default slides — only admin-uploaded slides will be shown.

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  // Only show slides that are active AND have an admin-uploaded image
  const activeSlides = slides.filter((s) => s.is_active && s.image_url);
  const total = activeSlides.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay with pause on hover
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [total, isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  if (total === 0) {
    return (
      <section className="relative w-full h-[400px] sm:h-[540px] md:h-[620px] bg-[#FAF6EE] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E5EEDB] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#285B3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 9 4-4 4 4 4-4 4 4" /><path d="m3 15 4-4 4 4 4-4 4 4" /></svg>
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-[#285B3C]">
            JACRAL – Upload hero slides from the Admin Panel
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[540px] md:h-[620px] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="JACRAL Featured Slides"
    >
      {/* Slides Deck */}
      {activeSlides.map((slide, index) => (
        <HeroSlide
          key={slide.id || index}
          slide={slide}
          isActive={index === currentIndex}
        />
      ))}

      {/* Navigation Controls */}
      <HeroNavigation
        total={total}
        current={currentIndex}
        onSelect={(idx) => setCurrentIndex(idx)}
        onPrev={prevSlide}
        onNext={nextSlide}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
      />
    </section>
  );
}
