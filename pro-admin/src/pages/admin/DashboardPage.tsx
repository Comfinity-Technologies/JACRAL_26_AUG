import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Users, ShoppingBag, ListOrdered, DollarSign, AlertCircle } from "lucide-react";

interface DashboardData {
  total_customers: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  confirmed_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  low_stock_products: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  total_sold: number;
  revenue: number;
}

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, topRes] = await Promise.all([
          apiClient.get("/api/v1/admin/analytics/dashboard"),
          apiClient.get("/api/v1/admin/analytics/top-products?limit=5")
        ]);
        setData(dashRes.data);
        setTopProducts(topRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-3xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 animate-pulse rounded-3xl"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-3xl"></div>
      </div>
    </div>
  );
  
  if (!data) return <div className="p-8 text-[#685B55]">Error loading dashboard data.</div>;

  const statCards = [
    { title: "Total Revenue", value: `₹${data.total_revenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-[#3B6E4C]", bg: "bg-[#3B6E4C]/10" },
    { title: "Total Orders", value: data.total_orders, icon: ListOrdered, color: "text-[#E88D36]", bg: "bg-[#E88D36]/10" },
    { title: "Total Customers", value: data.total_customers, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Active Products", value: data.total_products, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2C221E] mb-2" style={{ fontFamily: "var(--font-heading)" }}>Overview</h1>
        <p className="text-[#685B55]">Welcome back to your admin dashboard.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5DCDB] flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-bold text-[#685B55] uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-[#2C221E]">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E5DCDB] p-8">
          <h2 className="text-xl font-bold text-[#2C221E] mb-6" style={{ fontFamily: "var(--font-heading)" }}>Order Status Breakdown</h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center p-3 hover:bg-[#FAF6EE] rounded-xl transition-colors">
              <span className="text-[#685B55] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pending
              </span>
              <span className="font-bold text-lg text-[#2C221E]">{data.pending_orders}</span>
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-[#FAF6EE] rounded-xl transition-colors">
              <span className="text-[#685B55] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Confirmed
              </span>
              <span className="font-bold text-lg text-[#2C221E]">{data.confirmed_orders}</span>
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-[#FAF6EE] rounded-xl transition-colors">
              <span className="text-[#685B55] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3B6E4C]"></span> Completed (Delivered)
              </span>
              <span className="font-bold text-lg text-[#3B6E4C]">{data.completed_orders}</span>
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-[#FAF6EE] rounded-xl transition-colors">
              <span className="text-[#685B55] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelled
              </span>
              <span className="font-bold text-lg text-red-500">{data.cancelled_orders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E5DCDB] p-8">
          <h2 className="text-xl font-bold text-[#2C221E] mb-6 flex justify-between items-center" style={{ fontFamily: "var(--font-heading)" }}>
            Top Selling Products
            {data.low_stock_products > 0 && (
              <span className="text-xs font-bold flex items-center text-red-600 bg-red-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {data.low_stock_products} Low Stock
              </span>
            )}
          </h2>
          <div className="space-y-4">
            {topProducts.map(product => (
              <div key={product.product_id} className="flex justify-between items-center border-b border-[#E5DCDB] pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-[#2C221E] text-lg">{product.product_name}</p>
                  <p className="text-sm text-[#E88D36] font-medium mt-0.5">{product.total_sold} units sold</p>
                </div>
                <div className="font-bold text-[#3B6E4C] text-lg bg-[#3B6E4C]/5 px-3 py-1 rounded-lg">
                  ₹{product.revenue.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-[#E5DCDB] mx-auto mb-3" />
                <p className="text-[#685B55] font-medium">No sales data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
