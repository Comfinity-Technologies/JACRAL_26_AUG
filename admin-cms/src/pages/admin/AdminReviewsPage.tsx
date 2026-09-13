import { useState, useEffect } from "react";
import {
  Star, Plus, Trash2, CheckCircle2, EyeOff, Eye, Edit3, X, Save, Loader2
} from "lucide-react";

interface Review {
  id: number;
  customer_name: string;
  customer_location?: string | null;
  review_text: string;
  rating: number;
  display_order: number;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
}

interface ReviewFormData {
  customer_name: string;
  customer_location: string;
  review_text: string;
  rating: number;
  display_order: number;
  is_active: boolean;
  is_published: boolean;
}

const EMPTY_FORM: ReviewFormData = {
  customer_name: "",
  customer_location: "",
  review_text: "",
  rating: 5,
  display_order: 1,
  is_active: true,
  is_published: false,
};

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("jacral_admin_token");
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ReviewFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/v1/admin/reviews");
      setReviews(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (r: Review) => {
    setEditId(r.id);
    setForm({
      customer_name: r.customer_name,
      customer_location: r.customer_location ?? "",
      review_text: r.review_text,
      rating: r.rating,
      display_order: r.display_order,
      is_active: r.is_active,
      is_published: r.is_published,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        customer_location: form.customer_location || null,
      };
      if (editId) {
        await apiFetch(`/api/v1/admin/reviews/${editId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/api/v1/admin/reviews", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await apiFetch(`/api/v1/admin/reviews/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handlePublish = async (r: Review) => {
    setBusyId(r.id);
    try {
      if (r.is_published) {
        await apiFetch(`/api/v1/admin/reviews/${r.id}/unpublish`, { method: "POST" });
      } else {
        await apiFetch(`/api/v1/admin/reviews/${r.id}/publish`, { method: "POST" });
      }
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#2C221E]">Customer Reviews</h1>
          <p className="text-sm text-[#7A6A60] mt-1">Manage and publish customer reviews shown on the homepage</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#285B3C] text-white text-sm font-bold shadow hover:bg-[#1E4A2E] transition-colors"
        >
          <Plus size={16} />
          Add Review
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#285B3C]" />
        </div>
      )}

      {/* Reviews table */}
      {!isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0D5] overflow-hidden">
          {reviews.length === 0 ? (
            <div className="text-center py-20 text-[#9E928A]">
              <Star size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No reviews yet</p>
              <p className="text-xs mt-1">Click "Add Review" to create the first one</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F7F0DF] border-b border-[#E8E0D5]">
                <tr>
                  <th className="text-left px-5 py-3 font-bold text-[#2C221E] text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 font-bold text-[#2C221E] text-xs uppercase tracking-wider hidden md:table-cell">Review</th>
                  <th className="text-center px-5 py-3 font-bold text-[#2C221E] text-xs uppercase tracking-wider">Rating</th>
                  <th className="text-center px-5 py-3 font-bold text-[#2C221E] text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 font-bold text-[#2C221E] text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DA]">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF6EE] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#2C221E]">{r.customer_name}</div>
                      {r.customer_location && (
                        <div className="text-[#9E928A] text-xs mt-0.5">{r.customer_location}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell max-w-xs">
                      <p className="text-[#685B55] text-xs leading-relaxed line-clamp-2">{r.review_text}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-[#E5A832] text-[#E5A832]" />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          r.is_published
                            ? "bg-[#E5EEDB] text-[#285B3C]"
                            : "bg-[#FFF3E0] text-[#C67A20]"
                        }`}
                      >
                        {r.is_published ? <CheckCircle2 size={10} /> : <EyeOff size={10} />}
                        {r.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Publish / Unpublish */}
                        <button
                          onClick={() => handlePublish(r)}
                          disabled={busyId === r.id}
                          title={r.is_published ? "Unpublish" : "Publish"}
                          className={`p-2 rounded-lg transition-colors ${
                            r.is_published
                              ? "text-[#9E928A] hover:bg-[#FFF3E0] hover:text-[#C67A20]"
                              : "text-[#285B3C] hover:bg-[#E5EEDB]"
                          }`}
                        >
                          {busyId === r.id ? <Loader2 size={15} className="animate-spin" /> : r.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(r)}
                          title="Edit"
                          className="p-2 rounded-lg text-[#685B55] hover:bg-[#F0E8DA] transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={busyId === r.id}
                          title="Delete"
                          className="p-2 rounded-lg text-[#C0444A] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#E8E0D5]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D5]">
              <h2 className="text-base font-black text-[#2C221E]">
                {editId ? "Edit Review" : "Add Customer Review"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-[#9E928A] hover:text-[#2C221E] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1.5">Customer Name *</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="e.g. Vikram Menon"
                  className="w-full rounded-xl border border-[#D5C9BF] px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#285B3C]/30 bg-[#FAF6EE]"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1.5">Location (optional)</label>
                <input
                  type="text"
                  value={form.customer_location}
                  onChange={(e) => setForm({ ...form, customer_location: e.target.value })}
                  placeholder="e.g. Kochi"
                  className="w-full rounded-xl border border-[#D5C9BF] px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#285B3C]/30 bg-[#FAF6EE]"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1.5">Review Text *</label>
                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                  rows={4}
                  placeholder="Write the customer review here..."
                  className="w-full rounded-xl border border-[#D5C9BF] px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#285B3C]/30 bg-[#FAF6EE] resize-none"
                />
              </div>

              {/* Rating + Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1.5">Rating (1–5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C9BF] px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#285B3C]/30 bg-[#FAF6EE]"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C9BF] px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#285B3C]/30 bg-[#FAF6EE]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#285B3C]"
                  />
                  <span className="text-sm font-medium text-[#2C221E]">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#285B3C]"
                  />
                  <span className="text-sm font-medium text-[#2C221E]">Published (visible on homepage)</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E0D5] bg-[#FAF6EE] rounded-b-2xl">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#685B55] hover:bg-[#F0E8DA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.customer_name.trim() || !form.review_text.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#285B3C] text-white text-sm font-bold shadow hover:bg-[#1E4A2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving..." : editId ? "Save Changes" : "Add Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
