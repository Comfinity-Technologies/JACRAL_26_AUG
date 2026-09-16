import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag, User, Search, Menu, X, ChevronDown, Leaf, FileText
} from "lucide-react";
import { useCart } from "../../hooks/useCart";

const POLICIES = [
  { to: "/policy/privacy", label: "Privacy Policy" },
  { to: "/policy/terms", label: "Terms of Service" },
  { to: "/policy/shipping", label: "Shipping Policy" },
  { to: "/policy/return", label: "Return & Refund Policy" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const policyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { itemCount } = useCart();

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close policy dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (policyRef.current && !policyRef.current.contains(e.target as Node)) {
        setPolicyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/shop", label: "Shop", end: false },
    { to: "/shop?category=Jackfruit", label: "Jackfruit", end: false },
    { to: "/shop?category=Cereals", label: "Cereals", end: false },
  ];

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="overflow-hidden bg-[#3B6E4C] py-2 text-white">
        <div
          className="marquee-track flex whitespace-nowrap text-xs font-medium tracking-[0.1em]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mr-14">
              🌿&nbsp;Free shipping on orders above ₹999&nbsp;&nbsp;·&nbsp;&nbsp;
              🌾&nbsp;100% Natural Products&nbsp;&nbsp;·&nbsp;&nbsp;
              🌳&nbsp;Premium Jackfruit Delivered&nbsp;&nbsp;·&nbsp;&nbsp;
              ✨&nbsp;New Arrivals Every Week
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header
        className={`sticky top-0 z-50 glass-nav transition-all duration-300 ${scrolled ? "shadow-lg py-0" : "py-1"
          }`}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-6 md:px-10">

          {/* ── LOGO ── */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B6E4C] shadow-sm group-hover:bg-[#2E583C] transition-colors">
              <Leaf size={17} className="text-white" strokeWidth={1.8} />
            </div>
            <span
              className="text-xl tracking-[0.22em] text-[#2C221E] font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              JACRAL
            </span>
            <span className="hidden sm:flex text-[9px] font-semibold text-[#3B6E4C] leading-tight ml-1.5">
              PURE JACKFRUIT<br />GOODNESS · 100% NATURAL
            </span>
          </Link>

          {/* ── NAVIGATION + SEARCH (shared slot so opening search never wraps the row) ── */}
          <div className="relative hidden md:flex flex-1 items-center mx-8 h-10">
            {/* Nav links */}
            <nav
              className={`flex items-center gap-6 transition-opacity duration-200 ${searchOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `text-sm font-semibold transition ${isActive
                      ? "text-[#3B6E4C]"
                      : "text-[#685B55] hover:text-[#2C221E]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Policies */}
              <div className="relative" ref={policyRef}>
                <button
                  type="button"
                  onClick={() => setPolicyOpen((p) => !p)}
                  className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-[#685B55] hover:bg-[#F3EFE5] hover:text-[#2C221E] transition"
                >
                  Policies
                  <ChevronDown
                    size={12}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${policyOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown panel */}
                {policyOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-[#E5DCDB] bg-white shadow-xl shadow-black/8 py-2 z-50 animate-fadeIn">
                    {/* Orange accent top bar */}
                    <div className="mx-3 mb-2 pb-2 border-b border-[#F3EFE5]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#E88D36] px-2 pt-1">
                        Site Policies
                      </p>
                    </div>
                    {POLICIES.map((p) => (
                      <Link
                        key={p.to}
                        to={p.to}
                        onClick={() => setPolicyOpen(false)}
                        className="flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#2C221E] hover:bg-[#E88D36]/8 hover:text-[#E88D36] transition-colors group"
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#FAF6EE] text-[#E88D36] group-hover:bg-[#E88D36] group-hover:text-white transition-colors">
                          <FileText size={13} />
                        </span>
                        {p.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Inline search — absolutely positioned over the same slot as the nav links */}
            <form
              onSubmit={handleSearch}
              className={`absolute inset-y-0 left-0 flex items-center gap-2 px-4 rounded-full bg-[#F9F5EB] border border-[#E5DCDB] transition-all duration-300 overflow-hidden ${searchOpen ? "w-full max-w-md opacity-100" : "w-0 opacity-0 pointer-events-none"
                }`}
            >
              <Search size={16} className="text-[#E88D36] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border-0 bg-transparent text-sm text-[#2C221E] placeholder-[#A8988E] outline-none min-w-0"
                aria-label="Search products"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-[#A8988E] hover:text-[#2C221E] transition flex-shrink-0"
              >
                <X size={14} />
              </button>
            </form>
          </div>

          {/* ── ACTIONS ── */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((p) => !p)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#2C221E] hover:bg-[#E9E1D0] transition"
            >
              {searchOpen ? <X size={18} strokeWidth={1.8} /> : <Search size={18} strokeWidth={1.8} />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`Cart (${itemCount} items)`}
              className="relative flex items-center gap-2 rounded-full border border-[#E5DCDB] bg-white px-4 py-2 text-[0.83rem] font-semibold text-[#2C221E] hover:border-[#E88D36] hover:text-[#E88D36] transition shadow-sm"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E88D36] px-1 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              to="/account"
              aria-label="My Account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#2C221E] hover:bg-[#E9E1D0] transition"
            >
              <User size={18} strokeWidth={1.8} />
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#2C221E] hover:bg-[#E9E1D0] transition md:hidden"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <nav
            className="border-t border-[#E5E0D5] bg-[#FCFAF4]/98 backdrop-blur-sm px-6 pb-6 md:hidden"
            aria-label="Mobile navigation"
          >
            {/* Mobile search */}
            {searchOpen && (
              <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F9F5EB] border border-[#E5DCDB]">
                <Search size={16} className="text-[#E88D36] flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 border-0 bg-transparent text-sm text-[#2C221E] placeholder-[#A8988E] outline-none"
                  aria-label="Search products"
                />
              </form>
            )}

            <ul className="mt-4 space-y-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive
                        ? "bg-[#3B6E4C]/10 text-[#3B6E4C]"
                        : "text-[#685B55] hover:bg-[#F3EFE5] hover:text-[#2C221E]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}

              {/* Policies section in mobile */}
              <li>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#E88D36]">
                  Policies
                </p>
              </li>
              {POLICIES.map((p) => (
                <li key={p.to}>
                  <Link
                    to={p.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[#685B55] hover:bg-[#E88D36]/8 hover:text-[#E88D36] transition"
                  >
                    <FileText size={14} className="text-[#E88D36]" />
                    {p.label}
                  </Link>
                </li>
              ))}

              <li className="pt-2 border-t border-[#E5DCDB] mt-2">
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[#685B55] hover:bg-[#F3EFE5] hover:text-[#2C221E] transition"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={16} /> Cart
                  </span>
                  {itemCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E88D36] px-1 text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#685B55] hover:bg-[#F3EFE5] hover:text-[#2C221E] transition"
                >
                  <User size={16} /> Account
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}