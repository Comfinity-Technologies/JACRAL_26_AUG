import { useState, useEffect } from "react";
import { Coffee, Soup, Heart, Zap, Sparkles } from "lucide-react";
import { apiClient } from "../../api/client";
import { getImageUrl } from "../../utils/image";
import type { LandingPageSection } from "../../types/landingPage";

interface HowToUseStep {
  id?: number;
  step_number: number;
  title: string;
  description: string;
  image_url?: string | null;
}

const DEFAULT_STEPS: HowToUseStep[] = [
  {
    step_number: 1,
    title: "POUR 35g CEREAL",
    description: "Measure 35g (approx. 4 tbsp) of crunchy Jacral jackfruit cereal into your bowl.",
  },
  {
    step_number: 2,
    title: "ADD MILK OR MILK ALTERNATIVE",
    description: "Pour 150ml of warm or chilled milk, almond milk, or coconut milk over the flakes.",
  },
  {
    step_number: 3,
    title: "STIR & WAIT 1 MINUTE",
    description: "Give it a soft stir and let the natural jackfruit fibers soften slightly.",
  },
  {
    step_number: 4,
    title: "ENJOY ZERO-GUILT ENERGY",
    description: "Relish 20% protein, 25% prebiotic fiber with zero added sugar and full morning vitality!",
  },
];

interface HowToUseSectionProps {
  section?: LandingPageSection;
}

export default function HowToUseSection({ section }: HowToUseSectionProps) {
  const [steps, setSteps] = useState<HowToUseStep[]>(DEFAULT_STEPS);

  useEffect(() => {
    apiClient
      .get("/api/v1/content/how-to-use")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSteps(res.data);
        }
      })
      .catch(() => {
        if (section?.content?.steps && Array.isArray(section.content.steps)) {
          setSteps(section.content.steps);
        }
      });
  }, [section]);

  return (
    <section id="how-to-use" className="py-20 bg-[#FAF6EE] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B6E4C]/10 text-[#3B6E4C] text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} />
            <span>SIMPLE & QUICK PREPARATION</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-[#2C221E] tracking-tight">
            {section?.title || "HOW TO ENJOY YOUR JACRAL CEREAL"}
          </h2>
          <p className="text-sm text-[#685B55] font-medium leading-relaxed">
            {section?.subtitle || "Ready in under 2 minutes. Fuel your active day with clean, gut-healthy plant nutrition."}
          </p>
        </div>

        {/* 4 Step Cards Grid with Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="relative group bg-white rounded-3xl p-6 border border-[#E5DCDB] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3B6E4C] text-white font-black text-sm shadow-md">
                    0{step.step_number || idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E88D36]">
                    STEP {step.step_number || idx + 1}
                  </span>
                </div>

                {/* Optional Step Image */}
                {step.image_url ? (
                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-5 bg-[#FAF6EE] flex items-center justify-center p-2">
                    <img
                      src={getImageUrl(step.image_url)}
                      alt={step.title}
                      className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-2xl mb-5 bg-[#FAF6EE] flex items-center justify-center text-[#3B6E4C]/40 group-hover:text-[#3B6E4C] transition-colors">
                    {idx === 0 && <Soup size={36} />}
                    {idx === 1 && <Coffee size={36} />}
                    {idx === 2 && <Zap size={36} />}
                    {idx === 3 && <Heart size={36} />}
                  </div>
                )}

                {/* Step Title & Description */}
                <h3 className="text-base font-black uppercase text-[#2C221E] mb-2 group-hover:text-[#3B6E4C] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-[#685B55] leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              {/* Bottom decorative bar */}
              <div className="mt-6 pt-4 border-t border-[#FAF6EE] flex items-center justify-between text-[11px] font-bold text-[#E88D36] uppercase tracking-wider">
                <span>Healthy Choice</span>
                <span>✓</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
