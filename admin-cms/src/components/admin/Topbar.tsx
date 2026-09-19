import React from "react";
import { LogOut } from "lucide-react";

interface TopbarProps {
  userEmail?: string;
  onLogout?: () => void;
}

export default function Topbar({ userEmail = "admin@jacral.com", onLogout }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E5DCDB] px-6 flex items-center justify-between shadow-sm">
      <div className="text-sm font-bold text-[#2C221E] uppercase tracking-wider">
        CMS Console
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-[#685B55]">{userEmail}</span>
        {onLogout && (
          <button onClick={onLogout} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#2C221E]" title="Logout">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
