import React, { useState } from "react";
import { JobDrive, Application } from "../../types";
import { Search, Edit, Eye, Calendar, AlertTriangle, Users } from "lucide-react";

interface AdminJobsProps {
  jobs: JobDrive[];
  applications: Application[];
  onUpdateJob: (id: string, updates: Partial<JobDrive>) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function AdminJobs({ jobs, applications, onUpdateJob, showNotification }: AdminJobsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states for criteria edits
  const [editingJob, setEditingJob] = useState<JobDrive | null>(null);
  const [cgpaCutoff, setCgpaCutoff] = useState(7.5);
  const [backlogsAllowed, setBacklogsAllowed] = useState(0);
  const [salary, setSalary] = useState(12);
  const [isSaving, setIsSaving] = useState(false);

  const getApplicantsCount = (jobId: string) => {
    return applications.filter((a) => a.jobDriveId === jobId || (a.jobDriveId as any)?._id === jobId).length;
  };

  const handleEditClick = (job: JobDrive) => {
    setEditingJob(job);
    setCgpaCutoff(job.eligibility.cgpaCutoff);
    setBacklogsAllowed(job.eligibility.backlogsAllowed);
    setSalary(job.salary);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setIsSaving(true);
    try {
      await onUpdateJob(editingJob._id, {
        salary: Number(salary),
        eligibility: {
          ...editingJob.eligibility,
          cgpaCutoff: Number(cgpaCutoff),
          backlogsAllowed: Number(backlogsAllowed)
        }
      });
      setEditingJob(null);
      showNotification("Placement drive parameters adjusted successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to update criteria", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const company = (job.companyId as any)?.companyName || "";
    return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6" id="admin-jobs-view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Recruitment Drives</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Coordinate ongoing company campaigns, examine candidates size, or modify eligibility bounds.</p>
      </div>

      {/* Toolbar Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by corporate name, job profile role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>
      </div>

      {/* Drives table */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No visiting campus recruitment drives recorded.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Placement Campaign Role</th>
                  <th className="px-6 py-4">CTC Offered (LPA)</th>
                  <th className="px-6 py-4">Academic Cutoffs</th>
                  <th className="px-6 py-4">Applicants Volume</th>
                  <th className="px-6 py-4">Apply Deadline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {filteredJobs.map((job) => {
                  const companyName = (job.companyId as any)?.companyName || "N/A";

                  return (
                    <tr key={job._id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-slate-900 font-bold">{job.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{companyName}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-indigo-600 font-bold">{job.salary} LPA</span>
                        {job.stipend ? (
                          <p className="text-[10px] text-slate-400 mt-0.5">Stipend: ₹{job.stipend}/mo</p>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5">Full-Time (FTE)</p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-slate-700">{job.eligibility.cgpaCutoff} CGPA Min</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Max Backlogs Allowed: {job.eligibility.backlogsAllowed}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {getApplicantsCount(job._id)} Candidate{getApplicantsCount(job._id) !== 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(job.applyDeadline).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditClick(job)}
                          className="h-8 w-8 rounded-lg border border-slate-150 bg-white text-slate-500 hover:text-indigo-600 hover:bg-slate-50 inline-flex items-center justify-center cursor-pointer transition-colors"
                          title="Tweak eligibility thresholds"
                          id={`tweak-drive-btn-${job._id}`}
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Adjust criteria Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setEditingJob(null)}
              className="absolute right-5 top-5 h-8 w-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
              Adjust Drive Parameters
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Annual Compensation CTC (LPA)</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Minimum CGPA Cutoff</label>
                <input
                  type="number"
                  step="0.1"
                  max="10"
                  min="0"
                  value={cgpaCutoff}
                  onChange={(e) => setCgpaCutoff(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Allowed backlogs count</label>
                <input
                  type="number"
                  min="0"
                  value={backlogsAllowed}
                  onChange={(e) => setBacklogsAllowed(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer disabled:bg-slate-400"
                >
                  {isSaving ? "Saving..." : "Tweak parameters"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminJobs;
