import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, adminChangePassword } from "../services/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();

  // --- UI Modes ---
  const [viewMode, setViewMode] = useState("LOGIN"); // LOGIN or CHANGE_PW
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [authError, setAuthError] = useState("");

  // --- Form States ---
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_rem_id");
    if (savedEmail) {
      setLoginForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // --- Handlers ---
  const handleInputChange = (e, mode) => {
    const { name, value } = e.target;
    if (mode === "LOGIN") setLoginForm((prev) => ({ ...prev, [name]: value }));
    else setPwForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setAuthError("");
  };

  const toggleMode = () => {
    setViewMode((prev) => (prev === "LOGIN" ? "CHANGE_PW" : "LOGIN"));
    setErrors({});
    setAuthError("");
    setSuccessMsg("");
  };

  // --- Logic: Login ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await adminLogin({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });
      if (rememberMe) localStorage.setItem("admin_rem_id", loginForm.email);
      navigate("/products");
    } catch (error) {
      setAuthError(error.response?.data?.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logic: Change Password ---
  const handleChangePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      await adminChangePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });

      setTimeout(() => {
        // Reload karne se poori app ka state aur memory clean ho jati hai
        window.location.href = "/login";
      }, 2500);
      
      setSuccessMsg("Security updated. System requires re-authentication.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setViewMode("LOGIN"), 2000);
    } catch (error) {
      setAuthError(
        error.response?.data?.message || "Failed to update password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex flex-col items-center justify-center p-6 antialiased text-[#1A1A1A]">
      <button
        onClick={() => navigate("/")}
        className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-all"
      >
        <ArrowLeft size={14} /> Back to Store
      </button>

      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-10">
            <header className="text-center mb-8">
              <h1 className="text-xl font-black tracking-[0.2em] uppercase mb-2">
                {viewMode === "LOGIN" ? "Admin Access" : "Security Update"}
              </h1>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-tight">
                {viewMode === "LOGIN"
                  ? "Identity Verification"
                  : "Reset Credentials"}
              </p>
            </header>

            {/* Success/Error Alerts */}
            {successMsg && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3 text-emerald-700 text-xs font-bold animate-in zoom-in-95">
                <CheckCircle2 size={16} /> <span>{successMsg}</span>
              </div>
            )}
            {authError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-xs font-bold animate-in fade-in">
                <ShieldAlert size={16} /> <span>{authError}</span>
              </div>
            )}

            {viewMode === "LOGIN" ? (
              /* --- LOGIN VIEW --- */
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={(e) => handleInputChange(e, "LOGIN")}
                      placeholder="admin@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#FBFBFB] border border-gray-200 rounded-xl outline-none text-sm focus:border-black transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                    >
                      Change?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black"
                      size={16}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginForm.password}
                      onChange={(e) => handleInputChange(e, "LOGIN")}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-[#FBFBFB] border border-gray-200 rounded-xl outline-none text-sm focus:border-black transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-black text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#222] transition-all disabled:bg-gray-200 shadow-lg shadow-black/5 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Sign In to Terminal"
                  )}
                </button>
              </form>
            ) : (
              /* --- CHANGE PASSWORD VIEW --- */
              <form
                onSubmit={handleChangePwSubmit}
                className="space-y-5 animate-in slide-in-from-right-4 duration-300"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <KeyRound
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={pwForm.currentPassword}
                      onChange={(e) => handleInputChange(e, "CHANGE_PW")}
                      className="w-full pl-10 pr-4 py-3 bg-[#FBFBFB] border border-gray-200 rounded-xl outline-none text-sm focus:border-black transition-all"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    New Secure Password
                  </label>
                  <div className="relative group">
                    <RefreshCw
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={pwForm.newPassword}
                      onChange={(e) => handleInputChange(e, "CHANGE_PW")}
                      className="w-full pl-10 pr-4 py-3 bg-[#FBFBFB] border border-gray-200 rounded-xl outline-none text-sm focus:border-black transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <ShieldCheck
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={pwForm.confirmPassword}
                      onChange={(e) => handleInputChange(e, "CHANGE_PW")}
                      className={`w-full pl-10 pr-4 py-3 bg-[#FBFBFB] border rounded-xl outline-none text-sm transition-all ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-200 focus:border-black"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="flex-1 h-12 bg-gray-100 text-gray-600 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] h-12 bg-black text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#222] transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Update Credentials"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-[#FBFBFB] px-8 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-green-600" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              End-to-End Encrypted Session
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">
          &copy; {new Date().getFullYear()} RAAHWAAR • System Administration
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
