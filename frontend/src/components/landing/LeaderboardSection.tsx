import { Trophy, Crown, Sparkles, Star } from "lucide-react";
import { useLeaderboard, type TopCustomer } from "../../hooks/useLeaderboard";

// Shown until real customer/order data exists in the database.
// The moment orders are placed and useLeaderboard() has real rows,
// this fallback is swapped out automatically — no code change needed.
const DEFAULT_LEADERBOARD: TopCustomer[] = [
  { user_id: -1, name: "Ananya Roy", total_orders: 14, total_spent: "18,400", total_items_ordered: 42 },
  { user_id: -2, name: "Vikram Menon", total_orders: 11, total_spent: "15,200", total_items_ordered: 35 },
  { user_id: -3, name: "Priya Sharma", total_orders: 9, total_spent: "12,650", total_items_ordered: 28 },
  { user_id: -4, name: "Rahul Nair", total_orders: 7, total_spent: "9,800", total_items_ordered: 21 },
  { user_id: -5, name: "Meera Iyer", total_orders: 6, total_spent: "8,100", total_items_ordered: 18 },
  { user_id: -6, name: "Arjun Pillai", total_orders: 5, total_spent: "7,200", total_items_ordered: 16 },
  { user_id: -7, name: "Sneha Reddy", total_orders: 5, total_spent: "6,100", total_items_ordered: 14 },
  { user_id: -8, name: "Karan Malhotra", total_orders: 4, total_spent: "5,300", total_items_ordered: 12 },
  { user_id: -9, name: "Divya Nambiar", total_orders: 4, total_spent: "4,800", total_items_ordered: 11 },
  { user_id: -10, name: "Rohan Gupta", total_orders: 3, total_spent: "3,900", total_items_ordered: 9 },
  { user_id: -11, name: "Ishaan Verma", total_orders: 3, total_spent: "3,200", total_items_ordered: 7 },
  { user_id: -12, name: "Aditi Rao", total_orders: 3, total_spent: "3,100", total_items_ordered: 7 },
  { user_id: -13, name: "Kavya Singh", total_orders: 2, total_spent: "2,900", total_items_ordered: 6 },
  { user_id: -14, name: "Nikhil Joshi", total_orders: 2, total_spent: "2,700", total_items_ordered: 6 },
  { user_id: -15, name: "Riya Desai", total_orders: 2, total_spent: "2,500", total_items_ordered: 5 },
  { user_id: -16, name: "Siddharth Jain", total_orders: 2, total_spent: "2,400", total_items_ordered: 5 },
  { user_id: -17, name: "Tarun Kumar", total_orders: 2, total_spent: "2,200", total_items_ordered: 4 },
  { user_id: -18, name: "Neha Patel", total_orders: 1, total_spent: "1,800", total_items_ordered: 4 },
  { user_id: -19, name: "Aman Shah", total_orders: 1, total_spent: "1,600", total_items_ordered: 3 },
  { user_id: -20, name: "Pooja Mehta", total_orders: 1, total_spent: "1,500", total_items_ordered: 3 },
  { user_id: -21, name: "Ravi Shankar", total_orders: 1, total_spent: "1,300", total_items_ordered: 3 },
  { user_id: -22, name: "Shruti Agarwal", total_orders: 1, total_spent: "1,200", total_items_ordered: 2 },
  { user_id: -23, name: "Gaurav Bhatt", total_orders: 1, total_spent: "1,100", total_items_ordered: 2 },
  { user_id: -24, name: "Manoj Tiwari", total_orders: 1, total_spent: "950", total_items_ordered: 2 },
  { user_id: -25, name: "Swati Kapoor", total_orders: 1, total_spent: "800", total_items_ordered: 1 },
];

// How many runner-up rows show before scrolling kicks in.
const VISIBLE_RUNNER_UP_ROWS = 5;
const ROW_HEIGHT_PX = 68;
const ROW_GAP_PX = 12;
const RUNNER_UP_LIST_MAX_HEIGHT =
  VISIBLE_RUNNER_UP_ROWS * ROW_HEIGHT_PX + (VISIBLE_RUNNER_UP_ROWS - 1) * ROW_GAP_PX;

export default function LeaderboardSection() {
  const { topCustomers, isLoading } = useLeaderboard();

  const items =
    topCustomers && topCustomers.length > 0 ? topCustomers : DEFAULT_LEADERBOARD;

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#1E3B27] to-[#3B6E4C] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Trophy size={48} className="text-[#F0B429] opacity-70 mb-4" />
          <p className="text-[#FFFBF0] font-bold tracking-widest uppercase">
            Loading Leaderboard...
          </p>
        </div>
      </section>
    );
  }

  // Get top 3 for podium
  const podium = [
    items[1] || null, // 2nd Place (Left)
    items[0] || null, // 1st Place (Center)
    items[2] || null, // 3rd Place (Right)
  ];

  const others = items.slice(3);
  const lastPosition = 3 + others.length;

  return (
    <section
      id="leaderboard"
      className="py-16 sm:py-20 bg-gradient-to-br from-[#1E3B27] to-[#3B6E4C] relative overflow-hidden text-[#FFFBF0] font-sans"
    >
      {/* Thick orange scrollbar for the Runner Ups panel */}
      <style>{`
        .champions-scroll {
          scrollbar-width: auto;
          scrollbar-color: #E88D36 rgba(212,163,89,0.15);
        }
        .champions-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .champions-scroll::-webkit-scrollbar-track {
          background: rgba(212,163,89,0.15);
          border-radius: 999px;
        }
        .champions-scroll::-webkit-scrollbar-thumb {
          background-color: #E88D36;
          border-radius: 999px;
          border: 2px solid rgba(44,37,21,0.6);
        }
        .champions-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #FB8500;
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFB703] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#FB8500] rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="w-12 h-[1px] bg-[#F0B429]" />
            <Trophy size={22} className="text-[#F0B429]" />
            <span className="w-12 h-[1px] bg-[#F0B429]" />
          </div>
          <h2
            className="text-3xl sm:text-4xl font-black uppercase tracking-wider mb-3 drop-shadow-md"
            style={{ fontFamily: '"Montserrat ExtraBold", Georgia, serif' }}
          >
            Jacral Champions
          </h2>
          <p className="text-xs sm:text-sm text-[#F5EFD8] uppercase tracking-[0.2em] font-semibold">
            Celebrating our most loyal customers by items ordered
          </p>
        </div>

        {/* Two-column layout: Podium (left) + Runner Ups (right) */}
        <div className={`max-w-6xl mx-auto grid gap-6 lg:gap-8 ${others.length > 0 ? "lg:grid-cols-2 lg:items-start" : ""}`}>

          {/* ── LEFT: Top 3 Podium ── */}
          <div className="flex flex-col">
            {/* Top 3 label — icons separated with a real gap so nothing overlaps the text */}
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-13">
              <Trophy size={14} className="text-[#F0B429] flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#F0B429] whitespace-wrap">
                Top 3 Champions
              </h3>
              <Crown size={16} className="text-[#F0B429] flex-shrink-0" />
            </div>

            <div className="flex items-end justify-center gap-2 sm:gap-6 px-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-1/3 max-w-[160px]">
                {podium[0] && (
                  <div className="flex flex-col items-center mb-4 animate-[bounce_3s_infinite_100ms]">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FFFBF0] text-[#1E3B27] flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg border-4 border-[#EBDCC5] mb-2">
                      {podium[0].name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-center text-sm sm:text-lg truncate w-full px-1">
                      {podium[0].name}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#F5EFD8]/80">
                      {podium[0].total_items_ordered} Items
                    </p>
                  </div>
                )}
                <div className="w-full bg-[#FB8500] h-[110px] sm:h-[140px] rounded-t-lg shadow-2xl relative overflow-hidden border-b-8 border-[#C96A00] flex items-start justify-center pt-4 sm:pt-6">
                  <span className="text-5xl sm:text-6xl font-black text-white/90">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center w-1/3 max-w-[180px] z-10">
                {podium[1] && (
                  <div className="flex flex-col items-center mb-4 animate-[bounce_3s_infinite]">
                    <Trophy size={36} className="text-[#F0B429] drop-shadow-lg mb-2" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFFBF0] text-[#1E3B27] flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-[0_0_20px_rgba(240,180,41,0.6)] border-4 border-[#F0B429] mb-2">
                      {podium[1].name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-black text-center text-base sm:text-xl truncate w-full px-1 text-[#F0B429] drop-shadow-md">
                      {podium[1].name}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#FFFBF0] uppercase tracking-widest">
                      {podium[1].total_items_ordered} Items
                    </p>
                  </div>
                )}
                <div className="w-full bg-[#FFB703] h-[160px] sm:h-[200px] rounded-t-lg shadow-2xl relative overflow-hidden border-b-8 border-[#C98B4A] flex items-start justify-center pt-4 sm:pt-6">
                  <span className="text-6xl sm:text-7xl font-black text-white/90">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center w-1/3 max-w-[160px]">
                {podium[2] && (
                  <div className="flex flex-col items-center mb-4 animate-[bounce_3s_infinite_200ms]">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FFFBF0] text-[#1E3B27] flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg border-4 border-[#C98B4A] mb-2">
                      {podium[2].name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-center text-sm sm:text-lg truncate w-full px-1">
                      {podium[2].name}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-[#F5EFD8]/80">
                      {podium[2].total_items_ordered} Items
                    </p>
                  </div>
                )}
                <div className="w-full bg-[#E5C185] h-[80px] sm:h-[100px] rounded-t-lg shadow-2xl relative overflow-hidden border-b-8 border-[#A57C43] flex items-start justify-center pt-4 sm:pt-6">
                  <span className="text-4xl sm:text-5xl font-black text-white/90">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Outer frame card, holding the inner amber Runner Ups card ── */}
          {others.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-[28px] border border-white/15 shadow-2xl p-5 sm:p-4">
              {/* Inner card — the actual Runner Ups panel */}
              <div className="flex flex-col bg-[#2C2515]/95 backdrop-blur-md rounded-2xl border border-[#D4A359]/60 shadow-xl overflow-hidden">
                <div className="flex items-center justify-center gap-5 px-6 pt-6 pb-3 border-b border-[#D4A359]/25">
                  <Sparkles size={15} className="text-[#F0B429] flex-shrink-0" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-[#F5EFD8] whitespace-nowrap">
                    Runner Ups &mdash; Positions 4 to {lastPosition}
                  </h3>
                </div>

                <div
                  className="champions-scroll overflow-y-auto px-4 sm:px-5 py-3 space-y-3"
                  style={{ maxHeight: `${RUNNER_UP_LIST_MAX_HEIGHT}px` }}
                >
                  {others.map((customer, idx) => (
                    <div
                      key={customer.user_id}
                      className="flex items-center justify-between px-4 rounded-xl bg-[#D4A359]/8 hover:bg-[#D4A359]/15 transition-colors"
                      style={{ height: `${ROW_HEIGHT_PX}px` }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="font-black text-lg text-[#F5EFD8]/50 w-6 text-right flex-shrink-0">
                          #{idx + 4}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#FB8500] border-2 border-white/30 flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-lg truncate">{customer.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[#F0B429] bg-black/20 px-3 py-1 rounded-lg flex-shrink-0">
                        <Star size={16} className="fill-[#F0B429]" />
                        {customer.total_items_ordered} Items
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}