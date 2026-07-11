import React, { useState } from "react";
import { JobDrive } from "../../types";
import { Plus, Edit, Trash2, Calendar, Check, AlertTriangle, Users } from "lucide-react";

interface RecruiterJobsProps {
  jobs: JobDrive[];
  onCreateJob: (job: Partial<JobDrive>) => Promise<void>;
  onUpdateJob: (id: string, updates: Partial<JobDrive>) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function RecruiterJobs({ jobs, onCreateJob, onUpdateJob, onDeleteJob, showNotification }: RecruiterJobsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState(12);
  const [stipend, setStipend] = useState(0);
  const [applyDeadline, setApplyDeadline] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [skills, setSkills] = useState("");
  
  // Eligibility states
  const [cgpaCutoff, setCgpaCutoff] = useState(7.5);
  const [backlogsAllowed, setBacklogsAllowed] = useState(0);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(["Computer Science"]);
  const [graduationYear, setGraduationYear] = useState<number[]>([2027]);

  const branchesOptions = ["Computer Science", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering"];

  const handleBranchToggle = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleEditClick = (job: JobDrive) => {
    setEditingId(job._id);
    setTitle(job.title);
    setDescription(job.description);
    setSalary(job.salary);
    setStipend(job.stipend || 0);
    setApplyDeadline(job.applyDeadline ? new Date(job.applyDeadline).toISOString().split("T")[0] : "");
    setVisitDate(job.visitDate ? new Date(job.visitDate).toISOString().split("T")[0] : "");
    setSkills(job.skills.join(", "));
    setCgpaCutoff(job.eligibility.cgpaCutoff);
    setBacklogsAllowed(job.eligibility.backlogsAllowed);
    setSelectedBranches(job.eligibility.branches);
    setGraduationYear(job.eligibility.graduationYear);
    setShowForm(true);
  };

  const handleReset = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSalary(12);
    setStipend(0);
    setApplyDeadline("");
    setVisitDate("");
    setSkills("");
    setCgpaCutoff(7.5);
    setBacklogsAllowed(0);
    setSelectedBranches(["Computer Science"]);
    setGraduationYear([2027]);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !applyDeadline) {
      showNotification("Please fill in all required job fields.", "error");
      return;
    }

    if (selectedBranches.length === 0) {
      showNotification("Please select at least one eligible academic branch.", "error");
      return;
    }

    const payload: Partial<JobDrive> = {
      title,
      description,
      salary: Number(salary),
      stipend: stipend ? Number(stipend) : 0,
      applyDeadline,
      visitDate: visitDate || undefined,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      eligibility: {
        cgpaCutoff: Number(cgpaCutoff),
        backlogsAllowed: Number(backlogsAllowed),
        branches: selectedBranches,
        graduationYear: graduationYear
      },
      status: "Published"
    };

    try {
      if (editingId) {
        await onUpdateJob(editingId, payload);
        showNotification("Placement drive details updated successfully!", "success");
      } else {
        await onCreateJob(payload);
        showNotification("New placement recruitment drive published!", "success");
      }
      handleReset();
    } catch (err: any) {
      showNotification(err.message || "Failed to save recruitment drive.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this job drive? This will archive all associated applications.")) {
      try {
        await onDeleteJob(id);
        showNotification("Recruitment drive removed.", "info");
      } catch (err: any) {
        showNotification(err.message || "Deletion failed.", "error");
      }
    }
  };

  return (
    <div className="space-y-6" id="recruiter-jobs-view">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Drives</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Create, publish, and manage active on-campus recruitment jobs.</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            id="create-drive-btn"
          >
            <Plus className="w-4 h-4" />
            Create Recruitment Drive
          </button>
        )}
      </div>

      {/* Split/Expand Form view */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
          <h3 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">
            {editingId ? "Modify Placement Drive details" : "Publish a New Placement Recruitment Drive"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Basic Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job / Profile Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Frontend Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description & Role Criteria *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about the company values, role competencies, evaluation format, and day-to-day responsibilities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Annual CTC (LPA) *</label>
                    <input
                      type="number"
                      required
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Monthly Stipend (Optional)</label>
                    <input
                      type="number"
                      value={stipend}
                      onChange={(e) => setStipend(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Mongoose, Python, Docker"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Schedule and Criteria Selectors */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Apply Deadline *</label>
                    <input
                      type="date"
                      required
                      value={applyDeadline}
                      onChange={(e) => setApplyDeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Campus Visit</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Eligibility criteria limits */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-indigo-600" />
                    RECRUITER ELIGIBILITY BOUNDARIES
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase font-bold">Minimum CGPA Cutoff</label>
                      <input
                        type="number"
                        step="0.1"
                        max="10"
                        min="0"
                        value={cgpaCutoff}
                        onChange={(e) => setCgpaCutoff(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-white focus:outline-none mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase font-bold">Max Allowed Backlogs</label>
                      <input
                        type="number"
                        min="0"
                        value={backlogsAllowed}
                        onChange={(e) => setBacklogsAllowed(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-white focus:outline-none mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1.5">Eligible Academic Branches</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {branchesOptions.map((branch) => (
                        <label key={branch} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBranches.includes(branch)}
                            onChange={() => handleBranchToggle(branch)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          {branch}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                {editingId ? "Save Changes" : "Publish Drive Now"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posted Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base leading-tight">{job.title}</h4>
                  <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {job.salary} LPA
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleEditClick(job)}
                    className="h-8 w-8 rounded-lg border border-slate-150 bg-white text-slate-500 hover:text-indigo-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
                    title="Edit Drive"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="h-8 w-8 rounded-lg border border-slate-150 bg-white text-slate-400 hover:text-red-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
                    title="Delete Drive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">{job.description}</p>

              {/* Skills required */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Eligibility specifications */}
            <div className="border-t border-slate-100 mt-5 pt-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">ELIGIBILITY CONFIGS</p>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1">
                  CGPA Cutoff: {job.eligibility.cgpaCutoff}
                </span>
                <span className="flex items-center gap-1">
                  Backlogs Limit: {job.eligibility.backlogsAllowed}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100/60 mt-4 pt-3 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Due: {new Date(job.applyDeadline).toLocaleDateString()}
                </span>
                <span className="font-bold text-slate-500">
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
