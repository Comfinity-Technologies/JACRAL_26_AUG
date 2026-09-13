import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Trophy, TrendingUp, ShoppingBag, Users, Star, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TopCustomer {
  user_id: number;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
}

interface AnalyticsSummary {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  top_products: { id: number; name: string; total_sold: number; revenue: number }[];
}

export default function AdminAnalyticsPage() {
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [topRes, sumRes, revRes, ugRes] = await Promise.all([
          apiClient.get("/api/v1/analytics/top-customers"),
          apiClient.get("/api/v1/analytics/summary"),
          apiClient.get("/api/v1/admin/analytics/revenue-chart"),
          apiClient.get("/api/v1/admin/analytics/user-growth"),
        ]);
        setTopCustomers(topRes.data || []);
        setSummary(sumRes.data || null);
        setRevenueData(revRes.data || []);
        setUserGrowthData(ugRes.data || []);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-3xl"></div>)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 animate-pulse rounded-3xl"></div>
          <div className="h-80 bg-gray-200 animate-pulse rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
            <TrendingUp size={24} />
          </div>
          Analytics
        </h1>
        <p className="text-[#685B55]">Full platform insights and performance metrics.</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: `₹${summary.total_revenue?.toLocaleString("en-IN") ?? "0"}`, icon: TrendingUp, color: "text-[#3B6E4C]", bg: "bg-[#3B6E4C]/10" },
            { label: "Total Orders", value: summary.total_orders ?? 0, icon: ShoppingBag, color: "text-[#E88D36]", bg: "bg-[#E88D36]/10" },
            { label: "Total Customers", value: summary.total_customers ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
            { label: "Pending Orders", value: summary.pending_orders ?? 0, icon: Star, color: "text-amber-600", bg: "bg-amber-100" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5DCDB] hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-2xl ${card.bg} ${card.color} mb-4`}>
                <card.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <p className="text-xs font-bold text-[#685B55] uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-[#2C221E]">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Order Status Breakdown */}
      {summary && (
        <div className="bg-white rounded-3xl shadow-sm border border-[#E5DCDB] p-8">
          <h2 className="text-xl font-bold text-[#2C221E] mb-6" style={{ fontFamily: "var(--font-heading)" }}>Order Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pending", value: summary.pending_orders, color: "bg-amber-50 text-amber-800 border-amber-200" },
              { label: "Processing", value: summary.processing_orders, color: "bg-blue-50 text-blue-800 border-blue-200" },
              { label: "Shipped", value: summary.shipped_orders, color: "bg-purple-50 text-purple-800 border-purple-200" },
              { label: "Delivered", value: summary.delivered_orders, color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl px-5 py-5 text-center border-2 ${s.color}`}>
                <p className="text-4xl font-bold mb-2">{s.value ?? 0}</p>
                <p className="text-sm font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E5DCDB] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#E88D36]/10 p-2.5 rounded-xl text-[#E88D36]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>Revenue Growth (Last 30 Days)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DCDB" />
                <XAxis dataKey="date" stroke="#685B55" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#685B55" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]} 
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3B6E4C" strokeWidth={3} dot={{ r: 4, fill: "#3B6E4C" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E5DCDB] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>User Growth (Last 30 Days)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DCDB" />
                <XAxis dataKey="date" stroke="#685B55" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#685B55" fontSize={12} allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [value, "New Registrations"]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="registrations" stroke="#9333ea" strokeWidth={3} dot={{ r: 4, fill: "#9333ea" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Customers Leaderboard */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E5DCDB] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>Top 10 Customers</h2>
          </div>

          {topCustomers.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-12 h-12 text-[#E5DCDB] mx-auto mb-3" />
              <p className="text-[#685B55] font-medium">No order data yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div
                  key={c.user_id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6EE] hover:bg-[#F2EBDC] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-9 text-center font-bold text-[#685B55]">
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </span>
                    <div>
                      <p className="font-bold text-[#2C221E]">{c.name}</p>
                      <p className="text-xs text-[#685B55] font-medium">{c.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#3B6E4C]">
                      ₹{Number(c.total_spent || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[#685B55] font-medium">{c.total_orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        {summary && (
          <div className="bg-white rounded-3xl shadow-sm border border-[#E5DCDB] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#3B6E4C]/10 p-2.5 rounded-xl text-[#3B6E4C]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>Top Selling Products</h2>
            </div>
            {(!summary.top_products || summary.top_products.length === 0) ? (
              <div className="text-center py-10">
                <ShoppingBag className="w-12 h-12 text-[#E5DCDB] mx-auto mb-3" />
                <p className="text-[#685B55] font-medium">No sales data yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.top_products.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6EE] hover:bg-[#F2EBDC] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#685B55] text-sm w-8 text-center">#{i + 1}</span>
                      <p className="font-bold text-[#2C221E]">{p.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#3B6E4C]">
                        ₹{Number(p.revenue || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-[#685B55] font-medium">{p.total_sold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
