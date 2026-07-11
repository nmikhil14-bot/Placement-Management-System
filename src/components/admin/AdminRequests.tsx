import React, { useState } from "react";
import { SupportRequest, Student } from "../../types";
import { Search, CheckCircle, XCircle, Send, ShieldAlert, ArrowRight, BookOpen, Phone } from "lucide-react";

interface AdminRequestsProps {
  requests: SupportRequest[];
  onUpdateStatus: (id: string, status: "Approved" | "Rejected", adminComment: string, extraUpdates?: any) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function AdminRequests({ requests, onUpdateStatus, showNotification }: AdminRequestsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Ticket processing state
  const [processingTicket, setProcessingTicket] = useState<SupportRequest | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Extra parameters if resolving Wrong CGPA or Phone
  const [newCgpa, setNewCgpa] = useState<number | "">("");
  const [newPhone, setNewPhone] = useState("");

  const handleProcessClick = (req: SupportRequest) => {
    setProcessingTicket(req);
    setAdminComment("");
    setNewCgpa("");
    setNewPhone("");

    // Prefill if CGPA or Phone
    const student = req.studentId as any;
    if (req.type === "Wrong CGPA" && student) {
      setNewCgpa(student.cgpa || 8.5);
    }
    if (req.type === "Wrong Phone Number" && student) {
      setNewPhone(student.phoneNumber || "");
    }
  };

  const handleResolveSubmit = async (status: "Approved" | "Rejected") => {
    if (!processingTicket) return;
    if (!adminComment.trim()) {
      showNotification("Please provide admin feedback comments before resolving.", "error");
      return;
    }

    const extraUpdates: any = {};
    if (status === "Approved") {
      // 1. If profile unlock, unfreeze
      if (processingTicket.type === "Profile Unlock") {
        extraUpdates.isFrozen = false;
      }
      // 2. If wrong CGPA
      if (processingTicket.type === "Wrong CGPA" && newCgpa !== "") {
        extraUpdates.cgpa = Number(newCgpa);
      }
      // 3. If wrong Phone
      if (processingTicket.type === "Wrong Phone Number" && newPhone) {
        extraUpdates.phoneNumber = newPhone;
      }
    }

    setIsSaving(true);
    try {
      await onUpdateStatus(processingTicket._id, status, adminComment, extraUpdates);
      setProcessingTicket(null);
      showNotification(`Ticket resolved: Marked as ${status}`, "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to resolve support ticket", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRequests = requests.filter((req: any) => {
    const student = req.studentId || {};
    const studentName = `${student.firstName || ""} ${student.lastName || ""}`;
    const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.rollNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="admin-requests-view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support Desk Management</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Moderate incoming student requests, unlock profiles, and adjust wrong academics parameters.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by student name, roll number, request types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Tickets</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests lists */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No student support tickets match the current selection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req: any) => {
            const student = req.studentId || {};
            const studentName = `${student.firstName || "University"} ${student.lastName || "Student"}`;

            return (
              <div
                key={req._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase rounded-md border border-indigo-100">
                      {req.type}
                    </span>
                    
                    {req.status === "Pending" ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase rounded">Pending</span>
                    ) : req.status === "Approved" ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase rounded">Approved</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold uppercase rounded">Rejected</span>
                    )}

                    <span className="text-slate-400 text-[11px] font-semibold">
                      Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Today"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {studentName} <span className="text-xs text-slate-400 font-medium">(Roll No: {student.rollNumber || "N/A"})</span>
                    </h4>
                    <p className="text-slate-600 text-xs mt-2 bg-slate-50 border border-slate-100 p-3 rounded-xl whitespace-pre-wrap leading-relaxed">
                      {req.message}
                    </p>
                  </div>

                  {req.adminComment && (
                    <div className="p-3 bg-indigo-50/10 border border-indigo-100 rounded-xl text-xs font-semibold">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Admin Resolution Feedback:</p>
                      <p className="text-indigo-800 mt-1">{req.adminComment}</p>
                    </div>
                  )}
                </div>

                {/* Resolution trigger */}
                {req.status === "Pending" && (
                  <button
                    onClick={() => handleProcessClick(req)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow inline-flex items-center gap-1 cursor-pointer transition-colors"
                    id={`resolve-btn-${req._id}`}
                  >
                    Resolve ticket
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Support Ticket Resolution dialog modal */}
      {processingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl">
            <button
              onClick={() => setProcessingTicket(null)}
              className="absolute right-6 top-6 h-8 w-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-1">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              Resolve Student Support Ticket
            </h3>

            <div className="space-y-4 mb-6 text-xs bg-slate-50 p-4 border border-slate-150 rounded-2xl">
              <p className="font-bold text-slate-800">Ticket Type: {processingTicket.type}</p>
              <p className="text-slate-500 font-medium">By student: {(processingTicket.studentId as any)?.firstName} (Roll: {(processingTicket.studentId as any)?.rollNumber})</p>
              <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-100 mt-2">"{processingTicket.message}"</p>
            </div>

            {/* If ticket type matches academic or phone correction, show direct adjustments inline */}
            {processingTicket.type === "Wrong CGPA" && (
              <div className="mb-5 p-4 border border-indigo-150 bg-indigo-50/15 rounded-xl space-y-3">
                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  DIRECT ACADEMIC DATA REVISION (UPON APPROVAL)
                </p>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Corrected CGPA Score</label>
                  <input
                    type="number"
                    step="0.01"
                    max="10"
                    min="0"
                    value={newCgpa}
                    onChange={(e) => setNewCgpa(e.target.value === "" ? "" : Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
            )}

            {processingTicket.type === "Wrong Phone Number" && (
              <div className="mb-5 p-4 border border-indigo-150 bg-indigo-50/15 rounded-xl space-y-3">
                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  DIRECT CONTACT DATA REVISION (UPON APPROVAL)
                </p>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Corrected Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
            )}

            {processingTicket.type === "Profile Unlock" && (
              <p className="text-[11px] text-slate-500 font-semibold mb-4 italic">
                *Note: Approving this "Profile Unlock" request will automatically unlock (unfreeze) this student's profile state on the database.*
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Administrator Resolution Comments *</label>
                <textarea
                  required
                  placeholder="Provide resolution remarks (e.g. Verified with Exam Controller. CGPA updated to 9.2. Account unlocked...)"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs bg-slate-50 focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProcessingTicket(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleResolveSubmit("Rejected")}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleResolveSubmit("Approved")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Approve & Apply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminRequests;
