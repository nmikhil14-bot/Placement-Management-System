import React, { useState } from "react";
import { SupportRequest, Student, Company } from "../../types";
import { Send, FileText, CheckCircle, Clock, AlertOctagon, HelpCircle, QrCode, Scan } from "lucide-react";

interface StudentRequestsProps {
  student: Student | null;
  companies: Company[];
  requests: SupportRequest[];
  onSubmitRequest: (type: string, message: string) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

export function StudentRequests({ student, companies, requests, onSubmitRequest, showNotification, apiFetch }: StudentRequestsProps) {
  const [requestType, setRequestType] = useState("Profile Unlock");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Attendance check-in states
  const [activeCheckinMode, setActiveCheckinMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [roundName, setRoundName] = useState("Round 1 - Technical Written");
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showNotification("Please provide a message explaining your request.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRequest(requestType, message);
      setMessage("");
      showNotification("Support ticket submitted. Administrators will review shortly.", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to submit request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateCheckin = async () => {
    if (!selectedCompany) {
      showNotification("Please select the visiting company for check-in.", "error");
      return;
    }
    if (!student) return;

    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          rollNumber: student.rollNumber,
          companyId: selectedCompany,
          round: roundName,
          status: "Present",
          method: "QR"
        })
      });
      setCheckinSuccess(true);
      showNotification("Round Attendance Checked In Successfully via QR!", "success");
      setTimeout(() => {
        setCheckinSuccess(false);
        setActiveCheckinMode(false);
      }, 4000);
    } catch (err: any) {
      showNotification(err.message || "Attendance check-in failed", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Approved</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">Pending</span>;
    }
  };

  return (
    <div className="space-y-6" id="student-support-view">
      {/* Upper header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support Desk & Attendance QR</h2>
        <p className="text-sm text-slate-500 mt-1">Submit official modification requests (locks, CGPA, phone) and scan active round check-ins.</p>
      </div>

      {/* Grid of Support Forms vs Attendance Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Support Ticket Form (Left 7-columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              Submit Official Request Ticket
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Request / Change category
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="Profile Unlock">Profile Unlock / Change Resume</option>
                  <option value="Profile Edit">General Information Correction</option>
                  <option value="Wrong CGPA">Academics / Wrong CGPA Correction</option>
                  <option value="Wrong Phone Number">Wrong Phone / Whatsapp Correction</option>
                  <option value="Leave Request">Leave Request (Skip active rounds)</option>
                  <option value="Placement Opt-Out">Placement Opt-Out (Leave placement cycle)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Explanation & Proof Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a detailed explanation. (e.g. My Sem-6 CGPA is updated to 9.2 but portal shows 9.1. Verified proof attached in drive link...)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-400 cursor-pointer"
                id="support-ticket-submit"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Submitting Ticket..." : "Submit Support Ticket"}
              </button>
            </form>
          </div>

          {/* Ticket List tracking */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              My Request Tickets Status
            </h3>

            {requests.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">You have not submitted any support tickets.</p>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/40">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{req.type}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Today"}</p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 bg-white p-2.5 border border-slate-100 rounded-lg">{req.message}</p>

                    {req.adminComment && (
                      <div className="mt-3 p-3 bg-indigo-50/15 border border-indigo-100 rounded-lg text-xs">
                        <p className="font-bold text-indigo-950 text-[10px] uppercase">Coordinating Officer Comments:</p>
                        <p className="text-indigo-800 mt-0.5">{req.adminComment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QR Scan Simulation (Right 5-columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3 mb-4 flex items-center gap-1.5 relative z-10">
              <QrCode className="w-5 h-5 text-indigo-400" />
              On-Campus QR Attendance Desk
            </h3>

            {!activeCheckinMode ? (
              <div className="text-center py-8 relative z-10">
                <div className="h-16 w-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-300">
                  <Scan className="w-8 h-8 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-100">Live Attendance Check-In</p>
                <p className="text-[11px] text-indigo-200 mt-1 px-4 leading-relaxed">
                  Are you currently seated in the placement cell or waiting hall for an active recruiter round? Enable scanner to check-in your attendance.
                </p>
                <button
                  onClick={() => setActiveCheckinMode(true)}
                  className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Enable QR Scanner
                </button>
              </div>
            ) : checkinSuccess ? (
              <div className="text-center py-8 relative z-10">
                <div className="h-14 w-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-emerald-400">Attendance Confirmed!</p>
                <p className="text-[11px] text-slate-300 mt-1 px-4">
                  Your attendance for **{roundName}** has been securely logged on our server. Admin dashboard updated.
                </p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                <p className="text-xs text-indigo-200 italic leading-relaxed mb-2">
                  *Please select the recruitment drive you are currently attending on campus to simulate a QR Code scan check-in.*
                </p>
                
                <div>
                  <label className="block text-[10px] text-indigo-300 uppercase font-bold mb-1">Company Drive</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 text-white px-3 py-2 text-xs font-medium focus:outline-none"
                  >
                    <option value="" className="text-slate-900">-- Choose Visiting Corporate --</option>
                    {companies.map((co) => (
                      <option key={co._id} value={co._id} className="text-slate-900">{co.companyName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-indigo-300 uppercase font-bold mb-1">Placement Round Name</label>
                  <select
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 text-white px-3 py-2 text-xs font-medium focus:outline-none"
                  >
                    <option value="Round 1 - Technical Written Assessment" className="text-slate-900">Round 1 - Written Code</option>
                    <option value="Round 2 - Group Discussion (GD)" className="text-slate-900">Round 2 - Group Discussion</option>
                    <option value="Round 3 - Technical Interview (1 on 1)" className="text-slate-900">Round 3 - Tech Interview</option>
                    <option value="Round 4 - HR Validation Round" className="text-slate-900">Round 4 - HR Validation</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSimulateCheckin}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Scan & Check-In
                  </button>
                  <button
                    onClick={() => setActiveCheckinMode(false)}
                    className="py-2 px-3 bg-white/10 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Decorative BG Grid */}
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />
          </div>
        </div>

      </div>
    </div>
  );
}
