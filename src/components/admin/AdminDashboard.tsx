import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../common/Sidebar";
import { AdminHome } from "./AdminHome";
import { AdminStudents } from "./AdminStudents";
import { AdminCompanies } from "./AdminCompanies";
import { AdminJobs } from "./AdminJobs";
import { AdminRequests } from "./AdminRequests";
import { AdminNotices } from "./AdminNotices";
import { Student, Company, JobDrive, Application, SupportRequest, Notice } from "../../types";

export function AdminDashboard() {
  const { user, apiFetch } = useAuth();
  const [currentTab, setTab] = useState("admin-overview");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  // Sub-tab search states
  const [appSearch, setAppSearch] = useState("");
  const [appStatus, setAppStatus] = useState("All");
  const [userSearch, setUserSearch] = useState("");

  // Portal settings state
  const [settingsYear, setSettingsYear] = useState("2026 - 2027");
  const [settingsAllowEdit, setSettingsAllowEdit] = useState(true);
  const [settingsMinGPA, setSettingsMinGPA] = useState(6.0);

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
      const [studentsData, companiesData, jobsData, appsData, requestsData, noticesData, attendanceData] = await Promise.all([
        apiFetch("/api/students"),
        apiFetch("/api/companies"),
        apiFetch("/api/jobs"),
        apiFetch("/api/applications"),
        apiFetch("/api/requests"),
        apiFetch("/api/notices"),
        apiFetch("/api/attendance").catch(() => [])
      ]);

      setStudents(studentsData);
      setCompanies(companiesData);
      setJobs(jobsData);
      setApplications(appsData);
      setRequests(requestsData);
      setNotices(noticesData);
      setAttendanceLogs(attendanceData);
    } catch (err) {
      console.error("Error loading admin databases:", err);
      showNotification("Failed to synchronize admin dashboards.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, currentTab]);

  // Student Actions
  const handleAddStudent = async (studentData: Partial<Student>) => {
    try {
      await apiFetch("/api/students", {
        method: "POST",
        body: JSON.stringify(studentData)
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to create student account.");
    }
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      await apiFetch(`/api/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to edit student details.");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await apiFetch(`/api/students/${id}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to remove student account.");
    }
  };

  // Company Actions
  const handleAddCompany = async (companyData: Partial<Company>) => {
    try {
      await apiFetch("/api/companies", {
        method: "POST",
        body: JSON.stringify(companyData)
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to register company.");
    }
  };

  const handleUpdateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      await apiFetch(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to save company profile.");
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await apiFetch(`/api/companies/${id}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to remove company.");
    }
  };

  // Job Actions
  const handleUpdateJob = async (id: string, updates: Partial<JobDrive>) => {
    try {
      await apiFetch(`/api/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to adjust job parameters.");
    }
  };

  // Request/Ticket resolution
  const handleUpdateTicketStatus = async (id: string, status: "Approved" | "Rejected", adminComment: string, extraUpdates?: any) => {
    try {
      await apiFetch(`/api/requests/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, adminComment, extraUpdates })
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to resolve support ticket.");
    }
  };

  // Notice Actions
  const handleAddNotice = async (noticeData: Partial<Notice>) => {
    try {
      await apiFetch("/api/notices", {
        method: "POST",
        body: JSON.stringify(noticeData)
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to broadcast notice.");
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await apiFetch(`/api/notices/${id}`, {
        method: "DELETE"
      });
      await loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to remove notice.");
    }
  };

  // CSV Report Generator
  const exportCSV = (reportType: "placed" | "backlogs" | "salary") => {
    let csv = "";
    let filename = "";

    if (reportType === "placed") {
      filename = "Placed_Candidates_Roster.csv";
      csv = "Roll Number,Student Name,Branch,CGPA,Company,Job Title,Salary Package (LPA)\n";
      const placedApps = applications.filter(a => a.status === "Offer" || a.status === "Joined");
      placedApps.forEach((app: any) => {
        const s = app.studentId || {};
        const j = app.jobDriveId || {};
        const c = j?.companyId || {};
        csv += `"${s.rollNumber || ""}","${s.firstName || ""} ${s.lastName || ""}","${s.branch || ""}","${s.cgpa || ""}","${c.companyName || ""}","${j.title || ""}","${j.salary || ""}"\n`;
      });
    } else if (reportType === "backlogs") {
      filename = "Active_Backlogs_Students.csv";
      csv = "Roll Number,Student Name,Branch,CGPA,Active Backlogs,Attendance Percentage\n";
      const backlogStudents = students.filter(s => s.backlogs > 0);
      backlogStudents.forEach(s => {
        csv += `"${s.rollNumber}","${s.firstName} ${s.lastName}","${s.branch}","${s.cgpa}","${s.backlogs}","${s.attendance}%"\n`;
      });
    } else {
      filename = "Corporate_Salary_Package_Analysis.csv";
      csv = "Company Name,Job Profile Title,Offered Package (LPA),Min CGPA Criteria,Applications Count\n";
      jobs.forEach((job: any) => {
        const companyName = job.companyId?.companyName || "N/A";
        const appCount = applications.filter((a) => (a.jobDriveId as any)?._id === job._id || a.jobDriveId === job._id).length;
        csv += `"${companyName}","${job.title}","${job.salary} LPA","${job.eligibility?.cgpaCutoff || 6.0}","${appCount}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.click();
    showNotification(`Simulated CSV export complete: ${filename}`, "success");
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case "admin-overview":
        return (
          <AdminHome
            students={students}
            companies={companies}
            jobs={jobs}
            applications={applications}
            requests={requests}
            setTab={setTab}
          />
        );
      case "admin-companies":
        return (
          <AdminCompanies
            companies={companies}
            onAddCompany={handleAddCompany}
            onUpdateCompany={handleUpdateCompany}
            onDeleteCompany={handleDeleteCompany}
            showNotification={showNotification}
          />
        );
      case "admin-drives":
        return (
          <AdminJobs
            jobs={jobs}
            applications={applications}
            onUpdateJob={handleUpdateJob}
            showNotification={showNotification}
          />
        );
      case "admin-students":
        return (
          <AdminStudents
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            showNotification={showNotification}
          />
        );
      case "admin-requests":
        return (
          <AdminRequests
            requests={requests}
            onUpdateStatus={handleUpdateTicketStatus}
            showNotification={showNotification}
          />
        );
      case "admin-notices":
        return (
          <AdminNotices
            notices={notices}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
            showNotification={showNotification}
          />
        );
      case "admin-applications": {
        const filteredApps = applications.filter(app => {
          const student = app.studentId as any || {};
          const job = app.jobDriveId as any || {};
          const comp = job.companyId as any || {};
          const name = `${student.firstName || ""} ${student.lastName || ""}`;
          const matchesSearch = name.toLowerCase().includes(appSearch.toLowerCase()) ||
            (student.rollNumber || "").toLowerCase().includes(appSearch.toLowerCase()) ||
            (job.title || "").toLowerCase().includes(appSearch.toLowerCase()) ||
            (comp.companyName || "").toLowerCase().includes(appSearch.toLowerCase());
          const matchesStatus = appStatus === "All" || app.status === appStatus;
          return matchesSearch && matchesStatus;
        });

        return (
          <div className="space-y-6" id="admin-applications-view">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">University Master Applications</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Real-time centralized log of all job applications submitted across the college.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <input
                type="text"
                placeholder="Search candidates name, roll number, or corporate partners..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:outline-none bg-slate-50"
              />
              <select
                value={appStatus}
                onChange={(e) => setAppStatus(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="All">All Pipeline Milestones</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Written Test">Written Test</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="HR Round">HR Round</option>
                <option value="Offer">Offer Extended</option>
                <option value="Joined">Joined Company</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Recruiting Partner</th>
                    <th className="px-6 py-4">Position Title</th>
                    <th className="px-6 py-4">Current Step</th>
                    <th className="px-6 py-4">Remarks Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredApps.map((app: any) => (
                    <tr key={app._id} className="hover:bg-slate-50/10">
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-extrabold">{app.studentId?.firstName} {app.studentId?.lastName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Roll: {app.studentId?.rollNumber}</p>
                      </td>
                      <td className="px-6 py-4">{app.jobDriveId?.companyId?.companyName || "N/A"}</td>
                      <td className="px-6 py-4">{app.jobDriveId?.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 italic font-semibold">{app.remarks || "No administrative logs yet."}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      case "admin-tracker": {
        const stages = ["Applied", "Shortlisted", "Written Test", "Technical Interview", "HR Round", "Offer", "Joined"];
        return (
          <div className="space-y-6" id="admin-funnel-tracker-view">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Funnel Stage Tracking</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Recruitment metrics showing active candidate count grouped by selection milestone stage.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {stages.map((stg) => {
                const num = applications.filter((a) => a.status === stg).length;
                return (
                  <div key={stg} className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">{stg}</span>
                    <h3 className="text-3xl font-black text-indigo-600 mt-2">{num}</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">Active Students</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-4">Functional Pipeline Stage Chart Description</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                This selection funnel gives university placement coordinators absolute structural tracking over interviews. It helps cells detect bottleneck stages (e.g., technical tests or written screening) and optimize candidate preparation guides.
              </p>
            </div>
          </div>
        );
      }
      case "admin-attendance": {
        return (
          <div className="space-y-6" id="admin-attendance-view">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">On-Campus Physical Attendance</h2>
              <p className="text-sm text-slate-500 mt-1">Monitors active on-campus candidate check-ins and QR verification stamps during drive sessions.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Academic Branch</th>
                    <th className="px-6 py-4">Verification State</th>
                    <th className="px-6 py-4">Last Event Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic font-semibold">
                        No check-in events captured today yet. Students scan check-in QR codes on support desk tabs.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log: any) => (
                      <tr key={log._id} className="hover:bg-slate-50/10">
                        <td className="px-6 py-4 text-slate-900 font-extrabold">{log.studentId?.firstName} {log.studentId?.lastName}</td>
                        <td className="px-6 py-4">{log.studentId?.rollNumber}</td>
                        <td className="px-6 py-4">{log.studentId?.branch}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-800 rounded">
                            Verified Check-In
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : "Just Now"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      case "admin-reports": {
        return (
          <div className="space-y-6" id="admin-reports-view">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">University Analytical Reports</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Export raw student databases, pending backlogs list, or compensation metrics into functional CSV spreadsheets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <span className="h-2 w-2 rounded-full bg-emerald-500 block" />
                <h3 className="font-extrabold text-slate-900 text-sm">Placed Candidates List</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Downloads a full roster CSV of students with confirmed corporate placement offers, including CGPA and package details.</p>
                <button
                  onClick={() => exportCSV("placed")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow cursor-pointer transition-colors"
                >
                  Download Placed CSV
                </button>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <span className="h-2 w-2 rounded-full bg-red-500 block" />
                <h3 className="font-extrabold text-slate-900 text-sm">Pending Backlogs List</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Downloads a roster CSV of university students who currently have active backlogs to coordinate preparation camps.</p>
                <button
                  onClick={() => exportCSV("backlogs")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow cursor-pointer transition-colors"
                >
                  Download Backlogs CSV
                </button>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <span className="h-2 w-2 rounded-full bg-blue-500 block" />
                <h3 className="font-extrabold text-slate-900 text-sm">Compensation Drive Index</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Downloads a matrix of visiting corporate partners, offered positions, required CGPA benchmarks, and candidate volume.</p>
                <button
                  onClick={() => exportCSV("salary")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow cursor-pointer transition-colors"
                >
                  Download Packages CSV
                </button>
              </div>
            </div>
          </div>
        );
      }
      case "admin-users": {
        const adminAccounts = [
          { name: "University Director Office", email: "admin@university.edu", role: "Super Admin", state: "Active" }
        ];
        const recruiterAccounts = companies.map(c => ({
          name: `${c.companyName} Representative`,
          email: c.hrEmail || "careers@company.com",
          role: "Corporate Recruiter",
          state: "Verified Partner"
        }));

        const filteredRecruiters = recruiterAccounts.filter(r =>
          r.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          r.email.toLowerCase().includes(userSearch.toLowerCase())
        );

        return (
          <div className="space-y-6" id="admin-users-roster-view">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Access Directory</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Coordinate access tokens, review corporate credentials, and secure directory credentials.</p>
            </div>

            <div className="flex bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <input
                type="text"
                placeholder="Search user emails, name, or role classifications..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold focus:outline-none bg-slate-50"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Full Name / Desk</th>
                    <th className="px-6 py-4">Auth Communication Email</th>
                    <th className="px-6 py-4">System Role</th>
                    <th className="px-6 py-4">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {adminAccounts.map((adm) => (
                    <tr key={adm.email} className="hover:bg-slate-50/10">
                      <td className="px-6 py-4 text-indigo-600 font-extrabold">{adm.name}</td>
                      <td className="px-6 py-4">{adm.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] uppercase font-black tracking-wider">{adm.role}</span>
                      </td>
                      <td className="px-6 py-4 text-emerald-600">{adm.state}</td>
                    </tr>
                  ))}
                  {filteredRecruiters.map((rec: any) => (
                    <tr key={rec.email} className="hover:bg-slate-50/10">
                      <td className="px-6 py-4 text-slate-900 font-extrabold">{rec.name}</td>
                      <td className="px-6 py-4">{rec.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded text-[9px] uppercase font-black tracking-wider">{rec.role}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">{rec.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      case "admin-settings": {
        const handleSaveSettings = (e: React.FormEvent) => {
          e.preventDefault();
          showNotification("Portal governance configuration updated!", "success");
        };

        return (
          <div className="space-y-6" id="admin-settings-panel">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Parameters Configuration</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Fine-tune placement cell policy, gpa threshold configurations, and security lock filters.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm max-w-2xl">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academic Placement Year Session</label>
                    <input
                      type="text"
                      value={settingsYear}
                      onChange={(e) => setSettingsYear(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Minimum Default University GPA Threshold</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settingsMinGPA}
                      onChange={(e) => setSettingsMinGPA(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Lock Student Manual Editing State</p>
                      <p className="text-[10px] text-slate-400 font-medium">When checked, university students can only raise support tickets to modify CGPA parameters.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsAllowEdit}
                      onChange={(e) => setSettingsAllowEdit(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-slate-200 rounded focus:ring-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Save configurations
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      }
      default:
        return (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500 italic">Page tab not implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" id="admin-portal-dashboard">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setTab={setTab} role="admin" />

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
              <p className="text-xs text-slate-500 font-semibold mt-4">Syncing university mainframes...</p>
            </div>
          ) : (
            renderActiveTab()
          )}
        </div>
      </main>
    </div>
  );
}
export default AdminDashboard;
