import React, { useState } from "react";
import { Student } from "../../types";
import { User, Phone, BookOpen, Briefcase, CheckCircle, ShieldAlert, Edit, Save, Plus, Trash2, FileText } from "lucide-react";

interface StudentProfileProps {
  student: Student | null;
  onUpdateProfile: (updates: Partial<Student>) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function StudentProfile({ student, onUpdateProfile, showNotification }: StudentProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("personal"); // personal, contact, academic, skills

  // Local states for editing
  const [firstName, setFirstName] = useState(student?.firstName || "");
  const [lastName, setLastName] = useState(student?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(student?.phoneNumber || "");
  const [personalEmail, setPersonalEmail] = useState(student?.personalEmail || "");
  const [linkedin, setLinkedin] = useState(student?.linkedin || "");
  const [github, setGithub] = useState(student?.github || "");
  const [hackerrank, setHackerrank] = useState(student?.hackerrank || "");
  
  // Skill list editing
  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState<string[]>(student?.skills || []);
  
  // Addresses editing
  const [currCity, setCurrCity] = useState(student?.address?.current?.city || "");
  const [currState, setCurrState] = useState(student?.address?.current?.state || "");
  const [currPincode, setCurrPincode] = useState(student?.address?.current?.pincode || "");
  const [currLine, setCurrLine] = useState(student?.address?.current?.addressLine || "");

  const [permCity, setPermCity] = useState(student?.address?.permanent?.city || "");
  const [permState, setPermState] = useState(student?.address?.permanent?.state || "");
  const [permPincode, setPermPincode] = useState(student?.address?.permanent?.pincode || "");
  const [permLine, setPermLine] = useState(student?.address?.permanent?.addressLine || "");

  // Parent Details editing
  const [fatherName, setFatherName] = useState(student?.parentDetails?.father?.name || "");
  const [fatherPhone, setFatherPhone] = useState(student?.parentDetails?.father?.phone || "");
  const [fatherOccupation, setFatherOccupation] = useState(student?.parentDetails?.father?.occupation || "");
  const [motherName, setMotherName] = useState(student?.parentDetails?.mother?.name || "");
  const [motherPhone, setMotherPhone] = useState(student?.parentDetails?.mother?.phone || "");

  const [resumeUrl, setResumeUrl] = useState(student?.resumeUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showNotification("Please upload a valid PDF document.", "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/upload/resume", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setResumeUrl(data.url);
        showNotification("Resume PDF uploaded successfully!", "success");
      } else {
        showNotification(data.error || "Failed to upload resume file.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("An error occurred during resume upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500 italic">No student profile data available.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (student.isFrozen) {
      showNotification("Your profile is frozen. Submit an unlock request first.", "error");
      return;
    }

    const updates: Partial<Student> = {
      firstName,
      lastName,
      phoneNumber,
      personalEmail,
      linkedin,
      github,
      hackerrank,
      skills,
      resumeUrl,
      address: {
        current: { city: currCity, state: currState, country: "India", pincode: currPincode, addressLine: currLine },
        permanent: { city: permCity, state: permState, country: "India", pincode: permPincode, addressLine: permLine }
      },
      parentDetails: {
        father: { name: fatherName, phone: fatherPhone, occupation: fatherOccupation },
        mother: { name: motherName, phone: motherPhone }
      }
    };

    try {
      await onUpdateProfile(updates);
      setIsEditing(false);
      showNotification("Profile details updated successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to save updates.", "error");
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="space-y-6" id="student-profile-view">
      {/* Upper Status Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-100">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{firstName} {lastName}</h2>
            <p className="text-xs font-semibold text-indigo-600 mt-1">Roll No: {student.rollNumber} • {student.branch}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                student.isVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}>
                {student.isVerified ? "Verified Account" : "Verification Pending"}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                student.isFrozen ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
              }`}>
                {student.isFrozen ? "Frozen Profile (Locked)" : "Active (Unlocked)"}
              </span>
            </div>
          </div>
        </div>

        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              id="profile-save-btn"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => {
                if (student.isFrozen) {
                  showNotification("Profile is frozen. You cannot make edits until unlocked.", "error");
                  return;
                }
                setIsEditing(true);
              }}
              disabled={student.isFrozen}
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer ${
                student.isFrozen
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
              id="profile-edit-btn"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Frozen Notice Alert */}
      {student.isFrozen && (
        <div className="p-4 border border-red-100 bg-red-50/40 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-red-800">Your profile metrics are frozen.</p>
            <p className="text-red-600 mt-1 leading-relaxed">
              To guarantee data consistency during recruiter screening, your profile has been frozen. If you require modifications (such as updating active backlogs, CGPA corrections, or uploading a new resume), please raise an unlock ticket under the **Support Desk** tab.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("personal")}
          className={`pb-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === "personal" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
        >
          Personal & Parents
        </button>
        <button
          onClick={() => setActiveSubTab("contact")}
          className={`pb-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === "contact" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
        >
          Contact & Addresses
        </button>
        <button
          onClick={() => setActiveSubTab("academic")}
          className={`pb-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === "academic" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
        >
          Academics & Mentor
        </button>
        <button
          onClick={() => setActiveSubTab("skills")}
          className={`pb-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === "skills" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
        >
          Skills & Documents
        </button>
      </div>

      {/* Inner Profile Panels */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        {/* PERSONAL & PARENTS TAB */}
        {activeSubTab === "personal" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                  <p className="text-sm font-semibold text-slate-800">{student.gender}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aadhaar Card Number</label>
                  <p className="text-sm font-semibold text-slate-800">{student.aadhaarNumber || "Provided & Encrypted"}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nationality</label>
                  <p className="text-sm font-semibold text-slate-800">{student.nationality}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Placement Cycle</label>
                  <p className="text-sm font-semibold text-slate-800">{student.placementCycle}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Parent / Guardian details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Father Info */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 mb-2">Father details</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Father's Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{fatherName || "Not configured"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Father's Phone</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={fatherPhone}
                          onChange={(e) => setFatherPhone(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{fatherPhone || "N/A"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mother Info */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 mb-2">Mother details</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Mother's Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{motherName || "Not configured"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Mother's Phone</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={motherPhone}
                          onChange={(e) => setMotherPhone(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 mt-1"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{motherPhone || "N/A"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT & ADDRESSES TAB */}
        {activeSubTab === "contact" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-600" />
                Contact Details & Links
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">University Email</label>
                  <p className="text-sm font-semibold text-slate-800">{student.email}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Personal Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{personalEmail || "N/A"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">LinkedIn URL</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  ) : (
                    <a href={linkedin} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline block truncate">
                      {linkedin || "Configure Link"}
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GitHub Profile</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  ) : (
                    <a href={github} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline block truncate">
                      {github || "Configure Link"}
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">HackerRank Profile</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={hackerrank}
                      onChange={(e) => setHackerrank(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  ) : (
                    <a href={hackerrank} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline block truncate">
                      {hackerrank || "Configure Link"}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Current address */}
                <div className="p-4 border border-slate-150 rounded-2xl">
                  <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">Current Address</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase font-black">Address Line</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={currLine}
                          onChange={(e) => setCurrLine(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-600 mt-1"
                        />
                      ) : (
                        <p className="text-xs text-slate-700 font-semibold mt-0.5">{currLine || "Configure current Address"}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-black">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currCity}
                            onChange={(e) => setCurrCity(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-600 mt-1"
                          />
                        ) : (
                          <p className="text-xs text-slate-700 font-semibold mt-0.5">{currCity || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-black">Pincode</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currPincode}
                            onChange={(e) => setCurrPincode(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-600 mt-1"
                          />
                        ) : (
                          <p className="text-xs text-slate-700 font-semibold mt-0.5">{currPincode || "N/A"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permanent address */}
                <div className="p-4 border border-slate-150 rounded-2xl">
                  <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">Permanent Address</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase font-black">Address Line</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={permLine}
                          onChange={(e) => setPermLine(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-600 mt-1"
                        />
                      ) : (
                        <p className="text-xs text-slate-700 font-semibold mt-0.5">{permLine || "Configure permanent Address"}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-black">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={permCity}
                            onChange={(e) => setPermCity(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-600 mt-1"
                          />
                        ) : (
                          <p className="text-xs text-slate-700 font-semibold mt-0.5">{permCity || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-black">Pincode</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={permPincode}
                            onChange={(e) => setPermPincode(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-600 mt-1"
                          />
                        ) : (
                          <p className="text-xs text-slate-700 font-semibold mt-0.5">{permPincode || "N/A"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMICS & MENTOR TAB */}
        {activeSubTab === "academic" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Verified Academic Performance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl text-center">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Cumulative CGPA</p>
                  <p className="text-3xl font-black text-indigo-950 mt-1">{student.cgpa}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">Verified via Controller of Exams</p>
                </div>

                <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl text-center">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Overall Attendance</p>
                  <p className="text-3xl font-black text-emerald-950 mt-1">{student.attendance}%</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">Threshold Requirement: 75%</p>
                </div>

                <div className="p-4 bg-amber-50/10 border border-amber-150 rounded-2xl text-center">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Active Backlogs</p>
                  <p className="text-3xl font-black text-amber-950 mt-1">{student.backlogs}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">Must maintain 0 for tier-1 drives</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Degree Program</label>
                <p className="text-sm font-semibold text-slate-800">{student.course} ({student.branch})</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">University / Institute</label>
                <p className="text-sm font-semibold text-slate-800">{student.college}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Passed out Year</label>
                <p className="text-sm font-semibold text-slate-800">{student.graduationYear}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Advisor / Advisor details</label>
                <p className="text-sm font-semibold text-slate-800">{student.advisor || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* SKILLS & PORTFOLIO DOCUMENTS TAB */}
        {activeSubTab === "skills" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Technical Skills & Focus Areas
              </h3>

              <div className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="Add technological skills (e.g. React, C++, AWS)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {skills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No skills added. Click Edit to customize your skillset.</p>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-indigo-400 hover:text-red-600 font-bold transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Official Placement Resume</h3>
              <div className="p-5 border border-slate-150 rounded-2xl bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Resume_Official_University_Verified.pdf</p>
                    <p className="text-[10px] text-slate-400 mt-1">Uploaded in secure cloud directory • PDF format under 5MB</p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-col gap-2">
                  {isEditing ? (
                    <div className="w-full sm:w-80 space-y-3">
                      {/* Drag and Drop/File Upload section */}
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-slate-50 p-4 rounded-xl cursor-pointer transition-colors text-center">
                        <FileText className={`w-8 h-8 text-indigo-500 mb-1 ${isUploading ? "animate-pulse" : ""}`} />
                        <span className="text-[10px] font-bold text-slate-700">
                          {isUploading ? "Uploading PDF..." : "Click to Upload Official PDF"}
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Files under 5MB only</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Link</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste cloud document resume URL..."
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 pl-11 pr-3 py-2 text-[10px] font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                  ) : resumeUrl ? (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      View Live Resume PDF
                    </a>
                  ) : (
                    <span className="text-xs text-red-500 font-bold italic">No resume link configured!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
