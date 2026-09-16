import type { Product } from "../../types/product";
import { ArrowRight, Leaf, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getImageUrl } from "../../utils/image";
import { useCart } from "../../hooks/useCart";

export type ProductCardItem = Product | {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  stock: number;
  featured?: boolean;
  badge?: string;
  image_url?: string | null;
  hover_image_url?: string | null;
  category?: any;
  slug?: string;
  is_active?: boolean;
};

export interface ProductCardProps {
  product: ProductCardItem;
  onAddToCart?: () => Promise<void> | void;
  showDescription?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  showDescription = true,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const primaryImage = product.image_url
    ? getImageUrl(product.image_url)
    : null;

  const hoverImage = product.hover_image_url
    ? getImageUrl(product.hover_image_url)
    : null;

  const isOutOfStock = Number(product.stock) <= 0;
  const productUrl = `/product/${product.id}`;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      if (onAddToCart) {
        await onAddToCart();
      } else {
        await addToCart(product.id, 1);
      }
    } catch (err) {
      console.error("Failed adding to cart:", err);
    } finally {
      navigate("/cart");
    }
  };

  return (
    <>
      {/* ============================================================
          PER-CARD KEYFRAMES
          ============================================================ */}
      <style>{`
        @keyframes imgLevitate {
          0%, 100% {
            transform: perspective(700px) rotateX(4deg) rotateY(-6deg) translateY(0px) scale(1.04);
            filter: drop-shadow(0 18px 28px rgba(80,40,10,0.30)) drop-shadow(0 6px 10px rgba(80,40,10,0.16));
          }
          50% {
            transform: perspective(700px) rotateX(2deg) rotateY(4deg) translateY(-10px) scale(1.07);
            filter: drop-shadow(0 28px 36px rgba(80,40,10,0.38)) drop-shadow(0 8px 14px rgba(80,40,10,0.22));
          }
        }
        @keyframes shimmer3D {
          0%   { opacity: 0.0; transform: translateX(-120%) skewX(-15deg); }
          50%  { opacity: 0.35; }
          100% { opacity: 0.0; transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0.75); opacity: 0; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 0.6; transform: scale(1);   }
          50%       { opacity: 1;   transform: scale(1.5); }
        }
        @keyframes groundShadowPulse {
          0%, 100% { transform: translateX(-50%) scaleX(1);   opacity: 0.20; }
          50%       { transform: translateX(-50%) scaleX(0.85); opacity: 0.30; }
        }

        .pc-img-levitate        { animation: imgLevitate         5.2s ease-in-out infinite; }
        .pc-shimmer             { animation: shimmer3D            3.0s ease-in-out infinite 1.5s; }
        .pc-badge-pop           { animation: badgePop             0.5s cubic-bezier(.22,1,.36,1) both; }
        .pc-dot-blink           { animation: dotBlink             2.1s ease-in-out infinite; }
        .pc-ground-shadow-pulse { animation: groundShadowPulse    5.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .pc-img-levitate, .pc-shimmer, .pc-badge-pop,
          .pc-dot-blink, .pc-ground-shadow-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <article
        className="group relative flex h-full flex-col overflow-hidden"
        style={{
          borderRadius: "30px",
          border: "1.5px solid rgba(196,156,110,0.35)",
          background:
            "linear-gradient(160deg, #FFFDF8 0%, #FBF4E6 60%, #F5EDD7 100%)",
          boxShadow:
            "0 8px 32px rgba(110,55,15,.09), 0 2px 8px rgba(110,55,15,.06), inset 0 1px 0 rgba(255,255,255,0.9)",
          transition:
            "transform 0.45s cubic-bezier(.22,1,.36,1), box-shadow 0.45s cubic-bezier(.22,1,.36,1)",
          willChange: "transform",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={(e) => {
          setHovered(false);
          e.currentTarget.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0px)";
          e.currentTarget.style.boxShadow =
            "0 8px 32px rgba(110,55,15,.09), 0 2px 8px rgba(110,55,15,.06), inset 0 1px 0 rgba(255,255,255,0.9)";
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
          e.currentTarget.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) translateY(-5px)`;
          e.currentTarget.style.boxShadow = `${-x * 1.2}px ${22 + Math.abs(y * 1.5)}px 55px rgba(110,55,15,0.2), 0 4px 14px rgba(110,55,15,0.09), inset 0 1px 0 rgba(255,255,255,0.9)`;
        }}
      >
        {/* ============================================================
            TOP IMAGE ZONE (Direct image placement in card container)
            ============================================================ */}
        <Link
          to={productUrl}
          className="relative block w-full pt-2 px-6 pb-2"
        >


          {/* Red accent dot (top-right) */}
          <div
            className="pc-dot-blink"
            style={{
              position: "absolute",
              top: "22px",
              right: "26px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #E05A35 0%, #C04422 100%)",
              boxShadow: "0 0 7px rgba(192,68,34,0.55)",
            }}
          />

          {/* Product Image directly in the card */}
          <div className="relative w-full aspect-[1.2/1] flex items-center justify-center pt-4">
            {primaryImage ? (
              <img
                src={hovered && hoverImage ? hoverImage : primaryImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                style={{
                  filter: "drop-shadow(0 14px 24px rgba(80,40,10,0.18))",
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#315E42] flex items-center justify-center text-white">
                <Leaf size={40} strokeWidth={1.2} />
              </div>
            )}
          </div>
        </Link>

        {/* ============================================================
            PRODUCT CONTENT
            ============================================================ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "22px 24px 24px",
          }}
        >


          {/* Product name — large, bold, uppercase */}
          <Link to={productUrl} style={{ textDecoration: "none" }}>
            <h3
              style={{
                fontSize: "clamp(21px, 2.4vw, 27px)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                color: "#28221D",
                marginBottom: "10px",
                transition: "color 0.3s ease",
              }}
              className="group-hover:!text-[#315E42]"
            >
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          {showDescription && product.description && (
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.65,
                color: "#74695F",
                minHeight: "44px",
                flex: 1,
                marginBottom: "10px",
              }}
            >
              {product.description}
            </p>
          )}

          {/* Price display */}
          {product.price !== undefined && Number(product.price) > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "8px 0",
              }}
            >
              <span
                style={{
                  fontSize: "19px",
                  fontWeight: 900,
                  color: "#1E482E",
                  letterSpacing: "-0.02em",
                }}
              >
                ₹{product.price}
              </span>
              {product.badge && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    backgroundColor: "rgba(232,141,54,0.15)",
                    color: "#C96A1F",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    border: "1px solid rgba(232,141,54,0.3)",
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>
          )}

          {/* ── GRADIENT DIVIDER ── */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, #D5C4A8 30%, #C4B090 60%, transparent)",
              margin: "18px 0 16px",
            }}
          />

          {/* ── ACTION BUTTONS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {/* DETAILS */}
            <Link
              to={productUrl}
              className="group/details flex items-center justify-center gap-1.5"
              style={{
                minHeight: "48px",
                borderRadius: "999px",
                border: "1.5px solid #302923",
                background: "transparent",
                fontSize: "9px",
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#302923",
                transition: "all 0.3s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "#302923";
                el.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "transparent";
                el.style.color = "#302923";
              }}
            >
              DETAILS
              <ArrowRight
                size={13}
                style={{ transition: "transform 0.3s ease" }}
                className="group-hover/details:translate-x-0.5"
              />
            </Link>

            {/* SHOP NOW */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                minHeight: "48px",
                borderRadius: "999px",
                background: isOutOfStock
                  ? "#D1C7BA"
                  : "linear-gradient(135deg, #285B3C 0%, #1E482E 100%)",
                fontSize: "9px",
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#fff",
                boxShadow: isOutOfStock
                  ? "none"
                  : "0 8px 22px rgba(40,91,60,0.28), 0 2px 6px rgba(40,91,60,0.16)",
                transition: "all 0.3s ease",
                cursor: isOutOfStock ? "not-allowed" : "pointer",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (isOutOfStock) return;
                const el = e.currentTarget;
                el.style.background =
                  "linear-gradient(135deg, #3D7050 0%, #2A5639 100%)";
                el.style.boxShadow =
                  "0 13px 30px rgba(40,91,60,0.38), 0 4px 10px rgba(40,91,60,0.22)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                if (isOutOfStock) return;
                const el = e.currentTarget;
                el.style.background =
                  "linear-gradient(135deg, #285B3C 0%, #1E482E 100%)";
                el.style.boxShadow =
                  "0 8px 22px rgba(40,91,60,0.28), 0 2px 6px rgba(40,91,60,0.16)";
                el.style.transform = "none";
              }}
            >
              <ShoppingBag size={13} strokeWidth={1.8} />
              {isOutOfStock ? "OUT OF STOCK" : "SHOP NOW"}
            </button>
          </div>

          {/* Out of stock notice */}
          {isOutOfStock && (
            <p
              style={{
                marginTop: "10px",
                textAlign: "center",
                fontSize: "8.5px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#A15E4B",
              }}
            >
              Currently unavailable
            </p>
          )}
        </div>

        {/* ── BOTTOM EDGE TRICOLOR BAR ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "12%",
            right: "12%",
            height: "3px",
            background:
              "linear-gradient(90deg, #8B4513 0%, #315E42 33%, #C04422 66%, #315E42 84%, #8B4513 100%)",
            borderRadius: "0 0 4px 4px",
            opacity: 0.5,
          }}
        />
      </article>
    </>
  );
}