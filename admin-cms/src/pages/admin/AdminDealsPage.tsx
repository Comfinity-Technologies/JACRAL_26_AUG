import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "../../utils/image";

interface Deal {
  id: number;
  title: string;
  subtitle: string;
  link_url: string;
  bg_color: string;
  text_color: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyForm = {
  title: "", subtitle: "", link_url: "", bg_color: "#FF7000", text_color: "#ffffff", display_order: 1
};

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      const res = await apiClient.get("/api/v1/admin/deals");
      setDeals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete this deal? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/v1/admin/deals/${id}`);
      fetchDeals();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete deal");
    }
  };

  const startEdit = (d: Deal) => {
    setEditingId(d.id);
    setFormData({
      title: d.title,
      subtitle: d.subtitle,
      link_url: d.link_url,
      bg_color: d.bg_color,
      text_color: d.text_color,
      display_order: d.display_order,
    });
    setImageFile(null);
    setImagePreview(d.image_url ? getImageUrl(d.image_url) : null);
    setShowForm(true);
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (file: File | undefined) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.patch(`/api/v1/admin/deals/${editingId}`, formData);
        if (imageFile) {
          const imgData = new FormData();
          imgData.append("file", imageFile);
          await apiClient.post(`/api/v1/admin/deals/${editingId}/image`, imgData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }
      } else {
        if (!imageFile) {
          alert("Image is required to create a new deal card.");
          return;
        }
        const createData = new FormData();
        createData.append("file", imageFile);
        createData.append("title", formData.title);
        createData.append("subtitle", formData.subtitle);
        createData.append("link_url", formData.link_url);
        createData.append("bg_color", formData.bg_color);
        createData.append("text_color", formData.text_color);
        createData.append("display_order", String(formData.display_order));
        createData.append("is_active", "true");

        await apiClient.post(`/api/v1/admin/deals`, createData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      closeForm();
      fetchDeals();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save deal");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] mb-2" style={{ fontFamily: "var(--font-heading)" }}>Category Deals</h1>
          <p className="text-[#685B55]">Manage the promotional cards displayed on the shop page.</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#FAF6EE] text-[#2C221E] font-bold rounded-full shadow-sm hover:bg-[#E88D36] hover:text-white transition-colors"
        >
          <Plus size={18} /> Add Deal
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5DCDB] space-y-4">
          <h3 className="text-lg font-bold">{editingId ? "Edit Deal" : "New Deal"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Everything under ₹499" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Subtitle</label>
              <input required value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Fashion, home & more" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Link URL</label>
              <input required value={formData.link_url} onChange={e => setFormData({...formData, link_url: e.target.value})} className="w-full p-2 border rounded" placeholder="/shop?maxPrice=499" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Display Order</label>
              <input type="number" required value={formData.display_order} onChange={e => setFormData({...formData, display_order: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Background Color</label>
              <input type="color" value={formData.bg_color} onChange={e => setFormData({...formData, bg_color: e.target.value})} className="w-full h-10 p-1 border rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Text Color</label>
              <input type="color" value={formData.text_color} onChange={e => setFormData({...formData, text_color: e.target.value})} className="w-full h-10 p-1 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Deal Image</label>
            <div className="flex gap-4 items-center">
              {imagePreview ? (
                <img src={imagePreview} className="w-24 h-24 object-cover rounded-xl border border-[#E5DCDB]" />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl border border-dashed border-gray-300">
                  <ImageIcon className="text-gray-400" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0])} />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={closeForm} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-[#3B6E4C] text-white">Save Deal</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="relative rounded-2xl overflow-hidden shadow-sm flex flex-col h-[240px]" style={{ backgroundColor: deal.bg_color, color: deal.text_color }}>
              <div className="p-4 flex-1">
                <h3 className="text-xl font-black leading-tight mb-1">{deal.title}</h3>
                <p className="text-sm opacity-90">{deal.subtitle}</p>
              </div>
              <div className="h-[120px] w-full overflow-hidden">
                {deal.image_url && <img src={getImageUrl(deal.image_url)} alt={deal.title} className="w-full h-full object-cover" />}
              </div>
              
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => startEdit(deal)} className="p-1.5 bg-white/80 text-black rounded hover:bg-white"><Pencil size={14}/></button>
                <button onClick={() => handleDelete(deal.id)} className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
