import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Leaf, Eye, EyeOff, ArrowRight, Shield, Truck } from "lucide-react";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "PRO_ADMIN", "EMPLOYEE"];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      if (ADMIN_ROLES.includes(user.role)) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/account", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError("Please enter your email."); return; }
    if (!password) { setError("Please enter your password."); return; }

    try {
      const response = await login({ email: cleanEmail, password });

      if (response.mfa_required) {
        setError("MFA required. Please use the Admin login page.");
        return;
      }

      const loggedInUser = response.user;
      if (!loggedInUser) throw new Error("Login failed");

      const from = (location.state as { from?: string } | null)?.from;

      if (ADMIN_ROLES.includes(loggedInUser.role)) {
        navigate(from || "/admin", { replace: true });
      } else {
        navigate(from || "/account", { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Check your credentials.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes leafFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .anim-fade-up { animation: fadeSlideUp 0.6s ease both; }
        .leaf-float { animation: leafFloat 4s ease-in-out infinite; }
      `}</style>

      {/* Left Panel – Decorative (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3B27] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#E88D36] blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-[#3B6E4C] blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Leaf size={18} className="text-[#7BC89A] leaf-float" />
            </div>
            <span className="text-white font-black text-xl tracking-wider">JACRAL</span>
          </div>

          <h2 className="text-white text-4xl xl:text-5xl font-black leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Welcome Back to<br />Natural Living
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Sign in to manage your orders, explore wholesome jackfruit products, and fuel every morning the right way.
          </p>
        </div>

        {/* Benefits */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: <Truck size={16} />, text: "Free delivery on orders above ₹499" },
            { icon: <Shield size={16} />, text: "Secure & encrypted transactions" },
            { icon: <Leaf size={16} />, text: "100% natural, zero sugar products" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-white/70 text-sm">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#7BC89A]">
                {item.icon}
              </div>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:py-0">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-full bg-[#3B6E4C] flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="text-[#2C221E] font-black text-lg tracking-wider">JACRAL</span>
          </div>

          <div className="anim-fade-up">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E88D36] mb-2">Welcome Back</p>
            <h1 className="text-4xl sm:text-5xl text-[#2C221E] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Sign In
            </h1>
            <p className="text-[#685B55] text-sm mb-8">
              Access your account, orders, and checkout.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="anim-fade-up space-y-5" style={{ animationDelay: "0.1s" }}>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#2C221E] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#E5DCDB] bg-white px-4 py-3.5 text-[#2C221E] outline-none focus:border-[#3B6E4C] focus:ring-2 focus:ring-[#3B6E4C]/15 transition text-sm placeholder-[#A8988E]"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2C221E] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#E5DCDB] bg-white px-4 py-3.5 pr-12 text-[#2C221E] outline-none focus:border-[#3B6E4C] focus:ring-2 focus:ring-[#3B6E4C]/15 transition text-sm placeholder-[#A8988E]"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8988E] hover:text-[#685B55] transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <span className="text-red-500">⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-full bg-[#3B6E4C] px-6 py-4 font-bold text-white transition hover:bg-[#2E583C] hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>

            <p className="text-center text-sm text-[#685B55] pt-2">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-[#3B6E4C] hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}