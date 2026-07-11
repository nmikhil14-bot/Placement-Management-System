import React from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User as UserIcon, Shield, Briefcase, GraduationCap } from "lucide-react";

export function Navbar() {
  const { user, student, logout } = useAuth();

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-100">
            <Shield className="w-3.5 h-3.5" />
            University Admin
          </span>
        );
      case "recruiter":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Briefcase className="w-3.5 h-3.5" />
            Corporate Recruiter
          </span>
        );
      case "student":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            <GraduationCap className="w-3.5 h-3.5" />
            Student Portal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-xl shadow-md shadow-indigo-100">
          S
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">
            Placement Cell
          </h1>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Integrated Management System
          </p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900">
              {user.name}
            </span>
            <span className="text-xs text-gray-500">
              {student ? student.rollNumber : user.email}
            </span>
          </div>

          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            {getRoleBadge()}
            
            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
              id="navbar-logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
