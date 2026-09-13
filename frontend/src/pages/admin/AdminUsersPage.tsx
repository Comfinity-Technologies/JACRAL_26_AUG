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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/api/v1/admin/users?limit=50");
      setUsers(res.data.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
          <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
            <Users size={24} />
          </div>
          Manage Users
        </h1>
        <p className="text-[#685B55]">View and manage customer and staff accounts.</p>
      </div>
      
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
    </div>
  );
};

export default AdminUsersPage;
