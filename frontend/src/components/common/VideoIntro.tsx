import { useState, useEffect } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fading out after 3.5 seconds so it's fully gone at 4 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3500);

    // Call onComplete after 4 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Video layer */}
      <video
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/intro_video.mp4" type="video/mp4" />
      </video>

      {/* Logo overlay — always visible on top of video */}
      <div className="relative z-10 flex flex-col items-center gap-6 select-none"
        style={{ animation: "introLogoReveal 1s ease both" }}
      >
        <style>{`
          @keyframes introLogoReveal {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes introPulse {
            0%, 100% { opacity: 0.7; }
            50%       { opacity: 1; }
          }
        `}</style>
        <img
          src="/images/brand/jacral_navbar_logo.png"
          alt="JACRAL"
          className="w-48 sm:w-64 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <p
          className="text-white/70 text-sm font-bold uppercase tracking-[0.4em]"
          style={{ animation: "introPulse 2s ease-in-out infinite" }}
        >
          Nature's Goodness In Every Bite
        </p>
      </div>
    </div>
  );
}
