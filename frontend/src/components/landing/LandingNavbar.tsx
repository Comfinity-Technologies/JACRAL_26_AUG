import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Leaf,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { getImageUrl } from "../../utils/image";
import type { BrandInfo } from "../../types/landingPage";

interface LandingNavbarProps {
  brand?: BrandInfo | null;
}

export default function LandingNavbar({
  brand,
}: LandingNavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  /*
   * ---------------------------------------------------------
   * SCROLL DETECTION
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * CLOSE ACCOUNT MENU WHEN CLICKING OUTSIDE
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */
  const handleLogout = () => {
    setAccountMenuOpen(false);
    setMobileOpen(false);
    logout();
  };

  /*
   * ---------------------------------------------------------
   * BRAND
   * ---------------------------------------------------------
   */
  const brandName =
    brand?.brand_name || "JACRAL";

  // Only use admin-uploaded logo; no hardcoded fallback image
  const logoUrl = brand?.logo_url || null;

  const tagline =
    brand?.tagline ||
    "NATURE'S GOODNESS IN EVERY BITE";

  /*
   * ---------------------------------------------------------
   * ADMIN ROLES
   * ---------------------------------------------------------
   */
  const isAdminUser =
    user?.role &&
    [
      "ADMIN",
      "SUPER_ADMIN",
      "PRO_ADMIN",
      "EMPLOYEE",
    ].includes(user.role);

  return (
    <header
      className={`sticky top-0 z-25 w-full bg-white transition-all duration-300 ${scrolled
        ? "shadow-md"
        : "border-b border-[#E5DCDB]/70"
        }`}
    >
      {/* =====================================================
          MAIN NAVBAR
          ===================================================== */}
      <div className="max-w-[14400px] mx-auto px-5 sm:px-5 lg:px-12">
        <div
          className={`flex items-center justify-between gap-6 transition-all duration-300 ${scrolled
            ? "min-h-[50px]"
            : "min-h-[50px]"
            }`}
        >

          {/* =================================================
              LEFT SIDE
              LOGO + TAGLINE
              ================================================= */}
          <Link
            to="/"
            aria-label="JACRAL Home"
            onClick={() => {
              setMobileOpen(false);
              setAccountMenuOpen(false);
            }}
            className="flex items-center gap-4 flex-shrink-0 group"
          >
            {logoUrl ? (
              <img
                src={getImageUrl(logoUrl)}
                alt={brandName}
                className={`w-auto object-contain transition-all duration-300 ${scrolled
                  ? "h-9 sm:h-10"
                  : "h-5 sm:h-12"
                  } max-w-[200px]`}
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#3B6E4C] flex items-center justify-center text-white">
                  <Leaf
                    size={18}
                    strokeWidth={2}
                  />
                </div>

                <span className="text-2xl font-black tracking-[0.12em] text-[#2C221E]">
                  {brandName}
                </span>
              </div>
            )}

            {/* Vertical separator */}
            <div className="hidden sm:block h-9 w-px bg-[#DCD5D0]" />

            {/* Tagline */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3B6E4C] max-w-[190px]">
                {tagline}
              </span>
            </div>
          </Link>

          {/* =================================================
              RIGHT SIDE
              HOME / SHOP / LOGIN / CART
              ================================================= */}
          <div className="flex items-center flex-1 justify-end gap-2">

            {/* -----------------------------------------------
                DESKTOP NAVIGATION
                ----------------------------------------------- */}
            <nav className="hidden md:flex items-center gap-8 mr-4">

              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `relative py-2 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors ${isActive
                    ? "text-[#3B6E4C]"
                    : "text-[#2C221E] hover:text-[#3B6E4C]"
                  }`
                }
              >
                HOME
              </NavLink>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `relative py-2 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors ${isActive
                    ? "text-[#3B6E4C]"
                    : "text-[#2C221E] hover:text-[#3B6E4C]"
                  }`
                }
              >
                SHOP
              </NavLink>

            </nav>

            {/* -----------------------------------------------
                LOGIN / ACCOUNT
                ----------------------------------------------- */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 ml-3 px-5 py-2.5 rounded-full border border-[#D8D2CE] text-[#2C221E] hover:bg-[#2C221E] hover:text-white transition-all text-[12px] font-bold uppercase tracking-[0.08em]"
              >
                <UserIcon size={15} />
                <span className="hidden sm:inline">LOGIN / REGISTER</span>
              </Link>
            ) : (
              <div
                className="relative ml-3 hidden sm:block"
                ref={accountMenuRef}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(
                      (previous) => !previous
                    );
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#3B6E4C]/10 border border-[#3B6E4C]/20 text-[#3B6E4C] text-[12px] font-bold uppercase tracking-[0.08em]"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <UserIcon size={15} />

                  <span>ACCOUNT</span>

                  <ChevronDown
                    size={13}
                    className={`transition-transform ${accountMenuOpen
                      ? "rotate-180"
                      : ""
                      }`}
                  />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-2xl border border-[#E5DCDB] shadow-2xl py-2 overflow-hidden">

                    <div className="px-4 py-3 border-b border-[#FAF6EE]">
                      <p className="font-bold text-sm text-[#2C221E] truncate">
                        {user?.name ||
                          user?.email}
                      </p>

                      {user?.role && (
                        <p className="mt-1 text-[9px] text-[#685B55] uppercase tracking-wider">
                          {user.role}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/account"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                      className="block px-4 py-2.5 text-xs font-semibold text-[#2C221E] hover:bg-[#FAF6EE] hover:text-[#E88D36]"
                    >
                      My Account
                    </Link>

                    <Link
                      to="/cart"
                      onClick={() =>
                        setAccountMenuOpen(false)
                      }
                      className="block px-4 py-2.5 text-xs font-semibold text-[#2C221E] hover:bg-[#FAF6EE] hover:text-[#E88D36]"
                    >
                      My Cart
                      {itemCount > 0
                        ? ` (${itemCount})`
                        : ""}
                    </Link>

                    {isAdminUser && (
                      <Link
                        to="/admin"
                        onClick={() =>
                          setAccountMenuOpen(false)
                        }
                        className="block px-4 py-2.5 text-xs font-bold text-[#3B6E4C] hover:bg-[#FAF6EE]"
                      >
                        Admin CMS Panel
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* -----------------------------------------------
                CART
                ----------------------------------------------- */}
            <Link
              to="/cart"
              aria-label={`Cart with ${itemCount} items`}
              className="relative ml-2 sm:ml-3 p-2.5 rounded-full text-[#2C221E] hover:text-[#E88D36] hover:bg-[#FAF6EE] transition-colors"
            >
              <ShoppingBag
                size={22}
                strokeWidth={2}
              />

              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 flex items-center justify-center rounded-full bg-[#E88D36] text-white text-[9px] font-black">
                  {itemCount > 99
                    ? "99+"
                    : itemCount}
                </span>
              )}
            </Link>

            {/* -----------------------------------------------
                MOBILE MENU BUTTON
                ----------------------------------------------- */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(
                  (previous) => !previous
                );
                setAccountMenuOpen(false);
              }}
              className="md:hidden ml-2 p-2.5 rounded-full text-[#2C221E] hover:bg-[#FAF6EE]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>
      </div>


      {/* =====================================================
          MOBILE MENU
          ===================================================== */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5DCDB] bg-white shadow-xl">
          <div className="px-6 py-6 space-y-5">

            <NavLink
              to="/"
              end
              onClick={() =>
                setMobileOpen(false)
              }
              className={({ isActive }) =>
                `block text-sm font-bold uppercase tracking-[0.12em] ${isActive
                  ? "text-[#E88D36]"
                  : "text-[#2C221E]"
                }`
              }
            >
              HOME
            </NavLink>

            <NavLink
              to="/shop"
              onClick={() =>
                setMobileOpen(false)
              }
              className={({ isActive }) =>
                `block text-sm font-bold uppercase tracking-[0.12em] ${isActive
                  ? "text-[#E88D36]"
                  : "text-[#2C221E]"
                }`
              }
            >
              SHOP
            </NavLink>

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="block w-full text-center py-3 rounded-xl bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider"
              >
                LOGIN / REGISTER
              </Link>
            ) : (
              <>
                <Link
                  to="/account"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="block w-full text-center py-3 rounded-xl bg-[#3B6E4C] text-white text-xs font-bold uppercase tracking-wider"
                >
                  MY ACCOUNT
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-xs font-semibold text-red-600"
                >
                  LOGOUT
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}