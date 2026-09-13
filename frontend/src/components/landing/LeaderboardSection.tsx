import { Trophy, Star } from "lucide-react";
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
];

export default function LeaderboardSection() {
  const { topCustomers, isLoading } = useLeaderboard();

  const items =
    topCustomers && topCustomers.length > 0 ? topCustomers : DEFAULT_LEADERBOARD;

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-br from-[#1E3B27] to-[#3B6E4C] flex items-center justify-center">
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

  return (
    <section
      id="leaderboard"
      className="py-24 sm:py-32 bg-gradient-to-br from-[#1E3B27] to-[#3B6E4C] relative overflow-hidden text-[#FFFBF0] font-sans"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFB703] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#FB8500] rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-[#F0B429]" />
            <Trophy size={24} className="text-[#F0B429]" />
            <span className="w-12 h-[1px] bg-[#F0B429]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-black uppercase tracking-wider mb-4 drop-shadow-md"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Jacral Champions
          </h2>
          <p className="text-xs sm:text-sm text-[#F5EFD8] uppercase tracking-[0.2em] font-semibold">
            Celebrating our most loyal customers by items ordered
          </p>
        </div>

        {/* Podium Container */}
        <div className="max-w-4xl mx-auto mb-16 flex items-end justify-center gap-2 sm:gap-6 px-4">
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
            <div className="w-full bg-[#FB8500] h-[140px] sm:h-[180px] rounded-t-lg shadow-2xl relative overflow-hidden border-b-8 border-[#C96A00] flex items-start justify-center pt-4 sm:pt-6">
              <span className="text-5xl sm:text-7xl font-black text-white/90">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-1/3 max-w-[180px] z-10">
            {podium[1] && (
              <div className="flex flex-col items-center mb-4 animate-[bounce_3s_infinite]">
                <Trophy size={40} className="text-[#F0B429] drop-shadow-lg mb-2" />
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
            <div className="w-full bg-[#FFB703] h-[200px] sm:h-[260px] rounded-t-lg shadow-2xl relative overflow-hidden border-b-8 border-[#C98B4A] flex items-start justify-center pt-4 sm:pt-6">
              <span className="text-6xl sm:text-8xl font-black text-white/90">1</span>
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
            <div className="w-full bg-[#E5C185] h-[100px] sm:h-[130px] rounded-t-lg shadow-2xl relative overflow-hidden border-b-8 border-[#A57C43] flex items-start justify-center pt-4 sm:pt-6">
              <span className="text-4xl sm:text-6xl font-black text-white/90">3</span>
            </div>
          </div>
        </div>

        {/* Others List */}
        {others.length > 0 && (
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-6 text-center text-[#F5EFD8]">
              Runner Ups
            </h3>
            <div className="space-y-4">
              {others.map((customer, idx) => (
                <div
                  key={customer.user_id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-black text-lg text-[#F5EFD8]/50 w-6 text-right">
                      #{idx + 4}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#FB8500] border-2 border-white/30 flex items-center justify-center font-bold text-white shadow-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-lg">{customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#F0B429] bg-black/20 px-3 py-1 rounded-lg">
                    <Star size={16} className="fill-[#F0B429]" />
                    {customer.total_items_ordered} Items
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}