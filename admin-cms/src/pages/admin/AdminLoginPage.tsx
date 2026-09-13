import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Shield, Leaf, KeyRound } from "lucide-react";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "PRO_ADMIN", "EMPLOYEE"];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, completeMfa, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  
  // MFA Challenge State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");

  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const response = await login({ email: email.trim().toLowerCase(), password });
      
      if (response.mfa_required && response.mfa_token) {
        setMfaRequired(true);
        setMfaToken(response.mfa_token);
        return;
      }

      const user = response.user;
      if (!user) throw new Error("Login failed");

      if (ADMIN_ROLES.includes(user.role)) {
        navigate("/admin", { replace: true });
      } else {
        setError("You do not have permission to access the admin panel.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    }
  }

  async function handleMfaSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!mfaCode.trim() || mfaCode.length < 6) {
      setError("Please enter a valid 6-digit MFA code.");
      return;
    }

    try {
      const user = await completeMfa(mfaToken, mfaCode);
      if (ADMIN_ROLES.includes(user.role)) {
        navigate("/admin", { replace: true });
      } else {
        setError("You do not have permission to access the admin panel.");
      }
    } catch (err: unknown) {
      setError("Invalid MFA code. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#2C221E] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#E88D36]/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-[#3B6E4C]/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <div className="bg-[#FAF6EE] rounded-[32px] shadow-2xl overflow-hidden border border-white/10">
          {/* Header stripe */}
          <div className="bg-[#17382B] px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
              {mfaRequired ? (
                <KeyRound className="w-8 h-8 text-[#FFB800]" />
              ) : (
                <Shield className="w-8 h-8 text-[#FFB800]" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf size={16} className="text-[#3B6E4C]" />
              <span className="text-xs tracking-[0.3em] text-white/80 uppercase font-bold">JACRAL</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              {mfaRequired ? "Two-Factor Auth" : "Admin Access"}
            </h1>
            <p className="text-sm text-white/70">
              {mfaRequired ? "Enter the code from your authenticator app" : "Sign in to the management panel"}
            </p>
          </div>

          {/* Form Area */}
          <div className="px-8 py-10">
            {!mfaRequired ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#2C221E] mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3.5 text-[#2C221E] bg-white outline-none focus:border-[#3B6E4C] transition placeholder-[#A8988E] text-base font-medium"
                    placeholder="admin@jacral.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2C221E] mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3.5 text-[#2C221E] bg-white outline-none focus:border-[#3B6E4C] transition placeholder-[#A8988E] text-base font-medium"
                    placeholder="••••••••"
                  />
                </div>

                {/* Quick Fill Credentials for Demo */}
                <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E5DCDB] space-y-1.5 text-xs text-[#685B55]">
                  <p className="font-bold text-[#2C221E] uppercase tracking-wider text-[0.7rem]">Quick Demo Login:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setEmail("admin@jacral.com"); setPassword("AdminPassword123!"); }}
                      className="px-2.5 py-1 bg-[#3B6E4C] text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail("superadmin@jacral.com"); setPassword("SuperAdminPassword123!"); }}
                      className="px-2.5 py-1 bg-[#E88D36] text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Super Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail("proadmin@jacral.com"); setPassword("ProAdminPassword123!"); }}
                      className="px-2.5 py-1 bg-[#2C221E] text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Pro Admin
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E88D36] text-[#2C221E] py-4 rounded-xl font-bold hover:bg-[#D47E2A] hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base tracking-wide shadow-lg shadow-[#E88D36]/20 hover:-translate-y-1 mt-2"
                >
                  {loading ? "Authenticating..." : "Sign In to Dashboard"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#2C221E] mb-2 uppercase tracking-wider text-center">
                    Authenticator Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-4 text-[#2C221E] bg-white outline-none focus:border-[#3B6E4C] transition placeholder-[#A8988E] text-2xl font-bold text-center tracking-[0.5em]"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3B6E4C] text-white py-4 rounded-xl font-bold hover:bg-[#285642] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base tracking-wide shadow-lg shadow-[#3B6E4C]/20 hover:-translate-y-1 mt-2"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setMfaRequired(false);
                    setMfaCode("");
                    setMfaToken("");
                    setError("");
                  }}
                  className="w-full text-[#685B55] text-sm font-semibold hover:text-[#2C221E] transition-colors py-2"
                >
                  Cancel & Go Back
                </button>
              </form>
            )}
          </div>

          <div className="bg-[#F3EFE5] px-8 py-5 text-center border-t border-[#E5DCDB]">
            <p className="text-xs text-[#685B55] font-medium">
              Secured by Jacral Auth Infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
