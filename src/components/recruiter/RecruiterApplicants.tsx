import React, { useState, useEffect } from "react";
import { Application, JobDrive, Student } from "../../types";
import { Search, FileText, CheckCircle2, XCircle, ArrowUpRight, Check, Filter, QrCode } from "lucide-react";

interface RecruiterApplicantsProps {
  applications: Application[];
  jobs: JobDrive[];
  onUpdateStatus: (id: string, status: string, remarks: string) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

export function RecruiterApplicants({ applications, jobs, onUpdateStatus, showNotification, apiFetch }: RecruiterApplicantsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Selection state for updating status
  const [updatingApp, setUpdatingApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState("Shortlisted");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Attendance list state
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchAttendance = async () => {
    setLoadingLogs(true);
    try {
      const data = await apiFetch("/api/attendance");
      setAttendanceLogs(data);
    } catch (err) {
      console.error("Failed to load live QR attendance", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleUpdateClick = (app: Application) => {
    setUpdatingApp(app);
    setNewStatus(app.status);
    setRemarks(app.remarks || "");
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingApp) return;

    setIsSubmitting(true);
    try {
      await onUpdateStatus(updatingApp._id, newStatus, remarks);
      setUpdatingApp(null);
      showNotification("Candidate pipeline phase updated successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to advance stage.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApps = applications.filter((app: any) => {
    const student = app.studentId || {};
    const studentName = `${student.firstName || ""} ${student.lastName || ""}`;
    const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.rollNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJob = selectedJobId === "All" || app.jobDriveId === selectedJobId || (app.jobDriveId as any)?._id === selectedJobId;
    const matchesStatus = selectedStatus === "All" || app.status === selectedStatus;

    return matchesSearch && matchesJob && matchesStatus;
  });

  return (
    <div className="space-y-8" id="recruiter-applicants-view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Screening Desk</h2>
        <p className="text-sm text-slate-500 mt-1">Advance applicant milestones, download resumes, and cross-reference live exam check-ins.</p>
      </div>

      {/* Grid of Applications vs Attendance Log */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Applicants Screen (Left 8-columns) */}
        <div className="xl:col-span-8 space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Jobs</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.title}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Stages</option>
                <option value="Applied">Applied</option>
                <option value="Assessment">Assessment</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer Issued</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Candidates table */}
          {filteredApps.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-sm text-slate-500 italic">No candidates match current filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Candidate Profile</th>
                      <th className="px-6 py-4">Academics (CGPA)</th>
                      <th className="px-6 py-4">Job / Profile</th>
                      <th className="px-6 py-4">Current Phase</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                    {filteredApps.map((app: any) => {
                      const student = app.studentId || {};
                      const studentName = `${student.firstName || "University"} ${student.lastName || "Student"}`;
                      const appliedJob = (jobs.find((j) => j._id === app.jobDriveId || (j._id as any) === (app.jobDriveId as any)?._id)) as any || {};

                      return (
                        <tr key={app._id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-slate-900 font-bold">{studentName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Roll No: {student.rollNumber || "N/A"}</p>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-slate-800">{student.cgpa || "N/A"} CGPA</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{student.branch || "Computer Science"}</p>
                          </td>

                          <td className="px-6 py-4 text-slate-700 text-xs">
                            {appliedJob.title || app.jobDriveId?.title || "Recruitment Drive"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md font-bold">
                              {app.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                            {student.resumeUrl && (
                              <a
                                href={student.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="h-8 px-2.5 rounded-lg border border-slate-150 text-slate-500 hover:text-indigo-600 bg-white flex items-center justify-center transition-colors"
                                title="Review Resume"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}

                            <button
                              onClick={() => handleUpdateClick(app)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                              id={`update-status-btn-${app._id}`}
                            >
                              Advance
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Live Attendance Logs (Right 4-columns) */}
        <div className="xl:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4.5 h-4.5 text-indigo-600" />
                On-Campus Attendance Logs
              </h3>
              <button
                onClick={fetchAttendance}
                className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer uppercase"
              >
                Refresh
              </button>
            </div>

            {loadingLogs ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-[10px] text-slate-400 font-bold mt-2.5">Syncing check-ins...</p>
              </div>
            ) : attendanceLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-10">No students scanned check-ins for active rounds today.</p>
            ) : (
              <div className="space-y-3.5 max-h-[480px] overflow-y-auto">
                {attendanceLogs.map((log: any, idx: number) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-950">{log.studentName || `Roll: ${log.rollNumber}`}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Checked-In Round: {log.round}</p>
                      </div>
                      <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100/60 mt-2.5 pt-2 text-[9px] font-bold text-slate-400">
                      <span>Method: QR Scan</span>
                      <span>{log.checkedInAt ? new Date(log.checkedInAt).toLocaleTimeString() : "Live"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Advance Stage Modal */}
      {updatingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setUpdatingApp(null)}
              className="absolute right-5 top-5 h-8 w-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer font-bold"
            >
              ✕
            </button>

            <h3 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Advance Candidate Milestone
            </h3>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Advanced Pipeline Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
                >
                  <option value="Applied">Applied (Screening)</option>
                  <option value="Assessment">Assessment (Scheduled / Written)</option>
                  <option value="Shortlisted">Shortlisted for Rounds</option>
                  <option value="Interview">Technical / Panel Interview</option>
                  <option value="Offer">Issue Job Offer (Hired)</option>
                  <option value="Rejected">Rejected / Not Selected</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recruiter Feedback / Remarks</label>
                <textarea
                  placeholder="e.g. Scored 85% in Code Assessment. Recommended for Tech Interview Slot 1."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs bg-slate-50 focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setUpdatingApp(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer disabled:bg-slate-400"
                >
                  {isSubmitting ? "Saving Phase..." : "Advance Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
