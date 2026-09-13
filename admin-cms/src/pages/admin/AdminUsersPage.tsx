import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Users } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AdminUsersPage = () => {
  const [activeTab, setActiveTab] = useState<"customers" | "staff">("customers");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", phone: "" });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === "customers" ? "/api/v1/admin/users/customers?limit=50" : "/api/v1/admin/users/staff?limit=50";
      const res = await apiClient.get(endpoint);
      setUsers(res.data.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await apiClient.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update role");
    }
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      await apiClient.patch(`/api/v1/admin/users/${userId}/status`, { is_active: !isActive });
      fetchUsers();
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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/v1/admin/users", newStaff);
      setShowAddForm(false);
      setNewStaff({ name: "", email: "", password: "", role: "EMPLOYEE", phone: "" });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create user");
    }
  };

  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
              <Users size={24} />
            </div>
            Manage Users
          </h1>
          <p className="text-[#685B55]">View and manage customer and staff accounts.</p>
        </div>
        {activeTab === "staff" && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-[#E88D36] text-[#2C221E] px-6 py-3 rounded-full font-bold hover:bg-[#D47E2A] hover:text-white transition-colors shadow-lg shadow-[#E88D36]/20">
            Add Person
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-[#E5DCDB] pb-4">
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === "customers" ? "bg-[#3B6E4C] text-white" : "bg-[#FAF6EE] text-[#685B55] hover:bg-[#E5DCDB]"}`}
        >
          Customers
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === "staff" ? "bg-[#3B6E4C] text-white" : "bg-[#FAF6EE] text-[#685B55] hover:bg-[#E5DCDB]"}`}
        >
          People
        </button>
      </div>

      {showAddForm && activeTab === "staff" && (
        <form onSubmit={handleAddStaff} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E5DCDB] space-y-4">
          <h2 className="text-lg font-bold">Add Staff Member</h2>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Name" className="border-2 p-3 rounded-xl outline-none" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
            <input required type="email" placeholder="Email" className="border-2 p-3 rounded-xl outline-none" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
            <input required minLength={8} type="password" placeholder="Password" className="border-2 p-3 rounded-xl outline-none" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
            <select className="border-2 p-3 rounded-xl outline-none bg-white" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
              <option value="PRO_ADMIN">Pro Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 rounded-xl text-[#685B55] font-bold">Cancel</button>
             <button type="submit" className="px-6 py-2 rounded-xl bg-[#3B6E4C] text-white font-bold">Save Person</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="h-96 bg-gray-200 animate-pulse rounded-3xl"></div>
      ) : (
      <div className="bg-white rounded-[24px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-[24px]">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-[24px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5 font-bold text-[#2C221E]">{u.name}</td>
                  <td className="px-6 py-5 text-[#685B55] font-medium">{u.email}</td>
                  <td className="px-6 py-5">
                    <select
                      className="border-2 border-[#E5DCDB] rounded-xl px-3 py-2 bg-white text-[#2C221E] font-bold text-sm focus:border-[#E88D36] outline-none transition-colors cursor-pointer"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="PRO_ADMIN">Pro Admin</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      u.is_active 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleStatusChange(u.id, u.is_active)}
                      className={`font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${
                        u.is_active 
                          ? 'text-red-500 hover:bg-red-50' 
                          : 'text-[#3B6E4C] hover:bg-[#3B6E4C]/10'
                      }`}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#685B55] font-medium">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
