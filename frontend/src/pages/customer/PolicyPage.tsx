import { useParams, Link } from "react-router-dom";
import { usePolicies } from "../../hooks/usePolicies";
import { ArrowLeft, Clock } from "lucide-react";

const POLICY_SLUGS = [
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
  { slug: "shipping", label: "Shipping Policy" },
  { slug: "return", label: "Return & Refund Policy" },
];

export default function PolicyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { policies, loading } = usePolicies();

  const policy = slug ? policies[slug] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#E88D36] border-t-transparent animate-spin" />
          <p className="text-[#685B55]" style={{ fontFamily: "var(--font-body)" }}>
            Loading policy…
          </p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center gap-6 p-8">
        <h1
          className="text-3xl font-bold text-[#2C221E]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Policy not found
        </h1>
        <Link
          to="/"
          className="flex items-center gap-2 text-[#E88D36] hover:text-[#D47E2A] font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* ── Hero Banner ── */}
      <div className="bg-[#2C221E] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-[#E88D36] text-sm transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Home
          </Link>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {policy.title}
          </h1>
          {policy.updated_at && (
            <p className="flex items-center gap-2 text-white/50 text-sm">
              <Clock size={14} />
              Last updated: {new Date(policy.updated_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar – other policies */}
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5DCDB] p-6 sticky top-6">
            <h3
              className="text-xs font-bold uppercase tracking-widest text-[#685B55] mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Site Policies
            </h3>
            <ul className="space-y-1">
              {POLICY_SLUGS.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/policy/${p.slug}`}
                    className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      slug === p.slug
                        ? "bg-[#E88D36] text-white"
                        : "text-[#2C221E] hover:bg-[#E88D36]/10 hover:text-[#E88D36]"
                    }`}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main policy content */}
        <article className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5DCDB] p-8 md:p-12">
            <div
              className="policy-content"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
