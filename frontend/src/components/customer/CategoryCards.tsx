import { Link } from "react-router-dom";
import { useDeals } from "../../hooks/useDeals";
import { getImageUrl } from "../../utils/image";

// Fallback cards shown while no deals exist in the DB yet
const FALLBACK_CARDS = [
  { id: -1, title: "Everything under ₹499", subtitle: "Jackfruit goodness & more", link_url: "/shop?maxPrice=499", bg_color: "#FF7000", text_color: "#ffffff", image_url: null as null, display_order: 1 },
  { id: -2, title: "Under ₹699", subtitle: "Millet cereals & mixes", link_url: "/shop?maxPrice=699", bg_color: "#D9CFC4", text_color: "#2C221E", image_url: null as null, display_order: 2 },
  { id: -3, title: "Under ₹399", subtitle: "Trial packs & samplers", link_url: "/shop?maxPrice=399", bg_color: "#DCD4C9", text_color: "#2C221E", image_url: null as null, display_order: 3 },
  { id: -4, title: "Under ₹999", subtitle: "Gift sets & bundles", link_url: "/shop?maxPrice=999", bg_color: "#D6E6DF", text_color: "#2C221E", image_url: null as null, display_order: 4 },
];

export default function CategoryCards() {
  const { deals, isLoading } = useDeals();

  const cards = deals.length > 0 ? deals : FALLBACK_CARDS;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[280px] rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
      {cards.map((card) => (
        <Link
          key={card.id}
          to={card.link_url || "/shop"}
          className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group block h-[280px]"
          style={{ backgroundColor: (card as any).bg_color || "#FF7000", color: (card as any).text_color || "#ffffff" }}
        >
          <div className="p-4 flex-1">
            <h3 className="text-xl font-black leading-tight mb-1">{card.title}</h3>
            <p className="text-sm opacity-90">{card.subtitle}</p>
          </div>
          <div className="h-[140px] w-full overflow-hidden">
            {card.image_url ? (
              <img
                src={getImageUrl(card.image_url)}
                alt={card.title || ""}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20 text-6xl select-none">🌿</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
