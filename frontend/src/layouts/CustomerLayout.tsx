import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import LandingNavbar from "../components/landing/LandingNavbar";
import Footer from "../components/customer/Footer";
import { getBrand } from "../services/brandService";
import type { BrandInfo } from "../types/landingPage";

export default function CustomerLayout() {
  const [brand, setBrand] = useState<BrandInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    getBrand()
      .then((data) => {
        if (isMounted) setBrand(data);
      })
      .catch((err) => {
        console.error("Failed to load brand identity:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E] font-sans">
      <LandingNavbar brand={brand} />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}