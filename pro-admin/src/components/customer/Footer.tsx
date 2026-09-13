import { Link } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone, Globe, Share2, MessageCircle } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#2C221E] text-white">
      {/* ── MAIN FOOTER ── */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B6E4C]">
                <Leaf size={16} className="text-white" />
              </div>
              <span
                className="text-xl tracking-[0.2em] font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                JACRAL
              </span>
            </div>
            <p
              className="text-[#E88D36] text-lg leading-relaxed mb-4"
              style={{ fontFamily: "var(--font-script)" }}
            >
              From nature, to your table.
            </p>
            <p className="text-sm text-white/60 leading-7">
              JACRAL brings quality jackfruit products and wholesome cereals,
              naturally prepared for everyday living.
            </p>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              {[
                { icon: <Globe size={16} />, href: "#", label: "Website" },
                { icon: <Share2 size={16} />, href: "#", label: "Share" },
                { icon: <MessageCircle size={16} />, href: "#", label: "Community" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-[#E88D36] hover:text-white transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-white/50"
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/shop?category=Jackfruit", label: "Jackfruit Products" },
                { to: "/shop?category=Cereals", label: "Cereals" },
                { to: "/account", label: "My Account" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-[#E88D36] transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3
              className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-white/50"
            >
              Customer Service
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/account/orders", label: "Track Order" },
                { to: "/cart", label: "Shopping Cart" },
                { to: "/checkout", label: "Checkout" },
                { to: "/account", label: "Login / Register" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-[#E88D36] transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-white/50"
            >
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-[#E88D36]" />
                Kerala, India
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone size={15} className="flex-shrink-0 text-[#E88D36]" />
                +91 00000 00000
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail size={15} className="flex-shrink-0 text-[#E88D36]" />
                hello@jacral.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-white/40 sm:flex-row">
          <p>© {year} JACRAL. All rights reserved.</p>
          <p>
            Built with ♥ for natural food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}