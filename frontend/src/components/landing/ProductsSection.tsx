import type { ReactNode } from "react";
import { Leaf, Truck, ShieldCheck, Heart, Sparkles } from "lucide-react";
import ProductCard from "../customer/ProductCard";
import { useProducts } from "../../hooks/useProducts";

interface ProductsSectionProps {
  section?: any;
}

export default function ProductsSection({ section }: ProductsSectionProps = {}) {
  const { products, isLoading } = useProducts();

  const activeProducts = products.filter((product) => product.is_active !== false);

  return (
    <section
      id="products"
      className="
        relative
        isolate
        overflow-hidden
      "
      style={{
        background:
          "linear-gradient(160deg, #F8EED9 0%, #F2E4C5 35%, #EDE0C8 65%, #F0E8D0 100%)",
      }}
    >
      {/* =========================================================
          SECTION ANIMATION + DECORATIVE KEYFRAMES
          ========================================================= */}

      <style>
        {`
          @keyframes jacralFloatSlow {
            0%, 100% {
              transform: translate3d(0, 0, 0) rotate(0deg);
            }

            50% {
              transform: translate3d(0, -12px, 0) rotate(1.5deg);
            }
          }

          @keyframes jacralFloatMedium {
            0%, 100% {
              transform: translate3d(0, 0, 0) rotate(0deg);
            }

            50% {
              transform: translate3d(5px, -9px, 0) rotate(-2deg);
            }
          }

          @keyframes jacralDrift {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }

            50% {
              transform: translate3d(0, -7px, 0);
            }
          }

          @keyframes jacralReveal {
            from {
              opacity: 0;
              transform: translateY(28px) scale(.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes jacralSoftPulse {
            0%, 100% {
              opacity: .25;
            }

            50% {
              opacity: .55;
            }
          }

          @keyframes cerealFlowRight {
            0% {
              transform: translate3d(-150px, 0, 0) rotate(0deg);
              opacity: 0;
            }
            12% {
              opacity: 0.95;
            }
            88% {
              opacity: 0.95;
            }
            100% {
              transform: translate3d(calc(100vw + 150px), 30px, 0) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes cerealFlowLeft {
            0% {
              transform: translate3d(calc(100vw + 150px), 0, 0) rotate(0deg);
              opacity: 0;
            }
            12% {
              opacity: 0.95;
            }
            88% {
              opacity: 0.95;
            }
            100% {
              transform: translate3d(-150px, -30px, 0) rotate(-360deg);
              opacity: 0;
            }
          }

          .cereal-flow-track-1 {
            animation: cerealFlowRight 15s linear infinite 0s;
          }

          .cereal-flow-track-2 {
            animation: cerealFlowLeft 18s linear infinite 3s;
          }

          .cereal-flow-track-3 {
            animation: cerealFlowRight 22s linear infinite 7s;
          }

          .cereal-flow-track-4 {
            animation: cerealFlowLeft 16s linear infinite 2s;
          }

          .cereal-flow-track-5 {
            animation: cerealFlowRight 19s linear infinite 10s;
          }

          .jacral-float-slow {
            animation: jacralFloatSlow 7s ease-in-out infinite;
          }

          .jacral-float-medium {
            animation: jacralFloatMedium 5.5s ease-in-out infinite;
          }

          .jacral-drift {
            animation: jacralDrift 6s ease-in-out infinite;
          }

          .jacral-reveal {
            animation: jacralReveal .8s cubic-bezier(.22,1,.36,1) both;
          }

          .jacral-pulse {
            animation: jacralSoftPulse 4s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .jacral-float-slow,
            .jacral-float-medium,
            .jacral-drift,
            .jacral-reveal,
            .jacral-pulse,
            .cereal-flow-track-1,
            .cereal-flow-track-2,
            .cereal-flow-track-3,
            .cereal-flow-track-4,
            .cereal-flow-track-5 {
              animation: none !important;
            }
          }
        `}
      </style>

      {/* =========================================================
          IMAGE-BASED FLOATING BACKGROUND
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
        aria-hidden="true"
      >
        {/* Warm cream center glow */}
        <div
          className="
            absolute
            left-1/2
            top-[38%]
            h-[700px]
            w-[1100px]
            -translate-x-1/2
            rounded-full
            opacity-70
            blur-[110px]
          "
          style={{ background: "radial-gradient(ellipse, #FFF4DC 0%, #F5E4B0 50%, transparent 80%)" }}
        />

        {/* Brown ambient glow — bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "500px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 20% 80%, rgba(139,69,19,0.09) 0%, transparent 65%)",
          }}
        />

        {/* Green ambient glow — top-right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "600px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 80% 20%, rgba(49,94,66,0.08) 0%, transparent 65%)",
          }}
        />

        {/* Red accent glow — top-center */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(192,68,34,0.05) 0%, transparent 70%)",
          }}
        />

        {/* Removed animated cereals */}

        {/* =======================================================
            TROPICAL LEAVES
            ======================================================= */}

        {/* Leaf — bottom-left */}
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="jacral-float-medium"
          style={{
            position: "absolute",
            left: "7%",
            bottom: "9%",
            width: "135px",
            height: "135px",
            objectFit: "contain",
            opacity: 0.88,
            filter: "drop-shadow(0 8px 18px rgba(30,80,40,0.18))",
            transform: "rotate(-25deg)",
          }}
        />

        {/* Leaf — right lower */}
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="jacral-float-slow"
          style={{
            position: "absolute",
            right: "6%",
            bottom: "22%",
            width: "112px",
            height: "112px",
            objectFit: "contain",
            opacity: 0.82,
            filter: "drop-shadow(0 7px 16px rgba(30,80,40,0.15))",
            transform: "rotate(20deg) scaleX(-1)",
          }}
        />

        {/* Leaf — left mid */}
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="jacral-drift"
          style={{
            position: "absolute",
            left: "14%",
            top: "38%",
            width: "70px",
            height: "70px",
            objectFit: "contain",
            opacity: 0.72,
            filter: "drop-shadow(0 5px 10px rgba(30,80,40,0.14))",
            transform: "rotate(10deg)",
          }}
        />

        {/* Leaf — top-right small */}
        <img
          src="/images/tropical_leaf.png"
          alt=""
          className="jacral-float-medium"
          style={{
            position: "absolute",
            right: "15%",
            top: "10%",
            width: "75px",
            height: "75px",
            objectFit: "contain",
            opacity: 0.70,
            filter: "drop-shadow(0 5px 10px rgba(30,80,40,0.12))",
            transform: "rotate(-15deg) scaleX(-1)",
          }}
        />

        {/* =======================================================
            OAT GRAIN CLUSTERS
            ======================================================= */}

        <img
          src="/images/oat_grains.png"
          alt=""
          className="jacral-drift"
          style={{
            position: "absolute",
            left: "18%",
            top: "18%",
            width: "100px",
            height: "100px",
            objectFit: "contain",
            opacity: 0.85,
            filter: "drop-shadow(0 4px 8px rgba(100,70,20,0.14))",
            transform: "rotate(-15deg)",
          }}
        />

        <img
          src="/images/oat_grains.png"
          alt=""
          className="jacral-float-medium"
          style={{
            position: "absolute",
            right: "17%",
            top: "22%",
            width: "82px",
            height: "82px",
            objectFit: "contain",
            opacity: 0.80,
            filter: "drop-shadow(0 3px 7px rgba(100,70,20,0.12))",
            transform: "rotate(18deg)",
          }}
        />

        <img
          src="/images/oat_grains.png"
          alt=""
          className="jacral-float-slow"
          style={{
            position: "absolute",
            right: "3%",
            bottom: "7%",
            width: "90px",
            height: "90px",
            objectFit: "contain",
            opacity: 0.75,
            filter: "drop-shadow(0 4px 8px rgba(100,70,20,0.12))",
            transform: "rotate(32deg)",
          }}
        />

        <img
          src="/images/oat_grains.png"
          alt=""
          className="jacral-float-medium"
          style={{
            position: "absolute",
            left: "27%",
            bottom: "9%",
            width: "72px",
            height: "72px",
            objectFit: "contain",
            opacity: 0.70,
            filter: "drop-shadow(0 3px 6px rgba(100,70,20,0.11))",
            transform: "rotate(-30deg)",
          }}
        />

        {/* =======================================================
            SMALL ACCENT DOTS
            ======================================================= */}

        <span
          className="
            jacral-pulse
            absolute
            left-[23%]
            top-[12%]
            h-4
            w-4
            rounded-full
            bg-[#B9C86E]
          "
        />

        <span
          className="
            jacral-pulse
            absolute
            right-[24%]
            top-[14%]
            h-3
            w-3
            rounded-full
            bg-[#E4A55D]
          "
        />

        <span
          className="
            absolute
            left-[16%]
            bottom-[26%]
            h-3
            w-3
            rotate-45
            rounded-[35%]
            bg-[#D9A64C]/50
          "
        />

        <span
          className="
            absolute
            right-[18%]
            bottom-[28%]
            h-4
            w-4
            rotate-[-20deg]
            rounded-full
            bg-[#3B6D4D]/25
          "
        />
      </div>

      {/* =========================================================
          GREEN BENEFIT STRIP (FULL WIDTH, TOUCHING HERO)
          ========================================================= */}

      <div
        className="
          relative
          z-30
          w-full
          m-0
          overflow-hidden
          border-y
          border-[#1E482E]
          bg-[#285B3C]
          shadow-[0_4px_20px_rgba(20,50,30,0.18)]
        "
      >
        {/* Decorative leaves on strip */}

        <svg
          className="
            pointer-events-none
            absolute
            -left-2
            top-1/2
            h-12
            w-16
            -translate-y-1/2
            opacity-80
          "
          viewBox="0 0 80 50"
          fill="none"
        >
          <path
            d="M4 40C24 26 40 17 72 7"
            stroke="#D8E3A2"
            strokeWidth="1.5"
          />

          <ellipse
            cx="18"
            cy="30"
            rx="6"
            ry="13"
            transform="rotate(-38 18 30)"
            fill="#9DB54A"
          />

          <ellipse
            cx="35"
            cy="22"
            rx="6"
            ry="13"
            transform="rotate(-42 35 22)"
            fill="#789B39"
          />
        </svg>

        <svg
          className="
            pointer-events-none
            absolute
            -right-2
            top-1/2
            h-12
            w-16
            -translate-y-1/2
            -scale-x-100
            opacity-80
          "
          viewBox="0 0 50 50"
          fill="none"
        >
          <path
            d="M4 40C24 26 40 17 72 7"
            stroke="#D8E3A2"
            strokeWidth="1.5"
          />

          <ellipse
            cx="18"
            cy="30"
            rx="6"
            ry="13"
            transform="rotate(-38 18 30)"
            fill="#9DB54A"
          />

          <ellipse
            cx="35"
            cy="22"
            rx="6"
            ry="13"
            transform="rotate(-42 35 22)"
            fill="#789B39"
          />
        </svg>

        <div
          className="
            mx-auto
            flex
            min-h-[64px]
            w-full
            max-w-[150 px]
            flex-col
            items-stretch
            lg:flex-row
          "
        >
          <BenefitItem
            icon={<Truck size={19} />}
            text="FAST & RELIABLE DELIVERY"
          />

          <BenefitItem
            icon={<Leaf size={20} />}
            text="100% NATURAL INGREDIENTS"
          />

          <BenefitItem
            icon={<ShieldCheck size={20} />}
            text="SAFE & SECURE PAYMENTS"
          />

          <BenefitItem
            icon={<Heart size={20} />}
            text="HEALTHY CHOICES FOR YOU"
            last
          />
        </div>
      </div>

      {/* =========================================================
          PRODUCT SECTION
          ========================================================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-[1450px]
          px-5
          pb-24
          pt-10
          sm:px-8
          sm:pb-28
          sm:pt-12
          lg:px-12
          lg:pb-32
          lg:pt-12
        "
      >
        {/* =======================================================
            HEADING
            ======================================================= */}

        <div
          className="
            jacral-reveal
            relative
            z-20
            mb-14
            text-center
            sm:mb-16
            lg:mb-20
          "
        >
          <div
            className="
              mb-5
              flex
              items-center
              justify-center
              gap-5
            "
          >
            <span
              className="
                h-px
                w-12
                bg-[#315E42]/45
                sm:w-16
              "
            />

            <Leaf
              size={20}
              strokeWidth={1.4}
              className="text-[#315E42]"
            />

            <span
              className="
                h-px
                w-12
                bg-[#315E42]/45
                sm:w-16
              "
            />
          </div>

          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(44px, 7vw, 80px)',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: '#28543C',
            }}
          >
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>OUR </span>
            <span style={{ fontWeight: 900 }}>PRODUCTS</span>
          </h2>
        </div>

        {/* =======================================================
            TWO PRODUCTS
            ======================================================= */}

        <div
          className="
            relative
            mx-auto
            grid
            max-w-[1050px]
            grid-cols-1
            gap-5
            md:grid-cols-2
            lg:gap-20
          "
        >
          {activeProducts.map((product, index) => (
            <div
              key={product.id}
              className="
                jacral-reveal
                relative
              "
              style={{
                animationDelay: `${(index % 4 + 1) * 150}ms`,
              }}
            >
              <ProductCard
                product={product}
                showDescription={false}
              />
            </div>
          ))}
        </div>

        {/* =======================================================
            BOTTOM DECORATIVE LINE
            ======================================================= */}

        <div
          className="
            mx-auto
            mt-16
            flex
            max-w-[850px]
            items-center
            gap-4
          "
        >
          <span
            style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #C4B090)',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Leaf
              size={13}
              strokeWidth={1.4}
              style={{ color: '#315E42', opacity: 0.7 }}
            />
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#74695F',
              }}
            >
              JACRAL
            </span>
            <span style={{ color: '#C04422', opacity: 0.7, fontSize: '11px' }}>·</span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#74695F',
              }}
            >
              NATURALLY CRAFTED
            </span>
          </div>

          <span
            style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, #C4B090, transparent)',
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   BENEFIT ITEM
   ================================================================ */

function BenefitItem({
  icon,
  text,
  last = false,
}: {
  icon: ReactNode;
  text: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        flex
        flex-1
        items-center
        justify-center
        gap-3
        px-5
        py-4
        text-center
        ${!last
          ? "border-b border-[#8BA18D]/30 lg:border-b-0 lg:border-r"
          : ""
        }
      `}
    >
      <span
        className="
          shrink-0
          text-[#E5E8C7]
        "
      >
        {icon}
      </span>

      <span
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.17em]
          text-[#F4F0DF]
          sm:text-[10px]
        "
      >
        {text}
      </span>
    </div>
  );
}

/* ================================================================
   CODED OAT CLUSTER
   ================================================================ */

function OatCluster({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M49 91C49 66 50 39 52 10"
        stroke="#A77B40"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <ellipse
        cx="37"
        cy="70"
        rx="7"
        ry="16"
        transform="rotate(-35 37 70)"
        fill="#D1A762"
      />

      <ellipse
        cx="61"
        cy="61"
        rx="7"
        ry="16"
        transform="rotate(35 61 61)"
        fill="#C59650"
      />

      <ellipse
        cx="39"
        cy="49"
        rx="7"
        ry="15"
        transform="rotate(-35 39 49)"
        fill="#DAB56F"
      />

      <ellipse
        cx="62"
        cy="39"
        rx="7"
        ry="15"
        transform="rotate(35 62 39)"
        fill="#C79A58"
      />

      <ellipse
        cx="45"
        cy="27"
        rx="6"
        ry="13"
        transform="rotate(-30 45 27)"
        fill="#D7B16C"
      />

      <ellipse
        cx="60"
        cy="17"
        rx="5"
        ry="11"
        transform="rotate(27 60 17)"
        fill="#C59650"
      />
    </svg>
  );
}

/* ================================================================
   CODED LEAF BRANCH
   ================================================================ */

function LeafBranch({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M14 88C30 63 52 39 84 14"
        stroke="#315E42"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M31 63C18 59 12 49 13 38C25 39 34 47 36 56"
        fill="#70964D"
        opacity=".7"
      />

      <path
        d="M47 46C38 37 38 26 43 17C54 22 59 31 56 40"
        fill="#86A85B"
        opacity=".65"
      />

      <path
        d="M63 32C65 20 74 13 85 11C84 23 77 31 68 37"
        fill="#5E8A48"
        opacity=".7"
      />
    </svg>
  );
}

/* ================================================================
   LOADING SKELETON
   ================================================================ */

function ProductSkeleton() {
  return (
    <div
      className="
        h-[650px]
        animate-pulse
        rounded-[30px]
        border
        border-[#DED2BE]
        bg-white/60
      "
    />
  );
}