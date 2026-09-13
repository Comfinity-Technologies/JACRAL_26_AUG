import { Outlet } from "react-router-dom";
import Navbar from "../components/customer/Navbar";
import Footer from "../components/customer/Footer";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E]">
      <Navbar />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}