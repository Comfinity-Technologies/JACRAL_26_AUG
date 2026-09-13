import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";
import { ShieldAlert, ShieldCheck, QrCode } from "lucide-react";

export default function AdminMFASetupPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qr_code_svg: string; uri: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Assume user is already verified if mfa_enabled is true, but we don't have this explicitly in User yet unless we add it to the state.
  // Actually, we added `mfa_enabled` to UserOut backend schema, so we can check it if the backend returns it.
  const isMfaEnabled = (user as any)?.mfa_enabled;

  const handleStartSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/api/v1/auth/admin/mfa/setup");
      setSetupData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to start MFA setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await apiClient.post("/api/v1/auth/admin/mfa/verify", { code: verificationCode });
      setSuccess("MFA successfully enabled! Next time you login, you will be prompted for a code.");
      setSetupData(null);
      // Ideally update user state here
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2C221E] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Security Settings
        </h1>
        <p className="text-[#685B55]">Manage your two-factor authentication (2FA) settings.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#E5DCDB] shadow-sm">
        {isMfaEnabled && !success ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[#2C221E] mb-3">MFA is Active</h2>
            <p className="text-[#685B55] max-w-md">
              Your account is protected with Two-Factor Authentication. 
              You will be required to enter a code from your authenticator app when logging in.
            </p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[#2C221E] mb-3">Setup Complete!</h2>
            <p className="text-[#685B55] max-w-md">
              {success}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-8 px-6 py-3 bg-[#3B6E4C] text-white rounded-xl font-bold hover:bg-[#285642]"
            >
              Back to Dashboard
            </button>
          </div>
        ) : !setupData ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="w-20 h-20 bg-[#F2EBDC] rounded-full flex items-center justify-center text-[#E88D36] mb-6">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[#2C221E] mb-3">Protect Your Account</h2>
            <p className="text-[#685B55] max-w-md mb-8">
              Two-factor authentication adds an extra layer of security to your admin account. 
              Once configured, you'll be required to enter both your password and an authentication code from your mobile phone in order to sign in.
            </p>
            
            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl w-full max-w-md">{error}</div>}
            
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="px-8 py-4 bg-[#3B6E4C] text-white rounded-full font-bold hover:bg-[#285642] transition-colors shadow-lg shadow-[#3B6E4C]/20 disabled:opacity-50"
            >
              {loading ? "Initializing..." : "Setup Authenticator App"}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-xl font-bold text-[#2C221E] mb-6 flex items-center gap-2">
                <QrCode className="text-[#E88D36]" /> Step 1: Scan QR Code
              </h2>
              <p className="text-sm text-[#685B55] mb-6">
                Open your authenticator app (like Google Authenticator, Authy, or 1Password) and scan this QR code.
              </p>
              
              <div className="bg-[#FAF6EE] p-6 rounded-2xl flex justify-center border border-[#E5DCDB] mb-6">
                <div dangerouslySetInnerHTML={{ __html: setupData.qr_code_svg }} className="w-48 h-48" />
              </div>
              
              <div className="bg-white border border-[#E5DCDB] rounded-xl p-4 text-center">
                <p className="text-xs text-[#685B55] mb-2 uppercase tracking-wider font-bold">Manual Entry Secret</p>
                <code className="text-lg font-mono text-[#2C221E] bg-[#FAF6EE] px-3 py-1 rounded">{setupData.secret}</code>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-[#2C221E] mb-6 flex items-center gap-2">
                <ShieldCheck className="text-[#3B6E4C]" /> Step 2: Verify Code
              </h2>
              <p className="text-sm text-[#685B55] mb-6">
                Enter the 6-digit code generated by your app to verify the setup and enable MFA.
              </p>
              
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-4 text-[#2C221E] outline-none focus:border-[#3B6E4C] text-2xl font-bold text-center tracking-[0.5em]"
                    placeholder="000000"
                  />
                </div>
                
                {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">{error}</div>}
                
                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                  className="w-full px-6 py-4 bg-[#E88D36] text-white rounded-xl font-bold hover:bg-[#D47E2A] transition-colors shadow-lg shadow-[#E88D36]/20 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
