import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone, Globe } from "lucide-react";
import { getSiteSettings } from "../../services/landingPageService";
import type { SiteSettings } from "../../types/landingPage";

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  );
}

function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  );
}

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings>({
    contact_email: "hello@jacral.com",
    contact_phone: "+91 98765 43210",
    contact_address: "Bengaluru, Karnataka, India",
    social_instagram: "https://instagram.com/jacralfoods",
    social_facebook: "https://facebook.com/jacralfoods",
    social_twitter: "https://twitter.com/jacralfoods",
    social_linkedin: "https://linkedin.com/company/jacral",
  });

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Error loading site settings:", err));
  }, []);

  return (
    <footer className="bg-[#2C221E] text-white">
      {/* ── MAIN FOOTER ── */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* 1. About Jacral */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B6E4C]">
                <Leaf size={16} className="text-white" strokeWidth={1.8} />
              </div>
              <span
                className="text-xl tracking-[0.2em] font-black"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                JACRAL
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#FFB800]">
              Solis of Life Pvt. Ltd.
            </p>
            <p className="text-sm text-white/60 leading-relaxed font-normal">
              India's first ready-to-eat breakfast cereal milled from wild-harvested unripe jackfruit bulbs and protein-dense seeds. 20% protein, 25% prebiotic fiber, zero sugar.
            </p>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              {settings.social_instagram && (
                <a
                  href={settings.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-[#285B3C] hover:text-white transition"
                >
                  <InstagramIcon size={15} />
                </a>
              )}
              {settings.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-[#285B3C] hover:text-white transition"
                >
                  <FacebookIcon size={15} />
                </a>
              )}
              {settings.social_twitter && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-[#285B3C] hover:text-white transition"
                >
                  <TwitterIcon size={15} />
                </a>
              )}
              {settings.social_linkedin && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-[#285B3C] hover:text-white transition"
                >
                  <LinkedinIcon size={15} />
                </a>
              )}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#FFB800]">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-white/70 font-medium">
              <li>
                <Link to="/" className="hover:text-[#E88D36] transition">Home</Link>
              </li>
              <li>
                <a href="/#products" className="hover:text-[#E88D36] transition">Our Products</a>
              </li>
              <li>
                <a href="/#how-to-use" className="hover:text-[#E88D36] transition">How To Use</a>
              </li>
              <li>
                <a href="/#reviews" className="hover:text-[#E88D36] transition">Customer Reviews</a>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#E88D36] transition">Shop All Products</Link>
              </li>
            </ul>
          </div>

          {/* 3. Policies */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#FFB800]">
              Policies & Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-white/70 font-medium">
              <li>
                <Link to="/policy/privacy" className="hover:text-[#E88D36] transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/policy/terms" className="hover:text-[#E88D36] transition">Terms of Service</Link>
              </li>
              <li>
                <Link to="/policy/shipping" className="hover:text-[#E88D36] transition">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/policy/return" className="hover:text-[#E88D36] transition">Return & Refund Policy</Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact & Support */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#FFB800]">
              Contact Us
            </h3>
            <ul className="space-y-3.5 text-sm text-white/70 font-medium">
              {settings.contact_address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#E88D36]" />
                  <span>{settings.contact_address}</span>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-3">
                  <Phone size={16} className="flex-shrink-0 text-[#E88D36]" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-white transition">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-3">
                  <Mail size={16} className="flex-shrink-0 text-[#E88D36]" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition">
                    {settings.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* ── BOTTOM COPYRIGHT BAR ── */}
      <div className="border-t border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-white/40 sm:flex-row font-medium">
          <p>© {year} JACRAL · Solis of Life Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/policy/privacy" className="hover:text-white/70 transition">Privacy Policy</Link>
            <Link to="/policy/terms" className="hover:text-white/70 transition">Terms of Service</Link>
            <Link to="/policy/shipping" className="hover:text-white/70 transition">Shipping Policy</Link>
            <Link to="/policy/return" className="hover:text-white/70 transition">Return & Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}