import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, login, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      // Automatically login after registration
      await login({
        email: cleanEmail,
        password,
      });

      navigate("/account", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create account."
      );
    }
  }

  const inputCls =
    "mt-2 w-full rounded-xl border border-[#E5DCDB] bg-white px-4 py-3 text-sm text-[#2C221E] outline-none transition focus:border-[#E88D36] focus:ring-2 focus:ring-[#E88D36]/15 placeholder-[#A8988E]";

  return (
    <div className="min-h-screen bg-[#FAF6EE] px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#3B6E4C]">
            <Leaf size={22} className="text-white" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#E88D36]">
            JOIN JACRAL
          </p>
          <h1
            className="mt-3 text-5xl text-[#2C221E]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create Account
          </h1>
          <p className="mt-3 text-[#685B55]">
            Create your Jacral account to manage orders and checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="natura-card p-8 md:p-10">
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#685B55]">
            Full Name
            <input
              required
              minLength={2}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputCls}
              placeholder="Your name"
            />
          </label>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.08em] text-[#685B55]">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </label>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.08em] text-[#685B55]">
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputCls}
              placeholder="At least 8 characters"
            />
          </label>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.08em] text-[#685B55]">
            Confirm Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputCls}
              placeholder="Repeat your password"
            />
          </label>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="mt-7 w-full flex items-center justify-center gap-2 rounded-full bg-[#3B6E4C] px-6 py-4 font-bold text-white transition hover:bg-[#2E583C] hover:shadow-lg hover:shadow-[#3B6E4C]/25 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating Account…</>
            ) : (
              <><Leaf size={18} /> Create Account</>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-[#685B55]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#3B6E4C] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}