import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Plus, Edit3, Trash2, FileText, X, Check, Eye, EyeOff } from "lucide-react";

type Policy = {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  updated_at?: string;
};

const EMPTY_FORM = {
  slug: "",
  title: "",
  content: "",
  is_active: true,
};

const SLUG_OPTIONS = [
  { value: "privacy", label: "Privacy Policy" },
  { value: "terms", label: "Terms of Service" },
  { value: "shipping", label: "Shipping Policy" },
  { value: "return", label: "Return & Refund Policy" },
];

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/policies");
      setPolicies(data);
    } catch (err) {
      console.error("Failed to load policies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingPolicy(null);
    setForm(EMPTY_FORM);
  };

  const handleStartCreate = () => {
    setEditingPolicy(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleStartEdit = (p: Policy) => {
    setEditingPolicy(p);
    setForm({ slug: p.slug, title: p.title, content: p.content, is_active: p.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.title || !form.content) {
      alert("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      if (editingPolicy) {
        await apiClient.patch(`/api/v1/policies/${editingPolicy.slug}`, {
          title: form.title,
          content: form.content,
          is_active: form.is_active,
        });
      } else {
        await apiClient.post("/api/v1/policies", form);
      }
      resetForm();
      fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save policy.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete the "${slug}" policy? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/v1/policies/${slug}`);
      fetchPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (p: Policy) => {
    try {
      await apiClient.patch(`/api/v1/policies/${p.slug}`, { is_active: !p.is_active });
      fetchPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  const previewPolicy = policies.find((p) => p.slug === previewSlug);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] mb-1 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-[#E88D36]/10 p-2 rounded-xl text-[#E88D36]">
              <FileText size={24} />
            </div>
            Site Policies
          </h1>
          <p className="text-[#685B55]">Manage Privacy, Terms, Shipping and Return policies stored in the database.</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="flex items-center gap-2 bg-[#E88D36] text-[#2C221E] px-6 py-3 rounded-full font-bold hover:bg-[#D47E2A] hover:text-white transition-colors shadow-lg shadow-[#E88D36]/20"
        >
          <Plus size={18} /> Add Policy
        </button>
      </div>

      {/* ── Policy Form ── */}
      {showForm && (
        <div className="bg-white p-8 rounded-[24px] shadow-md border-2 border-[#E88D36]/30 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DCDB] pb-4">
            <h2 className="text-xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>
              {editingPolicy ? `Edit: ${editingPolicy.title}` : "New Policy"}
            </h2>
            <button onClick={resetForm} className="p-2 text-[#685B55] hover:text-red-600 rounded-full hover:bg-gray-100 transition">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                Policy Type (Slug)
              </label>
              {editingPolicy ? (
                <div className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 bg-[#FAF6EE] text-[#685B55] font-medium">
                  {form.slug}
                  <span className="ml-2 text-xs">(cannot change slug)</span>
                </div>
              ) : (
                <select
                  value={form.slug}
                  onChange={(e) => {
                    const found = SLUG_OPTIONS.find((o) => o.value === e.target.value);
                    setForm({ ...form, slug: e.target.value, title: found?.label || form.title });
                  }}
                  className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#E88D36] transition-colors bg-white text-[#2C221E]"
                >
                  <option value="">Select policy type…</option>
                  {SLUG_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#E88D36] transition-colors text-[#2C221E]"
                placeholder="e.g. Privacy Policy"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 mt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E88D36]" />
              </label>
              <span className="text-sm font-medium text-[#2C221E]">
                {form.is_active ? "Visible on website" : "Hidden from website"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
              Content (HTML)
              <span className="ml-2 text-xs font-normal text-[#685B55] normal-case">Supports &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;strong&gt;</span>
            </label>
            <textarea
              rows={14}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#E88D36] transition-colors resize-y font-mono text-sm text-[#2C221E] bg-[#FCFAF4]"
              placeholder="<h2>Policy Title</h2>&#10;<p>Your content here…</p>"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DCDB]">
            <button onClick={resetForm} className="px-6 py-3 rounded-xl font-bold text-[#685B55] hover:bg-[#FAF6EE] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E88D36] text-[#2C221E] px-8 py-3 rounded-xl font-bold hover:bg-[#D47E2A] hover:text-white transition-colors shadow-lg shadow-[#E88D36]/20 flex items-center gap-2 disabled:opacity-60"
            >
              <Check size={18} />
              <span>{saving ? "Saving…" : editingPolicy ? "Update Policy" : "Save Policy"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Policies Table ── */}
      <div className="bg-white rounded-[24px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-[24px]">Policy</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right rounded-tr-[24px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-[#2C221E]">{p.title}</div>
                    <div className="text-xs text-[#685B55] mt-0.5 max-w-xs truncate">
                      {p.content.replace(/<[^>]+>/g, " ").slice(0, 80)}…
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-[#FAF6EE] text-[#685B55] text-xs font-mono px-2.5 py-1 rounded-lg border border-[#E5DCDB]">
                      {p.slug}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      p.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-[#E5DCDB] text-[#685B55]"
                    }`}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#685B55]">
                    {p.updated_at
                      ? new Date(p.updated_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Preview */}
                      <button
                        onClick={() => setPreviewSlug(previewSlug === p.slug ? null : p.slug)}
                        className="text-xs px-3 py-2 rounded-lg bg-[#FAF6EE] text-[#685B55] hover:bg-[#3B6E4C]/10 hover:text-[#3B6E4C] transition-all border border-[#E5DCDB] inline-flex items-center gap-1"
                        title="Preview content"
                      >
                        {previewSlug === p.slug ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>Preview</span>
                      </button>

                      {/* Toggle visibility */}
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                          p.is_active
                            ? "text-[#E88D36] border-[#E88D36]/30 hover:bg-[#E88D36]/10"
                            : "text-[#3B6E4C] border-[#3B6E4C]/30 hover:bg-[#3B6E4C]/10"
                        }`}
                      >
                        {p.is_active ? "Hide" : "Show"}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="text-xs px-3 py-2 rounded-lg bg-[#E88D36]/10 text-[#E88D36] hover:bg-[#E88D36] hover:text-white transition-all border border-[#E88D36]/30 inline-flex items-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(p.slug)}
                        className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-200 inline-flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {policies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <FileText size={40} className="mx-auto text-[#E5DCDB] mb-3" />
                    <p className="text-[#685B55] font-medium">No policies found.</p>
                    <p className="text-sm text-[#685B55]/70 mt-1">Click "Add Policy" or run the seed script to create the default policies.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Inline Preview Panel ── */}
      {previewPolicy && (
        <div className="bg-white rounded-[24px] border border-[#E88D36]/30 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#E88D36]/5 border-b border-[#E88D36]/20">
            <h3 className="font-bold text-[#2C221E]">Preview: {previewPolicy.title}</h3>
            <button
              onClick={() => setPreviewSlug(null)}
              className="text-[#685B55] hover:text-red-500 transition"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-8">
            <div
              className="policy-content"
              dangerouslySetInnerHTML={{ __html: previewPolicy.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
