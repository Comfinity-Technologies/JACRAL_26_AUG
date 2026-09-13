import { Link } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-6 py-20">
      <div className="natura-card p-14 text-center max-w-md w-full">
        <div className="text-7xl mb-6 opacity-60">🌿</div>
        <span className="section-eyebrow text-[#E88D36]">404 — Not Found</span>
        <h1
          className="mt-3 text-5xl text-[#2C221E] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Lost in the Forest?
        </h1>
        <p className="text-[#685B55] mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary rounded-full px-8 py-3.5 inline-flex">
            <Home size={16} /> Back Home
          </Link>
          <Link to="/shop" className="btn-outline rounded-full px-8 py-3.5 inline-flex">
            Shop Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}