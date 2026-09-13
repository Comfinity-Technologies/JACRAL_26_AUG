import { useState } from "react";
import { ShieldCheck, Lock, Key, Users, Eye, AlertOctagon, CheckCircle2, ShieldAlert } from "lucide-react";

interface RolePermission {
  role: string;
  level: number;
  description: string;
  accessCount: string;
  mfaRequired: boolean;
}

const ROLES_MATRIX: RolePermission[] = [
  { role: "PRO_ADMIN", level: 4, description: "Full system root access, infrastructure management, client controls.", accessCount: "1 Active Session", mfaRequired: true },
  { role: "SUPER_ADMIN", level: 3, description: "User role management, analytics export, coupon generation.", accessCount: "2 Active Sessions", mfaRequired: true },
  { role: "ADMIN", level: 2, description: "Product catalog updates, category creation, order status updates.", accessCount: "4 Active Sessions", mfaRequired: true },
  { role: "EMPLOYEE", level: 1, description: "View orders, view inventory status, customer assistance.", accessCount: "8 Active Sessions", mfaRequired: false },
  { role: "CUSTOMER", level: 0, description: "Standard storefront shopping, personal cart & checkout.", accessCount: "245 Active Sessions", mfaRequired: false },
];

export default function AdminSecurityPage() {
  const [roles, setRoles] = useState<RolePermission[]>(ROLES_MATRIX);
  const [jwtExpireMinutes, setJwtExpireMinutes] = useState(60);
  const [rateLimitRequests, setRateLimitRequests] = useState(100);

  const toggleMfa = (roleName: string) => {
    setRoles((prev) =>
      prev.map((r) => (r.role === roleName ? { ...r, mfaRequired: !r.mfaRequired } : r))
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-[#3B6E4C]/10 p-2.5 rounded-2xl text-[#3B6E4C]">
              <ShieldCheck size={26} />
            </div>
            Security & RBAC Enforcement
          </h1>
          <p className="text-[#685B55] mt-1">Role-Based Access Control, JWT policy configuration, and multi-factor authentication rules.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-full">
            <CheckCircle2 size={16} /> Encryption: HS256 Standard
          </span>
        </div>
      </div>

      {/* Security Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-7 rounded-[28px] border border-[#E5DCDB] shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#2C221E] font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            <Lock className="text-[#E88D36]" size={20} /> JWT Token Session Timeout
          </div>
          <p className="text-xs text-[#685B55]">Set access token expiration limit for authenticated admin users.</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={15}
              max={240}
              step={15}
              value={jwtExpireMinutes}
              onChange={(e) => setJwtExpireMinutes(Number(e.target.value))}
              className="w-full accent-[#3B6E4C]"
            />
            <span className="font-bold text-[#2C221E] text-sm whitespace-nowrap">{jwtExpireMinutes} Mins</span>
          </div>
        </div>

        <div className="bg-white p-7 rounded-[28px] border border-[#E5DCDB] shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#2C221E] font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            <ShieldAlert className="text-[#3B6E4C]" size={20} /> API Rate Limiting Threshold
          </div>
          <p className="text-xs text-[#685B55]">Max allowed requests per minute per IP before rate limiting kicks in.</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={30}
              max={300}
              step={10}
              value={rateLimitRequests}
              onChange={(e) => setRateLimitRequests(Number(e.target.value))}
              className="w-full accent-[#E88D36]"
            />
            <span className="font-bold text-[#2C221E] text-sm whitespace-nowrap">{rateLimitRequests} Req/min</span>
          </div>
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-white rounded-[28px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="p-6 border-b border-[#E5DCDB] bg-[#FAF6EE] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>
            Role-Based Access Control Hierarchy
          </h2>
          <span className="text-xs text-[#685B55] font-semibold">Strict Gated Endpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider border-b border-[#E5DCDB]">
              <tr>
                <th className="px-6 py-4">Role Identifier</th>
                <th className="px-6 py-4">Hierarchy Level</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Active Sessions</th>
                <th className="px-6 py-4">2FA Enforced</th>
                <th className="px-6 py-4 text-right">Toggle MFA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {roles.map((r) => (
                <tr key={r.role} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2C221E] text-white font-mono">
                      {r.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#3B6E4C]">Level {r.level}</td>
                  <td className="px-6 py-5 text-sm text-[#685B55] max-w-xs truncate">{r.description}</td>
                  <td className="px-6 py-5 text-sm font-semibold text-[#2C221E]">{r.accessCount}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.mfaRequired ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"
                    }`}>
                      {r.mfaRequired ? "Required" : "Optional"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => toggleMfa(r.role)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF6EE] text-[#2C221E] hover:bg-[#3B6E4C] hover:text-white transition-colors"
                    >
                      Toggle 2FA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
