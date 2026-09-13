import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Plus, Tags } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/api/v1/admin/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/v1/admin/categories", { name });
      setName("");
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create category");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this category?`)) return;
    try {
      await apiClient.patch(`/api/v1/admin/categories/${id}/status`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} category`);
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
            <div className="bg-[#E88D36]/10 p-2 rounded-xl text-[#E88D36]">
              <Tags size={24} />
            </div>
            Categories
          </h1>
          <p className="text-[#685B55]">Organize products into categories.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-[#E88D36] text-[#2C221E] px-6 py-3 rounded-full font-bold hover:bg-[#D47E2A] hover:text-white transition-colors shadow-lg shadow-[#E88D36]/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E5DCDB] flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">Category Name</label>
            <input required type="text" className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Organic Teas" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-[#685B55] hover:bg-[#FAF6EE] transition-colors h-12">Cancel</button>
            <button type="submit" className="flex-1 md:flex-none bg-[#3B6E4C] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#285642] transition-colors shadow-lg shadow-[#3B6E4C]/20 h-12">Save</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[24px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-[24px]">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-[24px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5 font-bold text-[#2C221E]">{c.name}</td>
                  <td className="px-6 py-5 font-mono text-sm text-[#685B55]">{c.slug}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      c.is_active 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-[#E5DCDB] text-[#685B55]'
                    }`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleToggleStatus(c.id, c.is_active)} 
                      className={`font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${
                        c.is_active 
                          ? "text-red-500 hover:bg-red-50" 
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {c.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#685B55] font-medium">
                    No categories found.
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

export default AdminCategoriesPage;
