import { useState, useEffect } from "react";

interface VideoIntroProps {
  onComplete: () => void;
  logoUrl?: string | null;
}

export default function VideoIntro({ onComplete, logoUrl }: VideoIntroProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Phase 1: Video plays first for 2.2 seconds without logo
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 2200);

    // Phase 2: Show logo animation, then start fading out at 4.2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4200);

    // Phase 3: Transition to website at 4.7 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4700);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 1. Opening Video layer */}
      <video
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={() => setFadeOut(true)}
      >
        <source src="/intro_video.mp4" type="video/mp4" />
      </video>

      {/* Dark blur backdrop for logo phase */}
      {showLogo && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px] transition-opacity duration-500" />
      )}

      {/* 2. Logo phase (appears after video plays) */}
      {showLogo && (
        <div
          className="relative z-10 flex flex-col items-center gap-5 select-none px-4 text-center"
          style={{ animation: "introLogoPop 0.8s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <style>{`
            @keyframes introLogoPop {
              0%   { opacity: 0; transform: scale(0.78) translateY(24px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes introTaglineGlow {
              0%, 100% { opacity: 0.75; }
              50%       { opacity: 1; }
            }
          `}</style>
          <img
            src={logoUrl || "/images/brand/jacral_navbar_logo.png"}
            alt="JACRAL"
            className="w-48 sm:w-64 max-h-28 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.6)]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/brand/jacral_navbar_logo.png";
            }}
          />
          <p
            className="text-white text-xs sm:text-sm font-bold uppercase tracking-[0.35em]"
            style={{ animation: "introTaglineGlow 2s ease-in-out infinite" }}
          >
            Nature's Goodness In Every Bite
          </p>
        </div>
      )}
    </div>
  );
}
