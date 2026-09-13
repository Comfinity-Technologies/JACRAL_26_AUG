import { useState, useEffect } from "react";
import { ShieldCheck, Save, Loader2 } from "lucide-react";
import { getAuthToken } from "../../utils/auth";

interface Permission {
  id: number;
  role: string;
  page: string;
  can_access: boolean;
}

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availablePages = [
    { key: "/admin/orders", label: "Orders" },
    { key: "/admin/products", label: "Products" },
    { key: "/admin/categories", label: "Categories" },
    { key: "/admin/users", label: "Users" },
    { key: "/admin/coupons", label: "Coupons" },
    { key: "/admin/reviews", label: "Reviews" },
    { key: "/admin/content/landing-page", label: "Landing Page CMS" },
    { key: "/admin/analytics", label: "Analytics" },
  ];

  const roles = ["ADMIN", "SUPER_ADMIN"];

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/users/permissions", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to load permissions");
      const data = await res.json();
      setPermissions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleToggle = (role: string, page: string) => {
    const existing = permissions.find((p) => p.role === role && p.page === page);
    if (existing) {
      setPermissions(permissions.map(p => 
        p.id === existing.id ? { ...p, can_access: !p.can_access } : p
      ));
    } else {
      // Temp id for local state
      setPermissions([...permissions, { id: Date.now(), role, page, can_access: true }]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/v1/admin/users/permissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(permissions.map(p => ({ role: p.role, page: p.page, can_access: p.can_access }))),
      });
      if (!res.ok) throw new Error("Failed to save permissions");
      alert("Permissions saved successfully");
      loadPermissions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase text-[#2C221E] flex items-center gap-2">
            <ShieldCheck size={24} className="text-[#E88D36]" />
            Role Permissions Management
          </h1>
          <p className="text-sm text-[#685B55] mt-1">
            Configure which pages the ADMIN and SUPER_ADMIN roles can access.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#3B6E4C] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#285B3C] transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {roles.map((role) => (
          <div key={role} className="bg-white rounded-2xl border border-[#E5DCDB] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#2C221E] uppercase border-b border-[#E5DCDB] pb-3 mb-4">
              {role.replace("_", " ")} Access
            </h2>
            <div className="space-y-4">
              {availablePages.map((page) => {
                const perm = permissions.find((p) => p.role === role && p.page === page.key);
                const isChecked = perm ? perm.can_access : false; // Default deny if not set, or we can make default true

                return (
                  <label key={page.key} className="flex items-center justify-between p-3 bg-[#FAF6EE] rounded-xl cursor-pointer hover:bg-[#F2EAE1] transition-colors">
                    <span className="text-sm font-semibold text-[#2C221E]">{page.label}</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isChecked}
                        onChange={() => handleToggle(role, page.key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B6E4C]"></div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
