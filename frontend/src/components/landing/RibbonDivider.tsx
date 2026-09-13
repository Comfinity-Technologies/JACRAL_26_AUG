import { Leaf } from "lucide-react";

/**
 * RIBBON DIVIDER
 * A flowing 3D-style ribbon that visually carries the eye from the
 * Products section down into the How To Use section. Pure SVG + CSS,
 * no extra dependencies.
 */
export default function RibbonDivider() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "150px", marginTop: "-1px", marginBottom: "-1px" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes ribbonFlow {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -240; }
        }
        @keyframes ribbonBob {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes ribbonLeafDrift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-5px) rotate(8deg); }
        }
        .ribbon-flow-line { animation: ribbonFlow 3.2s linear infinite; }
        .ribbon-bob { animation: ribbonBob 5s ease-in-out infinite; }
        .ribbon-leaf { animation: ribbonLeafDrift 4.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ribbon-flow-line, .ribbon-bob, .ribbon-leaf { animation: none !important; }
        }
      `}</style>

      <svg
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        className="ribbon-bob absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="ribbonRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8F2C16" />
            <stop offset="35%" stopColor="#E05A35" />
            <stop offset="50%" stopColor="#F47C4F" />
            <stop offset="65%" stopColor="#E05A35" />
            <stop offset="100%" stopColor="#8F2C16" />
          </linearGradient>
          <linearGradient id="ribbonRedDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5F1A0C" />
            <stop offset="50%" stopColor="#9C3A20" />
            <stop offset="100%" stopColor="#5F1A0C" />
          </linearGradient>
        </defs>

        {/* Underside of the ribbon (gives the 3D twist / shadow) */}
        <path
          d="M0,70 C240,140 420,10 720,60 C1020,110 1200,10 1440,55 L1440,95 C1200,50 1020,150 720,100 C420,50 240,180 0,110 Z"
          fill="url(#ribbonRedDark)"
          opacity="0.9"
        />

        {/* Top ribbon surface */}
        <path
          d="M0,55 C240,125 420,-5 720,45 C1020,95 1200,-5 1440,40 L1440,78 C1200,33 1020,133 720,83 C420,33 240,163 0,93 Z"
          fill="url(#ribbonRed)"
        />

        {/* Highlight seam running along the ribbon, animated to feel like it's flowing */}
        <path
          d="M0,62 C240,132 420,2 720,52 C1020,102 1200,2 1440,47"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
          strokeDasharray="10 14"
          className="ribbon-flow-line"
        />
      </svg>

      {/* small leaves drifting along the ribbon */}
      <Leaf
        className="ribbon-leaf absolute text-[#2F6B3E]"
        style={{ left: "18%", top: "18px" }}
        size={20}
        strokeWidth={1.6}
      />
      <Leaf
        className="ribbon-leaf absolute text-[#2F6B3E]"
        style={{ right: "22%", top: "34px", animationDelay: "1.4s" }}
        size={16}
        strokeWidth={1.6}
      />
      <Leaf
        className="ribbon-leaf absolute text-[#2F6B3E]"
        style={{ left: "48%", top: "6px", animationDelay: "2.6s" }}
        size={14}
        strokeWidth={1.6}
      />
    </div>
  );
}
