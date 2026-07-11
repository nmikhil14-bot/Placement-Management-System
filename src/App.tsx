import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { RecruiterDashboard } from "./components/recruiter/RecruiterDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { LogOut, User, Shield, Briefcase, GraduationCap } from "lucide-react";

function AppContent() {
  const { user, student, isLoading, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  // App-level notification toast
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 mt-4 tracking-wider uppercase">Verifying university session...</p>
      </div>
    );
  }

  // Define top header component
  const renderHeader = () => {
    if (!user) return null;

    const getRoleBadge = () => {
      switch (user.role) {
        case "admin":
          return (
            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-150 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Director Desk
            </span>
          );
        case "recruiter":
          return (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Corporate Desk
            </span>
          );
        default:
          return (
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-150 text-[10px] font-black uppercase rounded-lg flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              Student Desk
            </span>
          );
      }
    };

    return (
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex items-center justify-between shadow-md" id="portal-navbar">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow shadow-indigo-600/50">
            S
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase">Placement Management System</h1>
            <p className="text-[10px] font-bold text-indigo-400 mt-0.5 tracking-wider">UNIVERSITY CELL</p>
          </div>
        </div>

        {/* User Card Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 border-r border-slate-800 pr-4">
            <div className="text-right">
              <p className="text-xs font-extrabold text-slate-200">
                {user.role === "student" && student ? `${student.firstName} ${student.lastName}` : user.name}
              </p>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                {user.role === "student" && student ? `Roll: ${student.rollNumber}` : user.email}
              </p>
            </div>
            {getRoleBadge()}
          </div>

          <button
            onClick={() => {
              logout();
              showNotification("Successfully logged out of portal.", "info");
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 hover:text-red-400 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            id="portal-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>
    );
  };

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard />;
      case "recruiter":
        return <RecruiterDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500 italic">User role configuration error.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900" id="placement-portal-root">
      {/* Dynamic Toast Notifications */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border shadow-xl flex items-center gap-2.5 max-w-sm animate-slide-up text-xs font-semibold ${
          notification.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
            : notification.type === "error"
            ? "bg-red-50 text-red-800 border-red-100"
            : "bg-indigo-50 text-indigo-800 border-indigo-100"
        }`}>
          <span className={`h-2 w-2 rounded-full ${
            notification.type === "success" ? "bg-emerald-500" : notification.type === "error" ? "bg-red-500" : "bg-indigo-500"
          }`} />
          {notification.message}
        </div>
      )}

      {/* Branded Header */}
      {renderHeader()}

      {/* Main Container screen routing */}
      <div className="flex-1 flex flex-col">
        {user ? (
          renderDashboardByRole()
        ) : isRegistering ? (
          <Register
            onToggleLogin={() => setIsRegistering(false)}
            showNotification={showNotification}
          />
        ) : (
          <Login
            onToggleRegister={() => setIsRegistering(true)}
            showNotification={showNotification}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
