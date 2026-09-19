import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";

export default function AdminExportsPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<"all" | "today" | "this_week" | "this_month" | "custom">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  if (user?.role === "EMPLOYEE") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>Employees are not permitted to access database exports.</p>
      </div>
    );
  }

  const handleExport = async (entity: string, format: "pdf" | "excel") => {
    setDownloading(`${entity}-${format}`);
    try {
      const params = new URLSearchParams();
      if (selectedRange !== "all") {
        params.append("range", selectedRange);
        if (selectedRange === "custom") {
          if (!startDate || !endDate) {
            alert("Please select both start date and end date for custom range.");
            setDownloading(null);
            return;
          }
          params.append("start_date", startDate);
          params.append("end_date", endDate);
        }
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get(`/api/v1/admin/exports/${format}/${entity}${queryString}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `jacral_${entity}_export_${selectedRange}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to download export");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Download size={24} />
          </div>
          Data Exports
        </h1>
        <p className="text-[#685B55]">Download reports for Customers, Products, and Orders with date range filtering.</p>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E5DCDB] space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C221E]">Select Date Range Filter</h2>
        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: "All Time", value: "all" },
            { label: "Today", value: "today" },
            { label: "This Week", value: "this_week" },
            { label: "This Month", value: "this_month" },
            { label: "Custom Range", value: "custom" },
          ].map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelectedRange(r.value as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                selectedRange === r.value
                  ? "bg-[#3B6E4C] text-white shadow-md"
                  : "bg-[#FAF6EE] text-[#685B55] hover:bg-[#E5DCDB]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {selectedRange === "custom" && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#E5DCDB]">
            <div>
              <label className="block text-xs font-bold text-[#685B55] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-2 border-[#E5DCDB] rounded-xl px-4 py-2 text-sm font-semibold text-[#2C221E] focus:outline-none focus:border-[#3B6E4C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#685B55] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-2 border-[#E5DCDB] rounded-xl px-4 py-2 text-sm font-semibold text-[#2C221E] focus:outline-none focus:border-[#3B6E4C]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {["customers", "products", "orders"].map((entity) => (
          <div key={entity} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E5DCDB]">
            <h2 className="text-xl font-bold capitalize mb-4">{entity}</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleExport(entity, "pdf")}
                disabled={downloading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
              >
                <FileText size={18} />
                {downloading === `${entity}-pdf` ? "Downloading..." : "Export as PDF"}
              </button>
              <button
                onClick={() => handleExport(entity, "excel")}
                disabled={downloading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-600 font-bold hover:bg-green-100 transition-colors"
              >
                <Table size={18} />
                {downloading === `${entity}-excel` ? "Downloading..." : "Export as Excel"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
