import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeals, type Deal } from "../../hooks/useDeals";
import { getImageUrl } from "../../utils/image";

function DealCard({ deal, wide = false }: { deal: Deal; wide?: boolean }) {
    const navigate = useNavigate();
    const clickable = Boolean(deal.link_url);

    return (
        <div
            onClick={() => clickable && navigate(deal.link_url!)}
            className={`
        group relative shrink-0 overflow-hidden rounded-2xl bg-[#F1EADF]
        transition-transform duration-300 ease-out
        ${clickable ? "cursor-pointer hover:-translate-y-1" : ""}
        ${wide ? "w-full max-w-[820px]" : "w-[240px] sm:w-[280px]"}
      `}
            style={{
                aspectRatio: wide ? "16 / 7" : "3 / 4",
                boxShadow: "0 8px 24px rgba(60,40,20,0.10)",
            }}
        >
            <img
                src={getImageUrl(deal.image_url)}
                alt={deal.title || "Deal"}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {(deal.title || deal.subtitle) && (
                <div
                    className="absolute inset-x-0 top-0 p-5 sm:p-6"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%)",
                    }}
                >
                    {deal.title && (
                        <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight">
                            {deal.title}
                        </h3>
                    )}
                    {deal.subtitle && (
                        <p className="mt-1 text-sm font-medium text-white/90 drop-shadow">
                            {deal.subtitle}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ShopDealsRow() {
    const { deals, isLoading } = useDeals();
    const trackRef = useRef<HTMLDivElement>(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    if (isLoading || deals.length === 0) return null;

    if (deals.length === 1) {
        return (
            <div className="mx-auto max-w-7xl px-6 pt-6 flex justify-center">
                <DealCard deal={deals[0]} wide />
            </div>
        );
    }

    const updateEdges = () => {
        const el = trackRef.current;
        if (!el) return;
        setAtStart(el.scrollLeft <= 4);
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };

    const scrollByCard = (dir: 1 | -1) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 300, behavior: "smooth" });
    };

    return (
        <div className="relative mx-auto max-w-7xl px-6 pt-6">
            {!atStart && (
                <button
                    type="button"
                    onClick={() => scrollByCard(-1)}
                    aria-label="Scroll deals left"
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:bg-[#F1EADF] transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
            )}

            <div
                ref={trackRef}
                onScroll={updateEdges}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {deals.map((deal) => (
                    <div key={deal.id} style={{ scrollSnapAlign: "start" }}>
                        <DealCard deal={deal} />
                    </div>
                ))}
            </div>

            {!atEnd && (
                <button
                    type="button"
                    onClick={() => scrollByCard(1)}
                    aria-label="Scroll deals right"
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:bg-[#F1EADF] transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
    );
}