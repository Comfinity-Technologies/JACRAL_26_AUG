import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { History, ShieldAlert, Filter, Search, Calendar, Terminal } from "lucide-react";

interface AuditLogItem {
  id: number;
  user_id: number | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/v1/admin/audit-logs?limit=50");
      setLogs(res.data.items || res.data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.target_type && log.target_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip_address && log.ip_address.includes(searchTerm));
    const matchesAction = selectedAction === "ALL" || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-[#3B6E4C]/10 p-2.5 rounded-2xl text-[#3B6E4C]">
              <History size={26} />
            </div>
            System Audit Trail Logs
          </h1>
          <p className="text-[#685B55] mt-1">Immutable administrative action logs with IP origin, timestamps, and payload metadata.</p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-2 bg-[#FAF6EE] border border-[#E5DCDB] text-[#2C221E] px-6 py-3.5 rounded-full font-bold hover:bg-[#3B6E4C] hover:text-white transition-all shadow-sm"
        >
          <History size={18} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5DCDB] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 text-[#A8988E]" size={18} />
          <input
            type="text"
            placeholder="Search action, target or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-[#E5DCDB] rounded-2xl outline-none focus:border-[#3B6E4C] text-sm text-[#2C221E]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={18} className="text-[#685B55]" />
          <span className="text-sm font-bold text-[#2C221E]">Action Filter:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border-2 border-[#E5DCDB] rounded-2xl px-4 py-2.5 text-sm font-semibold bg-white text-[#2C221E] outline-none focus:border-[#3B6E4C]"
          >
            <option value="ALL">All Event Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="PRODUCT_CREATED">PRODUCT_CREATED</option>
            <option value="PRODUCT_STATUS_CHANGED">PRODUCT_STATUS_CHANGED</option>
            <option value="ORDER_STATUS_UPDATED">ORDER_STATUS_UPDATED</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-[28px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#685B55]">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider border-b border-[#E5DCDB]">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Event Action</th>
                  <th className="px-6 py-4">Target Entity</th>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Metadata Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCDB]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FCFAF4] transition-colors font-mono text-xs">
                    <td className="px-6 py-4 text-[#685B55]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span className="px-3 py-1 rounded-full text-xs bg-[#FAF6EE] text-[#E88D36] border border-[#E5DCDB]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#2C221E]">
                      {log.target_type ? `${log.target_type} #${log.target_id || ''}` : "System"}
                    </td>
                    <td className="px-6 py-4 text-[#3B6E4C] font-bold">
                      {log.user_id ? `User #${log.user_id}` : "Anonymous"}
                    </td>
                    <td className="px-6 py-4 text-[#685B55]">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-[#685B55]">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#685B55] font-sans font-medium">
                      No audit records found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
