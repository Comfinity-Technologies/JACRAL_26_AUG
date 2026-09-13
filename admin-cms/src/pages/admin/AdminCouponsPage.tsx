import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Plus, Tag } from "lucide-react";

interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number;
  used_count: number;
  is_active: boolean;
}

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "", discount_type: "percentage", discount_value: "", minimum_order_amount: "0"
  });

  const fetchCoupons = async () => {
    try {
      const res = await apiClient.get("/api/v1/admin/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/v1/admin/coupons", {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        minimum_order_amount: parseFloat(formData.minimum_order_amount)
      });
      setShowForm(false);
      setFormData({ code: "", discount_type: "percentage", discount_value: "", minimum_order_amount: "0" });
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create coupon");
    }
  };

  if (isLoading) return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
      <div className="h-96 bg-gray-200 animate-pulse rounded-3xl"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
              <Tag size={24} />
            </div>
            Coupons
          </h1>
          <p className="text-[#685B55]">Create and manage discount coupons for customers.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#E88D36] text-[#2C221E] px-6 py-3 rounded-full font-bold hover:bg-[#D47E2A] hover:text-white transition-colors shadow-lg shadow-[#E88D36]/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add Coupon</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E5DCDB] space-y-6">
          <h2 className="text-xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">Coupon Code</label>
              <input
                required type="text"
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors font-mono uppercase font-bold tracking-widest"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="SAVE20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">Discount Type</label>
              <select
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors bg-white cursor-pointer font-medium"
                value={formData.discount_type}
                onChange={e => setFormData({...formData, discount_type: e.target.value})}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                Value {formData.discount_type === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                required type="number" step="0.01"
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors"
                value={formData.discount_value}
                onChange={e => setFormData({...formData, discount_value: e.target.value})}
                placeholder="20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">Min Order (₹)</label>
              <input
                required type="number" step="0.01"
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors"
                value={formData.minimum_order_amount}
                onChange={e => setFormData({...formData, minimum_order_amount: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DCDB]">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl font-bold text-[#685B55] hover:bg-[#FAF6EE] transition-colors">Cancel</button>
            <button type="submit" className="bg-[#3B6E4C] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#285642] transition-colors shadow-lg shadow-[#3B6E4C]/20">Create Coupon</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[24px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-[24px]">Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Uses</th>
                <th className="px-6 py-4 rounded-tr-[24px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5">
                    <span className="font-mono font-bold text-[#2C221E] bg-[#FAF6EE] px-3 py-1.5 rounded-lg tracking-widest text-sm">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-6 py-5 capitalize font-medium text-[#685B55]">{c.discount_type}</td>
                  <td className="px-6 py-5 font-bold text-[#3B6E4C] text-lg">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td className="px-6 py-5 font-medium text-[#685B55]">₹{c.minimum_order_amount}</td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-[#2C221E] bg-[#E5DCDB]/50 px-3 py-1.5 rounded-lg">
                      {c.used_count} uses
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E5DCDB] text-[#685B55]'
                    }`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#685B55] font-medium">
                    No coupons created yet.
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

export default AdminCouponsPage;
