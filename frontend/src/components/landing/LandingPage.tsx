import LandingNavbar from "./LandingNavbar";
import HeroSlider from "./HeroSlider";
import ProductsSection from "./ProductsSection";
import CouponPromoSection from "./CouponPromoSection";
import NaturalGoodnessSection from "./NaturalGoodnessSection";
import RibbonDivider from "./RibbonDivider";
import HowToUseSection from "./HowToUseSection";
import ReviewsSection from "./ReviewsSection";
import LeaderboardSection from "./LeaderboardSection";
import Footer from "../customer/Footer";
import { useLandingPage } from "../../hooks/useLandingPage";

interface LandingPageProps {
  showNavFooter?: boolean;
}

export default function LandingPage({ showNavFooter = false }: LandingPageProps) {
  const { data } = useLandingPage();

  const brand = data?.brand;
  const slides = data?.hero_slides || [];
  const sections = data?.sections || {};

  const howSec = sections["how_to_use"];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E] font-sans antialiased selection:bg-[#E88D36] selection:text-white">

      {/* ── 1. HEADER / NAVIGATION (WHEN STANDALONE) ── */}
      {showNavFooter && <LandingNavbar brand={brand} />}

      {/* ── 2. HERO SLIDER ── */}
      <HeroSlider slides={slides} />

      {/* ── 3. PRODUCTS SECTION (GREEN STRIP + 2 EQUAL FEATURED CARDS) ── */}
      <ProductsSection section={sections["products_section"]} />
      {/* ── 5. COUPON PROMO STRIP (RED RIBBON BANNER) ── */}
      <CouponPromoSection />

      {/* ── 4. LEADERBOARD (TOP PURCHASERS) — Just below Our Products ── */}
      <LeaderboardSection />


      {/* ── 6. NATURAL GOODNESS (MASCOT + SERVING BOARD SHOWCASE) ── */}
      <NaturalGoodnessSection brand={brand} section={sections["natural_goodness"]} />

      {/* ── 7. RIBBON DIVIDER (3D WAVED STITCHED RIBBON) ── */}
      <RibbonDivider />

      {/* ── 8. HOW TO ENJOY (4 STEP CARDS WITH CONNECTOR) ── */}
      <HowToUseSection section={howSec} />

      {/* ── 9. CUSTOMER REVIEWS (YELLOW/WARM CARDS + HANGING ANIMATION) ── */}
      <ReviewsSection />

      {/* ── 10. FOOTER (WHEN STANDALONE) ── */}
      {showNavFooter && <Footer />}

    </div>
  );
}