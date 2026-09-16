import { useState } from "react";
import { ArrowRight, Check, Percent, Sparkles } from "lucide-react";

export default function CouponPromoSection() {
  const [copied, setCopied] = useState(false);
  const couponCode = "JACRAL10";

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="relative w-full bg-[#E33421] overflow-hidden flex items-center justify-center">
      {/* Subtle floating leaves around the banner matching Video 1 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Left leaf */}
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="absolute left-[12%] top-1 w-5 h-2 opacity-20 rotate-[-25deg] invert"
        />
        {/* Right leaf */}
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="absolute right-[14%] bottom-1 w-5 h-5 opacity-20 rotate-[35deg] invert"
        />
      </div>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy coupon code JACRAL10 for 10% off"
        className="group relative w-full flex items-center justify-center gap-3 sm:gap-6 px-4 py-2 sm:py-2.5 hover:bg-[#C92919] active:bg-[#B32315] transition-all duration-200 cursor-pointer"
      >
        {/* Left: Percent Icon Badge */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-sm flex-shrink-0">
          <Percent size={16} strokeWidth={3} />
        </div>

        {/* Center Text */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base font-bold tracking-wide text-center">
          <span className="text-white drop-shadow-md">GET 10% OFF ON YOUR FIRST ORDER</span>
          <span className="text-white/60 hidden sm:inline">|</span>
          <span className="text-[#FFE394] font-black uppercase tracking-wider drop-shadow-md flex items-center gap-2 text-lg sm:text-xl">
            USE CODE: <span className="underline decoration-dotted decoration-[#FFE394]/70">{couponCode}</span>
          </span>
        </div>

        {/* Right Action Button / Indicator */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#E33421] group-hover:bg-[#FFE394] group-hover:scale-110 transition-all flex-shrink-0 shadow-sm">
          {copied ? (
            <Check size={16} strokeWidth={3} className="text-[#285B3C]" />
          ) : (
            <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
          )}
        </div>

        {/* Copied Floating Toast */}
        {copied && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#285B3C] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-white/20 animate-fade-in flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#FFE394]" />
            <span>Coupon Copied!</span>
          </div>
        )}
      </button>
    </section>
  );
}
