import type { ReactNode } from "react";
import { Leaf, Truck, ShieldCheck, Heart, Sparkles, ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../customer/ProductCard";
import { useProducts } from "../../hooks/useProducts";

interface ProductsSectionProps {
  section?: any;
}

export default function ProductsSection({ section }: ProductsSectionProps = {}) {
  const { products, isLoading } = useProducts();

  // Only products with "Show in Our Products on Home Page" checked in the
  // Admin Panel (Products → featured) appear here — this is the homepage
  // spotlight, not the full catalog (that's /shop).
  const activeProducts = products.filter(
    (product) => product.is_active !== false && product.featured === true
  );

  return (
    <section
      id="products"
      className="
        relative
        isolate
        overflow-hidden
        bg-[#FAF6EE]
      "
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
            PRODUCT GRID
            — Widened from a fixed 2-up spotlight to an adaptive grid
              (2 / 3 / 4 columns) so the homepage surfaces more of the
              catalog at a glance. Narrow product exposure on the
              homepage is a well-documented conversion risk (Baymard
              Institute guideline #237): visitors who only see 1–2
              items tend to underestimate how much a store carries.
            ======================================================= */}

        {isLoading ? (
          <div
            className="
              mx-auto
              grid
              max-w-[1320px]
              grid-cols-1
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : activeProducts.length === 0 ? (
          <div
            className="
              jacral-reveal
              mx-auto
              flex
              max-w-md
              flex-col
              items-center
              gap-3
              rounded-[28px]
              border
              border-[#DED2BE]
              bg-white/70
              px-8
              py-14
              text-center
            "
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E9E1C9]">
              <PackageSearch size={24} className="text-[#315E42]" strokeWidth={1.6} />
            </span>
            <p className="text-sm font-bold uppercase tracking-wider text-[#315E42]">
              JACRAL — Mark products as "Featured" in the Admin Panel
            </p>
          </div>
        ) : (
          <div
            className={`
              relative
              mx-auto
              grid
              grid-cols-1
              gap-6
              sm:grid-cols-2
              lg:gap-8
              ${activeProducts.length <= 2
                ? "max-w-[1050px] md:grid-cols-2 lg:gap-20"
                : "max-w-[1320px] lg:grid-cols-3 xl:grid-cols-4"
              }
            `}
          >
            {activeProducts.slice(0, 8).map((product, index) => (
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
        )}

        {/* =======================================================
            SHOP ALL CTA
            — Homepage shows a curated slice; this is the bridge to
              the full catalog on /shop.
            ======================================================= */}

        {!isLoading && activeProducts.length > 0 && (
          <div className="jacral-reveal mt-14 flex justify-center sm:mt-16">
            <Link
              to="/shop"
              className="
                group
                inline-flex
                items-center
                gap-2.5
                rounded-full
                border-2
                border-[#28543C]
                px-8
                py-3.5
                text-sm
                font-bold
                uppercase
                tracking-[0.12em]
                text-[#28543C]
                transition-all
                duration-200
                hover:bg-[#28543C]
                hover:text-white
                hover:shadow-[0_10px_28px_rgba(40,84,60,0.28)]
              "
            >
              Shop All Products
              <ArrowRight
                size={16}
                strokeWidth={2.5}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}

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