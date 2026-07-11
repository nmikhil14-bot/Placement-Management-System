import React from "react";
import { Student, Notice, JobDrive, Application } from "../../types";
import { Briefcase, CheckCircle, Clock, AlertCircle, ArrowRight, Bell, Calendar } from "lucide-react";

interface StudentHomeProps {
  student: Student | null;
  notices: Notice[];
  jobs: JobDrive[];
  applications: Application[];
  setTab: (tab: string) => void;
}

export function StudentHome({ student, notices, jobs, applications, setTab }: StudentHomeProps) {
  const getAppliedCount = () => applications.length;
  const getShortlistedCount = () => applications.filter((a) => ["Shortlisted", "Interview", "Offer", "Joined"].includes(a.status)).length;
  const getPendingCount = () => applications.filter((a) => a.status === "Applied" || a.status === "Assessment").length;
  
  const getUpcomingInterviews = () => {
    // Return jobs where user applied and status is Interview
    return applications.filter((a) => a.status === "Interview");
  };

  const getRecentNotices = () => notices.slice(0, 3);
  const getEligibleJobsCount = () => {
    if (!student) return 0;
    return jobs.filter((job) => {
      const branchMatch = job.eligibility.branches.includes("All") || job.eligibility.branches.includes(student.branch);
      const cgpaMatch = student.cgpa >= job.eligibility.cgpaCutoff;
      const backlogMatch = student.backlogs <= job.eligibility.backlogsAllowed;
      return branchMatch && cgpaMatch && backlogMatch && job.status === "Published";
    }).length;
  };

  const upcomingInterviews = getUpcomingInterviews();
  const recentNotices = getRecentNotices();

  return (
    <div className="space-y-8" id="student-home-view">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full">
            PLACEMENT CYCLE 2026 - 2027
          </span>
          <h2 className="text-3xl font-bold tracking-tight mt-3 text-slate-100">
            Welcome back, {student ? `${student.firstName} ${student.lastName}` : "Student"}!
          </h2>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Your university placement account is fully active. Review the bento board below to track your active applications, look up eligible drives, and stay updated with placement coordinators.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setTab("jobs")}
              className="px-5 py-2.5 bg-white text-indigo-950 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              Browse Active Drives
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTab("profile")}
              className="px-5 py-2.5 bg-indigo-600/50 border border-indigo-500/30 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              Review My Profile
            </button>
          </div>
        </div>

        {/* Decorative Grid Accent */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Bento Grid Stats Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Drives</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{getAppliedCount()}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shortlisted</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{getShortlistedCount()}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Status</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{getPendingCount()}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligible Drives</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{getEligibleJobsCount()}</h4>
          </div>
        </div>
      </div>

      {/* Main Dashboard Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Circulars & Notice board */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Recent Placement Circulars
            </h3>
            <button
              onClick={() => setTab("notices")}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              See All Notices
            </button>
          </div>

          {recentNotices.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">No announcements published recently.</p>
          ) : (
            <div className="space-y-4">
              {recentNotices.map((notice) => (
                <div
                  key={notice._id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-indigo-50/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-wider mb-2 ${
                        notice.priority === "High"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {notice.type} Drive
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{notice.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notice.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100/60 mt-3 pt-2 text-[10px] text-slate-400 font-medium">
                    <span>Published: {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : "Today"}</span>
                    <span className="text-slate-500 font-semibold">{notice.priority} Priority</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Interviews, Deadlines, & Quick Stats */}
        <div className="space-y-6">
          {/* Interview Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Upcoming Interviews
            </h3>

            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No scheduled slots</p>
                <p className="text-[11px] text-slate-500 mt-1">We'll notify you here when recruiter slots are allocated.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((a: any) => (
                  <div key={a._id} className="p-3.5 border border-emerald-100 rounded-xl bg-emerald-50/20">
                    <p className="text-xs font-bold text-slate-900">{a.jobDriveId?.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{a.jobDriveId?.companyId?.companyName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-2.5">
                      <Clock className="w-3.5 h-3.5" />
                      Slot: See Round tracking tab for schedules
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placement Status Card */}
          <div className="bg-gradient-to-b from-indigo-50 to-indigo-100 border border-indigo-200 rounded-3xl p-6 shadow-sm">
            <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Enrollment Status</p>
            <div className="flex items-center justify-between mt-2">
              <h4 className="text-lg font-bold text-slate-950">
                {student?.isFrozen ? "Frozen Profile" : "Active & Verified"}
              </h4>
              <span className={`h-2.5 w-2.5 rounded-full ${student?.isFrozen ? "bg-red-500" : "bg-emerald-500 animate-ping"}`} />
            </div>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {student?.isFrozen
                ? "Your profile is currently frozen. Submit a Support Desk request to unfreeze."
                : "Your profile details are locked for current recruiter assessments. If you require corrections, submit an unlock ticket."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
