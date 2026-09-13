import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Building2,
  Cpu,
  Server,
  ShieldCheck,
  History,
  LogOut,
  BarChart3,
  Leaf,
} from "lucide-react";

// Admin roles in JACRAL system
const ADMIN_ROLES = ["PRO_ADMIN", "SUPER_ADMIN", "ADMIN", "EMPLOYEE"];

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE]">
        <div className="text-[#685B55]">Loading...</div>
      </div>
    );
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", path: "/clients", icon: Building2 },
    { name: "Integrations", path: "/integrations", icon: Cpu },
    { name: "Services", path: "/services", icon: Server },
    { name: "Security", path: "/security", icon: ShieldCheck },
    { name: "Audit Logs", path: "/audit-logs", icon: History },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
  ];



  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const roleBadgeColor: Record<string, string> = {
    PRO_ADMIN: "bg-[#FFB800] text-[#2C221E]",
    SUPER_ADMIN: "bg-[#E88D36] text-white",
    ADMIN: "bg-[#3B6E4C] text-white",
    EMPLOYEE: "bg-white/20 text-white",
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2C221E] text-white flex-shrink-0 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B6E4C]">
            <Leaf size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-[0.18em]">JACRAL</h1>
            <p className="text-[0.65rem] text-white/40 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E88D36] flex items-center justify-center font-bold text-sm text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${roleBadgeColor[user.role] ?? "bg-white/20 text-white"}`}>
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold ${
                isActive(item.path)
                  ? "bg-[#3B6E4C] text-white shadow-lg shadow-[#3B6E4C]/20 translate-x-1"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold ${
                isActive("/settings")
                  ? "bg-[#3B6E4C] text-white shadow-lg shadow-[#3B6E4C]/20 translate-x-1"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span>Platform Settings</span>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/8 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#FAF6EE]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
