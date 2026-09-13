import { useState } from "react";
import { Building2, Plus, Search, Filter, Mail, Phone, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  type: "Enterprise" | "Distributor" | "Retailer" | "B2B Bulk";
  contactPerson: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: string;
  status: "Active" | "Pending" | "Suspended";
  tier: "Platinum" | "Gold" | "Silver";
}

const INITIAL_CLIENTS: Client[] = [
  {
    id: "CLI-9021",
    name: "Natura Supermarkets India",
    type: "Distributor",
    contactPerson: "Rajesh Kumar",
    email: "procurement@naturasuper.in",
    phone: "+91 98765 43210",
    ordersCount: 42,
    totalSpent: "₹18,45,000",
    status: "Active",
    tier: "Platinum",
  },
  {
    id: "CLI-9022",
    name: "Organic Roots Co.",
    type: "Enterprise",
    contactPerson: "Ananya Sharma",
    email: "contact@organicroots.com",
    phone: "+91 98123 45678",
    ordersCount: 28,
    totalSpent: "₹9,20,500",
    status: "Active",
    tier: "Gold",
  },
  {
    id: "CLI-9023",
    name: "Green Basket Organics",
    type: "Retailer",
    contactPerson: "Venkatesh Rao",
    email: "supply@greenbasket.io",
    phone: "+91 97890 12345",
    ordersCount: 15,
    totalSpent: "₹4,12,000",
    status: "Active",
    tier: "Silver",
  },
  {
    id: "CLI-9024",
    name: "Pure Harvest Exports",
    type: "B2B Bulk",
    contactPerson: "David Miller",
    email: "david@pureharvestexports.com",
    phone: "+1 415 555 0192",
    ordersCount: 8,
    totalSpent: "₹24,80,000",
    status: "Active",
    tier: "Platinum",
  },
  {
    id: "CLI-9025",
    name: "Bio Life Retailers",
    type: "Retailer",
    contactPerson: "Meera Nair",
    email: "orders@bioliferetail.in",
    phone: "+91 96543 21098",
    ordersCount: 3,
    totalSpent: "₹95,000",
    status: "Pending",
    tier: "Silver",
  },
];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newClient, setNewClient] = useState({
    name: "",
    type: "Enterprise" as Client["type"],
    contactPerson: "",
    email: "",
    phone: "",
    tier: "Gold" as Client["tier"],
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Client = {
      id: `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newClient.name,
      type: newClient.type,
      contactPerson: newClient.contactPerson,
      email: newClient.email,
      phone: newClient.phone,
      ordersCount: 1,
      totalSpent: "₹0",
      status: "Active",
      tier: newClient.tier,
    };
    setClients([created, ...clients]);
    setShowAddModal(false);
    setNewClient({ name: "", type: "Enterprise", contactPerson: "", email: "", phone: "", tier: "Gold" });
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] flex items-center gap-3" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="bg-[#3B6E4C]/10 p-2.5 rounded-2xl text-[#3B6E4C]">
              <Building2 size={26} />
            </div>
            B2B Client Directory
          </h1>
          <p className="text-[#685B55] mt-1">Manage enterprise buyers, wholesale accounts, and B2B distributions.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#E88D36] text-[#2C221E] px-6 py-3.5 rounded-full font-bold hover:bg-[#D47E2A] hover:text-white transition-all shadow-lg shadow-[#E88D36]/20"
        >
          <Plus size={18} />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E5DCDB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#685B55]">Active Accounts</p>
            <p className="text-3xl font-bold text-[#2C221E] mt-1">{clients.filter((c) => c.status === "Active").length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#3B6E4C]/10 flex items-center justify-center text-[#3B6E4C]">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5DCDB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#685B55]">Total B2B Revenue</p>
            <p className="text-3xl font-bold text-[#3B6E4C] mt-1">₹56,52,500</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#E88D36]/10 flex items-center justify-center text-[#E88D36]">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5DCDB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#685B55]">Platinum Partners</p>
            <p className="text-3xl font-bold text-[#2C221E] mt-1">{clients.filter((c) => c.tier === "Platinum").length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#FFB800]/15 flex items-center justify-center text-[#B58300]">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5DCDB] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 text-[#A8988E]" size={18} />
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-[#E5DCDB] rounded-2xl outline-none focus:border-[#3B6E4C] text-sm text-[#2C221E]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={18} className="text-[#685B55]" />
          <span className="text-sm font-bold text-[#2C221E]">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border-2 border-[#E5DCDB] rounded-2xl px-4 py-2.5 text-sm font-semibold bg-white text-[#2C221E] outline-none focus:border-[#3B6E4C]"
          >
            <option value="All">All Client Types</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Distributor">Distributor</option>
            <option value="Retailer">Retailer</option>
            <option value="B2B Bulk">B2B Bulk</option>
          </select>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-[28px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider border-b border-[#E5DCDB]">
              <tr>
                <th className="px-6 py-4">Client Organization</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Category / Tier</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-[#2C221E] text-base">{c.name}</div>
                    <div className="text-xs text-[#685B55] font-mono mt-0.5">{c.id}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-semibold text-sm text-[#2C221E]">{c.contactPerson}</div>
                    <div className="flex items-center gap-3 text-xs text-[#685B55] mt-1">
                      <span className="flex items-center gap-1"><Mail size={12} /> {c.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF6EE] text-[#2C221E] border border-[#E5DCDB]">{c.type}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-extrabold uppercase ${
                        c.tier === "Platinum" ? "bg-purple-100 text-purple-800" : c.tier === "Gold" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                      }`}>{c.tier}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#2C221E]">{c.ordersCount} orders</td>
                  <td className="px-6 py-5 font-bold text-[#3B6E4C] text-base">{c.totalSpent}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === "Active" ? "bg-emerald-100 text-emerald-800" : c.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-[#685B55] hover:text-[#3B6E4C] hover:bg-[#FAF6EE] rounded-xl transition">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] rounded-[32px] max-w-lg w-full p-8 border border-white/20 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>Register B2B Client</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">Company Name</label>
                <input required type="text" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full border-2 border-[#E5DCDB] rounded-xl p-3 bg-white text-[#2C221E] outline-none focus:border-[#3B6E4C]" placeholder="e.g. Organic Foods Pvt Ltd" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">Client Type</label>
                  <select value={newClient.type} onChange={(e) => setNewClient({ ...newClient, type: e.target.value as Client["type"] })} className="w-full border-2 border-[#E5DCDB] rounded-xl p-3 bg-white text-[#2C221E]">
                    <option value="Enterprise">Enterprise</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retailer">Retailer</option>
                    <option value="B2B Bulk">B2B Bulk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">Partner Tier</label>
                  <select value={newClient.tier} onChange={(e) => setNewClient({ ...newClient, tier: e.target.value as Client["tier"] })} className="w-full border-2 border-[#E5DCDB] rounded-xl p-3 bg-white text-[#2C221E]">
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">Contact Person</label>
                <input required type="text" value={newClient.contactPerson} onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })} className="w-full border-2 border-[#E5DCDB] rounded-xl p-3 bg-white text-[#2C221E]" placeholder="Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">Email</label>
                  <input required type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="w-full border-2 border-[#E5DCDB] rounded-xl p-3 bg-white text-[#2C221E]" placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">Phone</label>
                  <input required type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="w-full border-2 border-[#E5DCDB] rounded-xl p-3 bg-white text-[#2C221E]" placeholder="+91..." />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DCDB]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold text-[#685B55]">Cancel</button>
                <button type="submit" className="bg-[#3B6E4C] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#285642]">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
