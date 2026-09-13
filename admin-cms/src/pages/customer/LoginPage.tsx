import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Leaf } from "lucide-react";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "PRO_ADMIN", "EMPLOYEE"];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      
      // Customers shouldn't get MFA challenges, but just in case
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
    <div className="min-h-screen bg-[#FAF6EE] px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#3B6E4C]">
            <Leaf size={22} className="text-white" />
          </div>
          <p
            className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E88D36]"
          >
            WELCOME BACK
          </p>
          <h1
            className="mt-3 text-5xl text-[#2C221E]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign In
          </h1>
          <p className="mt-3 text-[#685B55]">
            Access your account, orders and checkout.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="botanica-card p-8 md:p-10"
        >
          <label className="block text-sm font-semibold text-[#2C221E]">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E5DCDB] px-4 py-3 text-[#2C221E] outline-none focus:border-[#E88D36] focus:ring-2 focus:ring-[#E88D36]/15 transition text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label className="mt-5 block text-sm font-semibold text-[#2C221E]">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E5DCDB] px-4 py-3 text-[#2C221E] outline-none focus:border-[#E88D36] focus:ring-2 focus:ring-[#E88D36]/15 transition text-sm"
              placeholder="Your password"
            />
          </label>

          {error && (
            <div role="alert" className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="mt-7 w-full rounded-full bg-[#3B6E4C] px-6 py-4 font-semibold text-white transition hover:bg-[#2E583C] disabled:cursor-not-allowed disabled:opacity-60 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="mt-6 text-center text-sm text-[#685B55]">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[#3B6E4C] hover:underline">
              Create one
            </Link>
          </p>

          <p className="mt-3 text-center text-xs text-[#A8988E]">
            Admin?{" "}
            <Link to="/admin/login" className="text-[#E88D36] font-medium hover:underline">
              Go to Admin Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}