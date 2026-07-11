import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../common/Sidebar";
import { RecruiterHome } from "./RecruiterHome";
import { RecruiterJobs } from "./RecruiterJobs";
import { RecruiterApplicants } from "./RecruiterApplicants";
import { RecruiterCompany } from "./RecruiterCompany";
import { Company, JobDrive, Application } from "../../types";

export function RecruiterDashboard() {
  const { user, apiFetch } = useAuth();
  const [currentTab, setTab] = useState("recruiter-jobs");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

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
      // 1. Fetch recruiter's company details
      const companyRes = await apiFetch("/api/recruiter/company");
      setCompany(companyRes);

      if (companyRes) {
        // 2. Fetch jobs and applications for this company
        const [jobsRes, appsRes] = await Promise.all([
          apiFetch(`/api/companies/${companyRes._id}/jobs`),
          apiFetch(`/api/companies/${companyRes._id}/applications`)
        ]);
        setJobs(jobsRes);
        setApplications(appsRes);
      }
    } catch (err) {
      console.error("Error loading recruiter data:", err);
      showNotification("Failed to synchronize recruiter statistics.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, currentTab]);

  // Job operations
  const handleCreateJob = async (jobData: Partial<JobDrive>) => {
    if (!company) return;
    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({ ...jobData, companyId: company._id })
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to publish job drive.");
    }
  };

  const handleUpdateJob = async (id: string, updates: Partial<JobDrive>) => {
    try {
      await apiFetch(`/api/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to update job drive.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await apiFetch(`/api/jobs/${id}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete job drive.");
    }
  };

  // Application advancement
  const handleUpdateApplicantStatus = async (appId: string, status: string, remarks: string) => {
    try {
      await apiFetch(`/api/applications/${appId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, remarks })
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to advance applicant milestone.");
    }
  };

  // Company details editing
  const handleUpdateCompany = async (updates: Partial<Company>) => {
    if (!company) return;
    try {
      const updated = await apiFetch(`/api/companies/${company._id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      setCompany(updated);
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to update corporate profile.");
    }
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case "recruiter-profile":
        return (
          <div className="space-y-8">
            <RecruiterHome jobs={jobs} applications={applications} setTab={setTab} />
            <RecruiterCompany
              company={company}
              onUpdateCompany={handleUpdateCompany}
              showNotification={showNotification}
            />
          </div>
        );
      case "recruiter-jobs":
        return (
          <RecruiterJobs
            jobs={jobs}
            onCreateJob={handleCreateJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            showNotification={showNotification}
          />
        );
      case "recruiter-applications":
        return (
          <RecruiterApplicants
            applications={applications}
            jobs={jobs}
            onUpdateStatus={handleUpdateApplicantStatus}
            showNotification={showNotification}
            apiFetch={apiFetch}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500 italic">Page tab not implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" id="recruiter-portal-dashboard">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setTab={setTab} role="recruiter" />

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
              <p className="text-xs text-slate-500 font-semibold mt-4">Retrieving corporate credentials...</p>
            </div>
          ) : (
            renderActiveTab()
          )}
        </div>
      </main>
    </div>
  );
}
export default RecruiterDashboard;
