import { useState } from "react";
import { Server, Activity, CheckCircle2, RotateCw, HardDrive, Shield, AlertTriangle } from "lucide-react";

interface Service {
  name: string;
  type: string;
  status: "Healthy" | "Degraded" | "Stopped";
  uptime: string;
  latency: string;
  port: number;
  memory: string;
}

const SERVICES_DATA: Service[] = [
  { name: "JACRAL FastAPI Engine", type: "Core REST API", status: "Healthy", uptime: "99.98%", latency: "14ms", port: 8000, memory: "118 MB" },
  { name: "PostgreSQL Database", type: "Relational DB", status: "Healthy", uptime: "100%", latency: "2ms", port: 5432, memory: "412 MB" },
  { name: "Redis Cache Store", type: "In-Memory Cache", status: "Healthy", uptime: "99.99%", latency: "1ms", port: 6379, memory: "42 MB" },
  { name: "Shiprocket Order Sync Worker", type: "Background Queue", status: "Healthy", uptime: "99.95%", latency: "45ms", port: 8081, memory: "64 MB" },
  { name: "SMTP Email Dispatch Service", type: "Mail Worker", status: "Healthy", uptime: "99.90%", latency: "120ms", port: 587, memory: "38 MB" },
  { name: "PDF Audit & Export Generator", type: "Worker Queue", status: "Healthy", uptime: "99.99%", latency: "85ms", port: 8082, memory: "82 MB" },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>(SERVICES_DATA);
  const [restarting, setRestarting] = useState<string | null>(null);

  const handleRestart = (name: string) => {
    setRestarting(name);
    setTimeout(() => {
      setRestarting(null);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-[#3B6E4C]/10 p-2.5 rounded-2xl text-[#3B6E4C]">
              <Server size={26} />
            </div>
            Services & Infrastructure Status
          </h1>
          <p className="text-[#685B55] mt-1">Real-time health monitoring of backend microservices, DB engines, and queue workers.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-full">
            <CheckCircle2 size={16} /> All Systems Operational
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E5DCDB] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#685B55]">Total Microservices</p>
          <p className="text-3xl font-bold text-[#2C221E] mt-1">{services.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E5DCDB] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#685B55]">Avg API Latency</p>
          <p className="text-3xl font-bold text-[#3B6E4C] mt-1">14 ms</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E5DCDB] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#685B55]">System Uptime</p>
          <p className="text-3xl font-bold text-[#2C221E] mt-1">99.98%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E5DCDB] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#685B55]">Total RAM Consumption</p>
          <p className="text-3xl font-bold text-[#E88D36] mt-1">756 MB</p>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-[28px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider border-b border-[#E5DCDB]">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Port</th>
                <th className="px-6 py-4">Latency</th>
                <th className="px-6 py-4">Memory</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {services.map((s) => (
                <tr key={s.name} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-[#2C221E] text-base">{s.name}</div>
                    <div className="text-xs text-[#685B55] mt-0.5">Uptime: {s.uptime}</div>
                  </td>
                  <td className="px-6 py-5 font-semibold text-sm text-[#2C221E]">{s.type}</td>
                  <td className="px-6 py-5 font-mono text-xs font-bold text-[#3B6E4C]">:{s.port}</td>
                  <td className="px-6 py-5 font-bold text-[#2C221E]">{s.latency}</td>
                  <td className="px-6 py-5 font-medium text-[#685B55]">{s.memory}</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 w-fit">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleRestart(s.name)}
                      disabled={restarting === s.name}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF6EE] text-[#2C221E] hover:bg-[#3B6E4C] hover:text-white transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <RotateCw size={14} className={restarting === s.name ? "animate-spin" : ""} />
                      {restarting === s.name ? "Restarting..." : "Restart"}
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
