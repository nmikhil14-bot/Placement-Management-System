import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, UserPlus, Sparkles } from "lucide-react";

interface RegisterProps {
  onToggleLogin: () => void;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function Register({ onToggleLogin, showNotification }: RegisterProps) {
  const { register } = useAuth();
  const [role, setRole] = useState<"student" | "recruiter">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Student Specifics
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("Computer Science");
  const [course, setCourse] = useState("B.Tech");
  const [college, setCollege] = useState("Institute of Science and Technology");
  const [graduationYear, setGraduationYear] = useState(2027);
  const [gender, setGender] = useState("Male");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showNotification("Please fill in all core fields.", "error");
      return;
    }

    const payload: any = { name, email, password, role };

    if (role === "student") {
      if (!rollNumber || !phoneNumber) {
        showNotification("Please provide your Roll Number and active Phone Number.", "error");
        return;
      }
      payload.rollNumber = rollNumber;
      payload.branch = branch;
      payload.course = course;
      payload.college = college;
      payload.graduationYear = Number(graduationYear);
      payload.gender = gender;
      payload.phoneNumber = phoneNumber;
    }

    setIsSubmitting(true);
    try {
      const res = await register(payload);
      if (res.success) {
        showNotification("Account created successfully! Welcome to the Placement Portal.", "success");
      } else {
        showNotification(res.error || "Registration process failed", "error");
      }
    } catch (err: any) {
      showNotification("Registration failed. Please check your internet or retry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
        <button
          onClick={onToggleLogin}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline mb-6 cursor-pointer"
          id="back-to-login-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </button>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Create Portal Account</h3>
            <p className="text-sm text-slate-500 mt-1">Register your profile to participate in active placement sessions.</p>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              role === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
            id="register-role-student"
          >
            I am a Student
          </button>
          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              role === "recruiter" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
            id="register-role-recruiter"
          >
            I am a Corporate Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Full Name</label>
              <input
                type="text"
                required
                placeholder="Alex Carter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Email Address</label>
              <input
                type="email"
                required
                placeholder={role === "student" ? "student@university.edu" : "recruiter@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Secure Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Student Specific Sub-Form */}
          {role === "student" && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                ACADEMIC PROFILE ENROLLMENT DETAILS
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">University Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="RA2311003010156"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 99887 76655"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Communication">Electronics & Comm</option>
                    <option value="Mechanical Engineering">Mechanical Eng</option>
                    <option value="Civil Engineering">Civil Eng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Degree Course</label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Graduation Year</label>
                  <input
                    type="number"
                    required
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={gender === "Male"}
                        onChange={() => setGender("Male")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={gender === "Female"}
                        onChange={() => setGender("Female")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Female
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">College / University Name</label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-400 cursor-pointer"
            id="register-submit-btn"
          >
            {isSubmitting ? "Creating Profile..." : "Register Profile"}
          </button>
        </form>

        <div className="border-t border-slate-100 mt-8 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have a profile?{" "}
            <button
              onClick={onToggleLogin}
              className="font-bold text-indigo-600 hover:underline inline cursor-pointer"
            >
              Sign In here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
