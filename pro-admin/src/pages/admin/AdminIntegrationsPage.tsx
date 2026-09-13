import { useState } from "react";
import { Cpu, RefreshCw, CheckCircle, AlertCircle, Settings, ShieldCheck, Zap } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  category: "Payment" | "Logistics" | "ERP & Tax" | "Notification";
  description: string;
  status: "Connected" | "Disconnected" | "Syncing";
  lastSync: string;
  environment: "Production" | "Sandbox";
  version: string;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "INT-RZP",
    name: "Razorpay Checkout",
    category: "Payment",
    description: "Accepts UPI, Credit/Debit cards, NetBanking and Wallets.",
    status: "Connected",
    lastSync: "2 mins ago",
    environment: "Production",
    version: "v2.4.0",
  },
  {
    id: "INT-SHP",
    name: "Shiprocket Logistics",
    category: "Logistics",
    description: "Automated order dispatch, courier routing, and live AWB tracking.",
    status: "Connected",
    lastSync: "10 mins ago",
    environment: "Production",
    version: "v1.8.2",
  },
  {
    id: "INT-CF",
    name: "Cashfree Payments",
    category: "Payment",
    description: "Backup payment gateway & instant refund disburser.",
    status: "Connected",
    lastSync: "1 hour ago",
    environment: "Production",
    version: "v3.1.0",
  },
  {
    id: "INT-TALLY",
    name: "Tally Prime ERP",
    category: "ERP & Tax",
    description: "GST e-invoicing and automated ledger synchronization.",
    status: "Connected",
    lastSync: "4 hours ago",
    environment: "Production",
    version: "v4.0.1",
  },
  {
    id: "INT-SND",
    name: "SendGrid Email Engine",
    category: "Notification",
    description: "Transactional order notifications and customer receipt emails.",
    status: "Connected",
    lastSync: "Realtime",
    environment: "Production",
    version: "v3.0.0",
  },
];

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, lastSync: "Just now", status: "Connected" } : item
        )
      );
      setSyncingId(null);
    }, 1200);
  };

  const toggleStatus = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Connected" ? "Disconnected" : "Connected",
            }
          : item
      )
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-[#3B6E4C]/10 p-2.5 rounded-2xl text-[#3B6E4C]">
              <Cpu size={26} />
            </div>
            System Integrations & APIs
          </h1>
          <p className="text-[#685B55] mt-1">Manage payment gateways, logistics webhooks, ERP connectors, and notifications.</p>
        </div>

        <button
          onClick={() => handleSync("ALL")}
          className="flex items-center gap-2 bg-[#3B6E4C] text-white px-6 py-3.5 rounded-full font-bold hover:bg-[#285642] transition-all shadow-lg shadow-[#3B6E4C]/20"
        >
          <RefreshCw size={18} className={syncingId === "ALL" ? "animate-spin" : ""} />
          <span>Test All Connections</span>
        </button>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className="bg-white p-7 rounded-[28px] border border-[#E5DCDB] shadow-sm flex flex-col justify-between space-y-6 hover:border-[#3B6E4C]/30 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF6EE] text-[#E88D36] border border-[#E5DCDB]">
                  {item.category}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  item.status === "Connected" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}>
                  {item.status === "Connected" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {item.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#2C221E] mt-4" style={{ fontFamily: "var(--font-heading)" }}>
                {item.name}
              </h3>
              <p className="text-sm text-[#685B55] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5DCDB] flex items-center justify-between text-xs text-[#685B55]">
              <div className="space-y-0.5">
                <p><span className="font-bold text-[#2C221E]">Last Sync:</span> {item.lastSync}</p>
                <p><span className="font-bold text-[#2C221E]">Env:</span> {item.environment} ({item.version})</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSync(item.id)}
                  disabled={syncingId === item.id}
                  className="p-2.5 rounded-xl bg-[#FAF6EE] text-[#2C221E] hover:bg-[#3B6E4C] hover:text-white transition-colors"
                  title="Test Connection"
                >
                  <RefreshCw size={16} className={syncingId === item.id ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-colors ${
                    item.status === "Connected" ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {item.status === "Connected" ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Endpoints Info */}
      <div className="bg-[#FAF6EE] p-8 rounded-[32px] border border-[#E5DCDB] space-y-4">
        <h2 className="text-xl font-bold text-[#2C221E] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
          <Zap className="text-[#E88D36]" size={20} /> Registered Webhook Listener Endpoints
        </h2>
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-white rounded-xl border border-[#E5DCDB] flex items-center justify-between text-[#2C221E]">
            <span>POST /api/v1/payments/razorpay/webhook</span>
            <span className="text-emerald-700 font-bold">200 OK (HMAC Verified)</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#E5DCDB] flex items-center justify-between text-[#2C221E]">
            <span>POST /api/v1/shipping/shiprocket/webhook</span>
            <span className="text-emerald-700 font-bold">200 OK (Signed)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
