import React, { useState } from "react";
import { Student, JobDrive, Application } from "../../types";
import { Search, Calendar, Check, AlertTriangle, FileCheck, XCircle, ArrowRight } from "lucide-react";

interface StudentJobsProps {
  student: Student | null;
  jobs: JobDrive[];
  applications: Application[];
  onApply: (jobDriveId: string) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function StudentJobs({ student, jobs, applications, onApply, showNotification }: StudentJobsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("All"); // All, Full-time, Internship
  const [activeTab, setActiveTab] = useState("All"); // All, Eligible, Applied, Shortlisted, Rejected, Offered

  const getApplicationForJob = (jobDriveId: string) => {
    return applications.find((a) => a.jobDriveId === jobDriveId || (a.jobDriveId as any)?._id === jobDriveId);
  };

  const checkEligibility = (job: JobDrive) => {
    if (!student) return { eligible: false, reasons: ["Profile not loaded"] };

    const reasons: string[] = [];
    
    // 1. Branch eligibility check
    const isBranchEligible = job.eligibility.branches.includes("All") || job.eligibility.branches.includes(student.branch);
    if (!isBranchEligible) {
      reasons.push(`Restricted to branches: ${job.eligibility.branches.join(", ")}`);
    }

    // 2. CGPA check
    const isCgpaEligible = student.cgpa >= job.eligibility.cgpaCutoff;
    if (!isCgpaEligible) {
      reasons.push(`Your CGPA (${student.cgpa}) is below required cutoff of ${job.eligibility.cgpaCutoff}`);
    }

    // 3. Backlog check
    const isBacklogEligible = student.backlogs <= job.eligibility.backlogsAllowed;
    if (!isBacklogEligible) {
      reasons.push(`Backlogs count (${student.backlogs}) exceeds allowed limit of ${job.eligibility.backlogsAllowed}`);
    }

    // 4. Batch/Year check
    const isYearEligible = job.eligibility.graduationYear.includes(student.graduationYear);
    if (!isYearEligible) {
      reasons.push(`Graduation year must be: ${job.eligibility.graduationYear.join(", ")}`);
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  };

  const filteredJobs = jobs.filter((job) => {
    const company = (job.companyId as any)?.companyName || "";
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    // Job Type Filter
    let matchesType = true;
    if (jobTypeFilter === "Full-time") {
      matchesType = job.stipend === undefined || job.stipend === null || job.stipend === 0;
    } else if (jobTypeFilter === "Internship") {
      matchesType = job.stipend !== undefined && job.stipend !== null && job.stipend > 0;
    }

    // Tab Filters
    let matchesTab = true;
    const application = getApplicationForJob(job._id);
    const eligibility = checkEligibility(job);

    if (activeTab === "Eligible") {
      matchesTab = eligibility.eligible && !application;
    } else if (activeTab === "Applied") {
      matchesTab = !!application;
    } else if (activeTab === "Shortlisted") {
      matchesTab = application?.status === "Shortlisted" || application?.status === "Interview";
    } else if (activeTab === "Rejected") {
      matchesTab = application?.status === "Rejected";
    } else if (activeTab === "Offered") {
      matchesTab = application?.status === "Offer" || application?.status === "Joined";
    }

    return matchesSearch && matchesType && matchesTab;
  });

  const handleApplyClick = async (jobDriveId: string) => {
    if (student?.isFrozen) {
      showNotification("Your profile is frozen. You cannot submit applications at this time.", "error");
      return;
    }

    try {
      await onApply(jobDriveId);
      showNotification("Applied successfully! Review status under Tracker tab.", "success");
    } catch (error: any) {
      showNotification(error.message || "Failed to apply.", "error");
    }
  };

  return (
    <div className="space-y-6" id="student-jobs-view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Job Drives</h2>
        <p className="text-sm text-slate-500 mt-1">Review, examine eligibility criteria, and apply for open placement/internship drives.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px space-x-6">
        {["All", "Eligible", "Applied", "Shortlisted", "Rejected", "Offered"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab} Drives
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles, companies, required skillsets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Full-time">Full-time Roles</option>
            <option value="Internship">Internships</option>
          </select>
        </div>
      </div>

      {/* Job Postings Table / Cards */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No recruitment drives found in this category.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Role & Corporate Partner</th>
                  <th className="px-6 py-4">Financials (CTC)</th>
                  <th className="px-6 py-4">Batch / Graduation</th>
                  <th className="px-6 py-4">Deadline & Visits</th>
                  <th className="px-6 py-4">My Eligibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredJobs.map((job) => {
                  const companyName = (job.companyId as any)?.companyName || "N/A";
                  const application = getApplicationForJob(job._id);
                  const eligibility = checkEligibility(job);

                  return (
                    <tr key={job._id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Role Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {companyName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{job.title}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{companyName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">
                          {job.salary} LPA
                        </span>
                        {job.stipend ? (
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">Stipend: ₹{job.stipend.toLocaleString()}/mo</p>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5">Full-Time Career</p>
                        )}
                      </td>

                      {/* Batch eligibility */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        Class of {job.eligibility.graduationYear.join(", ")}
                        <p className="text-[10px] text-slate-400 mt-0.5">{job.eligibility.branches.join(", ")}</p>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Apply by: {new Date(job.applyDeadline).toLocaleDateString()}
                          </span>
                          {job.visitDate && (
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              Visit: {new Date(job.visitDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Eligibility Status */}
                      <td className="px-6 py-4">
                        {application ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                            application.status === "Offer" || application.status === "Joined"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : application.status === "Rejected"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}>
                            <FileCheck className="w-3.5 h-3.5" />
                            {application.status}
                          </span>
                        ) : eligibility.eligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-700 font-bold">
                            <Check className="w-4 h-4" />
                            Eligible
                          </span>
                        ) : (
                          <div className="group relative w-fit cursor-help">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-amber-700 font-bold">
                              <AlertTriangle className="w-4 h-4" />
                              Ineligible
                            </span>
                            {/* Hover tooltip detailing failure reasons */}
                            <div className="absolute left-0 bottom-full z-10 w-64 p-3 bg-slate-900 text-white text-[10px] font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-800 mb-2">
                              <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-red-400">Ineligibility reasons:</p>
                              {eligibility.reasons.map((reason, idx) => (
                                <p key={idx} className="mt-1 flex items-start gap-1">
                                  <span>•</span> {reason}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {application ? (
                          <span className="text-xs text-slate-400 font-bold">Applied</span>
                        ) : eligibility.eligible ? (
                          <button
                            onClick={() => handleApplyClick(job._id)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-colors inline-flex items-center gap-1 cursor-pointer"
                            id={`apply-btn-${job._id}`}
                          >
                            Apply Now
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed"
                          >
                            Locked
                          </button>
                        )}
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
  );
}
