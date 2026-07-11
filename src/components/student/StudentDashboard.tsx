import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../common/Sidebar";
import { StudentHome } from "./StudentHome";
import { StudentCompanies } from "./StudentCompanies";
import { StudentJobs } from "./StudentJobs";
import { StudentProfile } from "./StudentProfile";
import { StudentTracker } from "./StudentTracker";
import { StudentRequests } from "./StudentRequests";
import { StudentNotices } from "./StudentNotices";
import { Company, JobDrive, Application, Notice, SupportRequest } from "../../types";

export function StudentDashboard() {
  const { user, student, refreshUser, apiFetch } = useAuth();
  const [currentTab, setTab] = useState("home");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  // Simple feedback notification state
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [companiesData, jobsData, appsData, noticesData, requestsData] = await Promise.all([
        apiFetch("/api/companies"),
        apiFetch("/api/jobs"),
        apiFetch("/api/applications"),
        apiFetch("/api/notices"),
        apiFetch("/api/requests")
      ]);

      setCompanies(companiesData);
      setJobs(jobsData);
      setApplications(appsData);
      setNotices(noticesData);
      setRequests(requestsData);
    } catch (err) {
      console.error("Error loading student portal data:", err);
      showNotification("Failed to load portal updates. Reconnecting...", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, currentTab]);

  const handleApplyJob = async (jobDriveId: string) => {
    try {
      await apiFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({ jobDriveId })
      });
      // reload
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to submit application.");
    }
  };

  const handleUpdateProfile = async (updates: any) => {
    if (!student) return;
    try {
      await apiFetch(`/api/students/${student._id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      await refreshUser();
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to update profile.");
    }
  };

  const handleSubmitRequest = async (type: string, message: string) => {
    try {
      await apiFetch("/api/requests", {
        method: "POST",
        body: JSON.stringify({ type, message })
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to submit support request.");
    }
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case "home":
        return (
          <StudentHome
            student={student}
            notices={notices}
            jobs={jobs}
            applications={applications}
            setTab={setTab}
          />
        );
      case "companies":
        return <StudentCompanies companies={companies} jobs={jobs} />;
      case "jobs":
        return (
          <StudentJobs
            student={student}
            jobs={jobs}
            applications={applications}
            onApply={handleApplyJob}
            showNotification={showNotification}
          />
        );
      case "profile":
        return (
          <StudentProfile
            student={student}
            onUpdateProfile={handleUpdateProfile}
            showNotification={showNotification}
          />
        );
      case "tracker":
        return <StudentTracker applications={applications} />;
      case "requests":
        return (
          <StudentRequests
            student={student}
            companies={companies}
            requests={requests}
            onSubmitRequest={handleSubmitRequest}
            showNotification={showNotification}
            apiFetch={apiFetch}
          />
        );
      case "notices":
        return <StudentNotices notices={notices} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500 italic">Page tab not implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" id="student-portal-dashboard">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setTab={setTab} role="student" />

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        
        {/* Floating toast notification banner */}
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

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-xs text-slate-500 font-semibold mt-4">Synchronizing database status...</p>
            </div>
          ) : (
            renderActiveTab()
          )}
        </div>
      </main>
    </div>
  );
}
export default StudentDashboard;
