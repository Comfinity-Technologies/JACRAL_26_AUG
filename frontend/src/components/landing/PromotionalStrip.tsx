import { Sparkles } from "lucide-react";

export default function PromotionalStrip() {
  const items = [
    "🌿 100% Wild Unripe Jackfruit",
    "⚡ 20% Natural Plant Protein",
    "🥣 25% Prebiotic Dietary Fiber",
    "🚫 Zero Added Sugar · Zero Preservatives",
    "🌾 Sustained Energy · Low Glycemic Index",
    "📦 Farm-Direct Batch Processing",
  ];

  return (
    <div className="w-full bg-[#3B6E4C] text-[#FAF6EE] py-3.5 border-y border-[#2E583C] overflow-hidden">
      <div className="flex whitespace-nowrap marquee-track font-bold uppercase tracking-[0.14em] text-[11px] sm:text-xs">
        {[...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-6 mx-4">
            <span>{item}</span>
            <Sparkles size={12} className="text-[#FFB800]" />
          </div>
        ))}
      </div>
    </div>
  );
}
