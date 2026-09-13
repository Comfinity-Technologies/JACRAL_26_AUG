import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { ListOrdered } from "lucide-react";

interface Order {
  id: number;
  user_id: number;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_name: string;
  created_at: string;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get("/api/v1/admin/orders?limit=50");
      setOrders(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/v1/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update status");
    }
  };

  if (isLoading) return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
      <div className="h-96 bg-gray-200 animate-pulse rounded-3xl"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
          <div className="bg-[#E88D36]/10 p-2 rounded-xl text-[#E88D36]">
            <ListOrdered size={24} />
          </div>
          Orders
        </h1>
        <p className="text-[#685B55]">Manage and track all customer orders.</p>
      </div>
      
      <div className="bg-white rounded-[24px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-[24px]">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 rounded-tr-[24px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5 font-bold text-[#2C221E]">#{o.id}</td>
                  <td className="px-6 py-5 font-medium text-[#2C221E]">{o.shipping_name}</td>
                  <td className="px-6 py-5 text-sm text-[#685B55] font-medium">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-5 font-bold text-[#3B6E4C]">₹{o.total_amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      o.payment_status === 'paid' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      className="border-2 border-[#E5DCDB] rounded-xl px-3 py-2 bg-white text-[#2C221E] font-medium text-sm focus:border-[#E88D36] outline-none transition-colors cursor-pointer"
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#685B55] font-medium">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
