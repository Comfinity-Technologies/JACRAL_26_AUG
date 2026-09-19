import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Tag, Users, MessageSquare, Layers } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { label: "Products", path: "/admin/products", icon: Layers },
    { label: "Coupons", path: "/admin/coupons", icon: Tag },
    { label: "CMS Landing", path: "/admin/cms", icon: MessageSquare },
    { label: "Reviews", path: "/admin/reviews", icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#2C221E] text-white flex flex-col shrink-0 min-h-screen">
      <div className="p-6 border-b border-white/10">
        <Link to="/admin" className="text-xl font-black tracking-widest text-[#FFB800]">JACRAL CMS</Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                isActive ? "bg-[#3B6E4C] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
