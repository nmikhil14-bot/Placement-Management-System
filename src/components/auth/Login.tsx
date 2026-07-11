import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Key, Mail, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";

interface LoginProps {
  onToggleRegister: () => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function Login({ onToggleRegister, showNotification }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("Please enter both email and password.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showNotification("Welcome back! Login successful.", "success");
      } else {
        showNotification(res.error || "Invalid credentials", "error");
      }
    } catch (err: any) {
      showNotification("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    showNotification(`Autofilled demo credentials. Click Login to proceed!`, "info");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row bg-slate-50 items-center justify-center p-6 md:p-12">
      {/* Visual Welcome Board */}
      <div className="w-full md:w-1/2 max-w-md flex flex-col justify-center text-slate-900 pr-0 md:pr-12 mb-8 md:mb-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full w-fit mb-4">
          <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
          University Authorized Portal
        </div>
        <h2 className="text-3.5xl font-black tracking-tight text-slate-950 leading-tight">
          Next Gen <br />
          <span className="text-indigo-600 bg-indigo-50/50 px-1.5 rounded">Campus Placements</span>
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed text-sm md:text-base">
          Welcome to the unified Placement Cell. Manage applications, review status trackers, read real-time university circulars, and secure placement offers effortlessly.
        </p>

        {/* Demo Credentials Section */}
        <div className="mt-8 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Quick Access Demo Credentials
          </h3>
          <div className="space-y-2.5">
            <button
              onClick={() => autofill("student@university.edu", "password123")}
              className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 transition-colors text-xs font-semibold text-indigo-950"
              id="demo-student-autofill"
            >
              <span>Student Profile (Alex Carter)</span>
              <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">Autofill</span>
            </button>
            <button
              onClick={() => autofill("admin@university.edu", "admin123")}
              className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border border-red-100 bg-red-50/40 hover:bg-red-50 transition-colors text-xs font-semibold text-red-950"
              id="demo-admin-autofill"
            >
              <span>University Administrator</span>
              <span className="text-[10px] text-red-600 bg-white px-2 py-0.5 rounded border border-red-200">Autofill</span>
            </button>
            <button
              onClick={() => autofill("recruiter@company.com", "recruiter123")}
              className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition-colors text-xs font-semibold text-emerald-950"
              id="demo-recruiter-autofill"
            >
              <span>Corporate Recruiter (Google HR)</span>
              <span className="text-[10px] text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-200">Autofill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Login Card Form */}
      <div className="w-full md:w-1/2 max-w-md">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-100">
          <div className="mb-6">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Sign In</h3>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the placement dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Secure Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  id="login-password-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me on this browser
              </label>
              <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="login-submit-btn"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:bg-slate-400 cursor-pointer"
            >
              {isSubmitting ? "Authenticating..." : "Sign In to Portal"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="border-t border-slate-100 mt-8 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Not registered yet?{" "}
              <button
                onClick={onToggleRegister}
                className="font-bold text-indigo-600 hover:underline inline"
                id="toggle-register-btn"
              >
                Register a new profile
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
