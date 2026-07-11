import React, { useState } from "react";
import { Student } from "../../types";
import { Search, UserCheck, UserX, Trash2, Shield, Plus, ToggleLeft, ToggleRight, Check } from "lucide-react";

interface AdminStudentsProps {
  students: Student[];
  onAddStudent: (student: Partial<Student>) => Promise<void>;
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function AdminStudents({ students, onAddStudent, onUpdateStudent, onDeleteStudent, showNotification }: AdminStudentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [verificationFilter, setVerificationFilter] = useState("All");

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for manual student creation
  const [rollNumber, setRollNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [branch, setBranch] = useState("Computer Science");
  const [cgpa, setCgpa] = useState(8.5);
  const [attendance, setAttendance] = useState(85);
  const [backlogs, setBacklogs] = useState(0);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber || !firstName || !lastName || !email) {
      showNotification("Please provide all required core student parameters.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddStudent({
        rollNumber,
        firstName,
        lastName,
        email,
        password,
        branch,
        course: "B.Tech",
        college: "Institute of Science and Technology",
        cgpa: Number(cgpa),
        attendance: Number(attendance),
        backlogs: Number(backlogs),
        graduationYear: 2027,
        gender: "Male"
      } as any);
      showNotification("Student enrolled successfully!", "success");
      // Reset form
      setRollNumber("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setCgpa(8.5);
      setAttendance(85);
      setBacklogs(0);
      setShowAddForm(false);
    } catch (err: any) {
      showNotification(err.message || "Failed to enroll student.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyToggle = async (student: Student) => {
    try {
      await onUpdateStudent(student._id, { isVerified: !student.isVerified });
      showNotification(
        `Student details ${!student.isVerified ? "Verified" : "Verification Cancelled"}.`,
        "success"
      );
    } catch (err: any) {
      showNotification(err.message || "Operation failed", "error");
    }
  };

  const handleFreezeToggle = async (student: Student) => {
    try {
      await onUpdateStudent(student._id, { isFrozen: !student.isFrozen });
      showNotification(
        `Student profile ${!student.isFrozen ? "Frozen (Locked)" : "Unfrozen (Unlocked)"}.`,
        "info"
      );
    } catch (err: any) {
      showNotification(err.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student account? This will wipe their profile and submitted applications from the database.")) {
      try {
        await onDeleteStudent(id);
        showNotification("Student account deleted.", "info");
      } catch (err: any) {
        showNotification(err.message || "Wipe failed", "error");
      }
    }
  };

  const filteredStudents = students.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = branchFilter === "All" || s.branch === branchFilter;
    
    let matchesVerify = true;
    if (verificationFilter === "Verified") matchesVerify = s.isVerified;
    else if (verificationFilter === "Unverified") matchesVerify = !s.isVerified;

    return matchesSearch && matchesBranch && matchesVerify;
  });

  return (
    <div className="space-y-6" id="admin-students-view">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Registry</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Verify credentials, toggle profile locks, or enroll new student accounts.</p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            id="enroll-student-btn"
          >
            <Plus className="w-4 h-4" />
            Enroll Student Manual
          </button>
        )}
      </div>

      {/* Manual Student enroll form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Enroll New University Student Manual
          </h3>

          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="RA2311003010156"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Harry"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Potter"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">University Email *</label>
                <input
                  type="email"
                  required
                  placeholder="hp0777@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Branch Choice</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1 cursor-pointer"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics & Communication">Electronics & Comm</option>
                  <option value="Mechanical Engineering">Mechanical Eng</option>
                  <option value="Civil Engineering">Civil Eng</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Cumulative CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  max="10"
                  min="0"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Attendance %</label>
                <input
                  type="number"
                  max="100"
                  min="0"
                  value={attendance}
                  onChange={(e) => setAttendance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Active Backlogs count</label>
                <input
                  type="number"
                  min="0"
                  value={backlogs}
                  onChange={(e) => setBacklogs(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3.5 border-t border-slate-100 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:bg-slate-400"
              >
                {isSubmitting ? "Enrolling..." : "Enroll Registry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student names, roll numbers, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics & Communication">ECE</option>
            <option value="Mechanical Engineering">Mech Eng</option>
            <option value="Civil Engineering">Civil Eng</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified Profile</option>
            <option value="Unverified">Pending approval</option>
          </select>
        </div>
      </div>

      {/* Registry student list table */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No enrolled student documents match current criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Branch & Degree</th>
                  <th className="px-6 py-4">CGPA / backlogs</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Profile state</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {filteredStudents.map((stud) => (
                  <tr key={stud._id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-slate-900 font-bold">{stud.firstName} {stud.lastName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Roll: {stud.rollNumber} • {stud.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {stud.course}
                      <p className="text-[10px] text-slate-400 mt-0.5">{stud.branch}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-800">{stud.cgpa} CGPA</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{stud.backlogs} Backlog{stud.backlogs !== 1 ? "s" : ""} • Attendance: {stud.attendance}%</p>
                    </td>

                    {/* Verification Approval toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleVerifyToggle(stud)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                          stud.isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                        id={`verify-toggle-${stud._id}`}
                      >
                        {stud.isVerified ? "Verified" : "Pending Approval"}
                      </button>
                    </td>

                    {/* Profile Freeze toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleFreezeToggle(stud)}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 cursor-pointer"
                        id={`freeze-toggle-${stud._id}`}
                        title={stud.isFrozen ? "Unlock student profile" : "Freeze student profile"}
                      >
                        {stud.isFrozen ? (
                          <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            Locked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">
                            Unlocked
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(stud._id)}
                        className="h-8 w-8 rounded-lg border border-slate-150 bg-white text-slate-400 hover:text-red-600 hover:bg-slate-50 inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Delete student document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminStudents;
