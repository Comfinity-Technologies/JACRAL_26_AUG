import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Truck } from "lucide-react";

export default function ShopCTASection() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl md:rounded-[2.5rem] bg-[#2C221E] text-white overflow-hidden p-8 sm:p-12 md:p-16 lg:p-20 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#E88D36]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#3B6E4C]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FFB800] text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} className="text-[#FFB800]" />
            <span>START YOUR HEALTHIER MORNING ROUTINE</span>
          </div>

          {/* Heading */}
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.1] text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            EXPERIENCE THE POWER OF UNRIPE JACKFRUIT
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Ready-to-eat cereal milled from green jackfruit bulbs and seeds. 20% protein, 25% dietary fiber, and zero sugar. Made for sustained morning energy.
          </p>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold uppercase tracking-wider text-white/90">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-[#3B6E4C]" /> 100% Natural Ingredients
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={15} className="text-[#FFB800]" /> Fast Shipping Across India
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#E88D36]" /> Secure Payments
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#E88D36] text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-[#E88D36]/30 hover:bg-[#D47E2A] hover:scale-105 transition-all"
            >
              <span>SHOP JACRAL CEREAL NOW</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
