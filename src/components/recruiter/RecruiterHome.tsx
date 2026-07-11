import React from "react";
import { JobDrive, Application } from "../../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Briefcase, Users, CheckCircle, FileCheck, ClipboardList, Info } from "lucide-react";

interface RecruiterHomeProps {
  jobs: JobDrive[];
  applications: Application[];
  setTab: (tab: string) => void;
}

export function RecruiterHome({ jobs, applications, setTab }: RecruiterHomeProps) {
  const activeJobsCount = jobs.filter((j) => j.status === "Published").length;
  const applicantsCount = applications.length;
  const hiredCount = applications.filter((a) => a.status === "Offer" || a.status === "Joined").length;
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted" || a.status === "Interview").length;

  // Chart data preparation: status distribution
  const statusCounts = {
    Applied: 0,
    Assessment: 0,
    Shortlisted: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0
  };

  applications.forEach((a) => {
    if (a.status in statusCounts) {
      statusCounts[a.status as keyof typeof statusCounts] += 1;
    }
  });

  const chartData = [
    { name: "Screening", value: statusCounts.Applied, color: "#6366f1" },
    { name: "Assessment", value: statusCounts.Assessment, color: "#3b82f6" },
    { name: "Shortlisted", value: statusCounts.Shortlisted, color: "#06b6d4" },
    { name: "Interviewing", value: statusCounts.Interview, color: "#10b981" },
    { name: "Offers", value: statusCounts.Offer, color: "#10b981" },
    { name: "Rejected", value: statusCounts.Rejected, color: "#f43f5e" }
  ];

  return (
    <div className="space-y-8" id="recruiter-home-view">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full">
            RECRUITMENT PANEL ACTIVE
          </span>
          <h2 className="text-3xl font-bold tracking-tight mt-3 text-slate-100">Welcome back, Partner Recruiter!</h2>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Manage your campus recruitment pipeline. Edit active drive requirements, screen incoming student applications, schedule written assessments, and issue job offers.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setTab("jobs")}
              className="px-5 py-2.5 bg-white text-indigo-950 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              Post a New Drive
            </button>
            <button
              onClick={() => setTab("applicants")}
              className="px-5 py-2.5 bg-indigo-600/50 border border-indigo-500/30 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              Evaluate Applicants
            </button>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Job Drives</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{activeJobsCount}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{applicantsCount}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shortlisted Candidates</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{shortlistedCount}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Issued</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{hiredCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Analytics Funnel Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Recruitment Funnel Metrics Breakdown
          </h3>

          <div className="h-80 w-full text-xs font-bold">
            {applicantsCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
                <Info className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                No pipeline candidates recorded yet. Publish job drives to receive applications.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(99,102,241,0.03)" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Evaluation Guidelines Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-2">
            <Info className="w-4 h-4 text-indigo-600" />
            University Relations Tips
          </h3>

          <div className="space-y-4 text-xs font-medium text-slate-600">
            <div className="p-3 border border-indigo-150 bg-indigo-50/15 rounded-xl">
              <p className="font-bold text-indigo-950 mb-1">1. Conduct CGPA Screenings</p>
              <p className="leading-relaxed">Keep job eligibility requirements updated in the Drives tab. Students below cutoff are automatically barred from applying.</p>
            </div>

            <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl">
              <p className="font-bold text-slate-800 mb-1">2. Attendance Logs Enabled</p>
              <p className="leading-relaxed">Students can check in to active halls via cellular QR scans. You can check who is present directly in the applicant panels.</p>
            </div>

            <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl">
              <p className="font-bold text-slate-800 mb-1">3. Update Milestones Fast</p>
              <p className="leading-relaxed">Update candidate status (Applied, Interview, Offer, Reject) immediately to keep students informed in real time.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
