import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";

export default function AdminExportsPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

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
      const res = await apiClient.get(`/api/v1/admin/exports/${format}/${entity}`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `jacral_${entity}_export.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to download export");
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
        <p className="text-[#685B55]">Download reports for Customers, Products, and Orders.</p>
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
