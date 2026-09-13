import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X, ChevronDown, Leaf } from "lucide-react";
import { apiClient } from "../../api/client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cart count
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    apiClient.get("/api/v1/cart").then((r) => {
      const items: any[] = r.data?.items ?? [];
      setCartCount(items.reduce((s: number, i: any) => s + i.quantity, 0));
    }).catch(() => {});
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
  ];

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="overflow-hidden bg-[#3B6E4C] py-2.5 text-white">
        <div className="marquee-track flex whitespace-nowrap text-xs font-medium tracking-[0.12em]">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mr-16">
              🌿 Free shipping on orders above ₹999 &nbsp;·&nbsp; 🌾 100% Natural Products &nbsp;·&nbsp; 🌳 Fresh Jackfruit Delivered &nbsp;·&nbsp; ✨ New Arrivals Weekly
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header
        className={`sticky top-0 z-50 glass-nav transition-all duration-300 ${
          scrolled ? "shadow-md py-1" : "py-3"
        }`}
      >
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-6 px-6 md:px-10">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B6E4C]">
              <Leaf size={17} className="text-white" strokeWidth={1.8} />
            </div>
            <span
              className="text-xl tracking-[0.22em] text-[#2C221E] font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              JACRAL
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `text-[0.85rem] font-semibold tracking-wide transition-colors ${
                    isActive ? "text-[#E88D36]" : "text-[#685B55] hover:text-[#3B6E4C]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Categories dropdown stub */}
            <button
              type="button"
              className="flex items-center gap-1 text-[0.85rem] font-semibold tracking-wide text-[#685B55] hover:text-[#3B6E4C] transition-colors"
            >
              Categories <ChevronDown size={13} />
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((p) => !p)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#2C221E] hover:bg-[#F2EBDC] transition"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`Cart (${cartCount})`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#2C221E] hover:bg-[#F2EBDC] transition"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB800] text-[9px] font-bold text-[#2C221E]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              to="/account"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17382B] hover:bg-[#E9E1D0] transition"
            >
              <User size={18} strokeWidth={1.8} />
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#17382B] hover:bg-[#E9E1D0] transition md:hidden"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        {searchOpen && (
          <div className="border-t border-[#E5E0D5] bg-white px-6 py-4">
            <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center gap-3">
              <Search size={18} className="flex-shrink-0 text-[#C98B4A]" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jackfruit products, cereals..."
                className="flex-1 border-0 bg-transparent text-base text-[#17382B] placeholder-[#718078] outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[#17382B] px-5 py-2 text-sm font-semibold text-white"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-[#718078] hover:text-[#17382B] transition"
              >
                <X size={17} />
              </button>
            </form>
          </div>
        )}

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <nav className="border-t border-[#E5E0D5] bg-[#FCFAF4] px-6 pb-6 md:hidden">
            <ul className="mt-4 space-y-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#E9E1D0] text-[#17382B]"
                          : "text-[#52645D] hover:bg-[#F3EFE5]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#52645D] hover:bg-[#F3EFE5] transition"
                >
                  <ShoppingBag size={16} /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#52645D] hover:bg-[#F3EFE5] transition"
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