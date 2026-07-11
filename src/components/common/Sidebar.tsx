import React from "react";
import {
  Home,
  Building2,
  Briefcase,
  User,
  Activity,
  FileQuestion,
  Bell,
  CheckSquare,
  Users,
  Settings,
  Shield,
  FileText,
  Clock
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  role: "student" | "admin" | "recruiter";
}

export function Sidebar({ currentTab, setTab, role }: SidebarProps) {
  const getMenuItems = () => {
    switch (role) {
      case "student":
        return [
          { id: "home", label: "Dashboard", icon: Home },
          { id: "companies", label: "Companies", icon: Building2 },
          { id: "jobs", label: "Job Postings", icon: Briefcase },
          { id: "profile", label: "My Profile", icon: User },
          { id: "tracker", label: "Application Tracker", icon: Activity },
          { id: "requests", label: "Support Desk", icon: FileQuestion },
          { id: "notices", label: "Notice Board", icon: Bell },
        ];
      case "admin":
        return [
          { id: "admin-overview", label: "Overview", icon: Home },
          { id: "admin-companies", label: "Companies", icon: Building2 },
          { id: "admin-drives", label: "Job Drives", icon: Briefcase },
          { id: "admin-students", label: "Students Directory", icon: Users },
          { id: "admin-applications", label: "Applications", icon: FileText },
          { id: "admin-tracker", label: "Selection Steps", icon: Activity },
          { id: "admin-attendance", label: "Attendance Log", icon: Clock },
          { id: "admin-requests", label: "Student Requests", icon: FileQuestion },
          { id: "admin-notices", label: "Announcements", icon: Bell },
          { id: "admin-reports", label: "Reports & Exports", icon: CheckSquare },
          { id: "admin-users", label: "User Access", icon: Shield },
          { id: "admin-settings", label: "Portal Settings", icon: Settings },
        ];
      case "recruiter":
        return [
          { id: "recruiter-profile", label: "Company Profile", icon: Building2 },
          { id: "recruiter-jobs", label: "Manage Jobs", icon: Briefcase },
          { id: "recruiter-applications", label: "Applicants List", icon: Users },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 shadow-xl" id="portal-sidebar">
      <div className="flex flex-col py-6">
        <div className="px-6 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </span>
        </div>
        
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                id={`sidebar-tab-${item.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p className="font-medium">Academic Year 2026 - 2027</p>
        <p className="mt-1">Institute of Science and Technology</p>
      </div>
    </aside>
  );
}
