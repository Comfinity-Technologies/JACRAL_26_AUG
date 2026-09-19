import { useState } from "react";
import { Percent, Check, Copy } from "lucide-react";
import { useFeaturedCoupons, type FeaturedCoupon } from "../../hooks/useFeaturedCoupons";

function formatDiscount(c: FeaturedCoupon): string {
  return c.discount_type === "percentage"
    ? `${Number(c.discount_value)}% OFF`
    : `₹${Number(c.discount_value)} OFF`;
}

function CouponPill({
  coupon,
  onCopy,
  copiedCode,
}: {
  coupon: FeaturedCoupon;
  onCopy: (code: string) => void;
  copiedCode: string | null;
}) {
  const isCopied = copiedCode === coupon.code;

  return (
    <button
      type="button"
      onClick={() => onCopy(coupon.code)}
      aria-label={`Copy coupon code ${coupon.code} for ${formatDiscount(coupon)}`}
      className="group inline-flex flex-shrink-0 items-center gap-3 px-6 py-1.5 mx-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors cursor-pointer"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white flex-shrink-0">
        <Percent size={12} strokeWidth={3} />
      </span>

      <span className="text-white/90 font-semibold text-xs sm:text-sm whitespace-nowrap">
        {coupon.description || "LIMITED TIME OFFER"}
      </span>

      <span className="text-white/40">|</span>

      <span className="text-[#FFE394] font-black uppercase tracking-wider text-sm sm:text-base whitespace-nowrap flex items-center gap-1.5">
        {coupon.code}
        {isCopied ? (
          <Check size={13} strokeWidth={3} className="text-[#FFE394]" />
        ) : (
          <Copy size={13} strokeWidth={2.5} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        )}
      </span>

      <span className="text-white/40">|</span>

      <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">
        {formatDiscount(coupon)}
      </span>
    </button>
  );
}

export default function CouponPromoSection() {
  const { coupons, isLoading } = useFeaturedCoupons();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (isLoading || coupons.length === 0) {
    return null;
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 2000);
  };

  // Repeat the coupon set enough times that it always spans well past the
  // widest screen (so the strip never looks empty with only 1-2 coupons),
  // then duplicate that whole run once so the marquee can loop seamlessly
  // at -50% with no visible seam or jump, no matter how many coupons are
  // currently featured.
  const MIN_REPEATS = 8;
  const repeatCount = Math.max(1, Math.ceil(MIN_REPEATS / coupons.length));
  const baseRun = Array.from({ length: repeatCount }, () => coupons).flat();
  const track = [...baseRun, ...baseRun];

  return (
    <section className="relative w-full bg-[#E33421] overflow-hidden">
      <style>{`
        @keyframes couponMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .coupon-marquee-track {
          animation: couponMarquee 28s linear infinite;
        }
        .coupon-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .coupon-marquee-track {
            animation: none;
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-20 z-10"
        style={{ background: "linear-gradient(90deg, #E33421 0%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-20 z-10"
        style={{ background: "linear-gradient(270deg, #E33421 0%, transparent 100%)" }}
      />

      <div className="flex w-max coupon-marquee-track py-2.5 sm:py-3">
        {track.map((coupon, i) => (
          <CouponPill
            key={`${coupon.code}-${i}`}
            coupon={coupon}
            onCopy={handleCopy}
            copiedCode={copiedCode}
          />
        ))}
      </div>
    </section>
  );
}