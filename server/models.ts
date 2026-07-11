import mongoose, { Schema, Document } from "mongoose";

// --- USER MODEL ---
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "student" | "admin" | "recruiter";
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin", "recruiter"], required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


// --- STUDENT MODEL ---
export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  rollNumber: string;
  firstName: string;
  lastName: string;
  branch: string;
  course: string;
  college: string;
  graduationYear: number;
  placementCycle: string;
  studentStatus: string;
  gender: string;
  birthday?: Date;
  nationality: string;
  aadhaarNumber?: string;
  email: string;
  phoneNumber: string;
  personalEmail?: string;
  linkedin?: string;
  github?: string;
  hackerrank?: string;
  cgpa: number;
  backlogs: number;
  attendance: number;
  skills: string[];
  resumeUrl?: string;
  isVerified: boolean;
  isFrozen: boolean;
  mentor?: string;
  advisor?: string;
  address?: {
    current?: { city?: string; state?: string; country?: string; pincode?: string; addressLine?: string };
    permanent?: { city?: string; state?: string; country?: string; pincode?: string; addressLine?: string };
  };
  parentDetails?: {
    father?: { name?: string; email?: string; phone?: string; occupation?: string; company?: string; officeAddress?: string };
    mother?: { name?: string; email?: string; phone?: string; occupation?: string; officeAddress?: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

export const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    branch: { type: String, required: true },
    course: { type: String, required: true },
    college: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    placementCycle: { type: String, default: "2026-2027 Cycle" },
    studentStatus: { type: String, default: "Eligible" },
    gender: { type: String, required: true },
    birthday: { type: Date },
    nationality: { type: String, default: "Indian" },
    aadhaarNumber: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true },
    personalEmail: { type: String },
    linkedin: { type: String },
    github: { type: String },
    hackerrank: { type: String },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    backlogs: { type: Number, default: 0 },
    attendance: { type: Number, default: 100 },
    skills: [{ type: String }],
    resumeUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    isFrozen: { type: Boolean, default: false },
    mentor: { type: String },
    advisor: { type: String },
    address: {
      current: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String },
        addressLine: { type: String }
      },
      permanent: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String },
        addressLine: { type: String }
      }
    },
    parentDetails: {
      father: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        occupation: { type: String },
        company: { type: String },
        officeAddress: { type: String }
      },
      mother: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        occupation: { type: String },
        officeAddress: { type: String }
      }
    }
  },
  { timestamps: true }
);

export const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);


// --- COMPANY MODEL ---
export interface ICompany extends Document {
  companyName: string;
  logo?: string;
  description: string;
  website?: string;
  location: string;
  industry: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  type: ("Internship" | "Full-time" | "PPO" | "Hybrid")[];
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = new Schema<ICompany>(
  {
    companyName: { type: String, required: true },
    logo: { type: String },
    description: { type: String, required: true },
    website: { type: String },
    location: { type: String, required: true },
    industry: { type: String, required: true },
    hrName: { type: String },
    hrEmail: { type: String },
    hrPhone: { type: String },
    type: [{ type: String, enum: ["Internship", "Full-time", "PPO", "Hybrid"] }],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  { timestamps: true }
);

export const Company = mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);


// --- JOBDRIVE MODEL ---
export interface IJobDrive extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  salary: number; // in LPA
  stipend?: number; // per month (for Internships)
  eligibility: {
    branches: string[];
    cgpaCutoff: number;
    backlogsAllowed: number;
    graduationYear: number[];
  };
  skills: string[];
  applyDeadline: Date;
  visitDate?: Date;
  interviewDate?: Date;
  venue?: string;
  status: "Draft" | "Published" | "Closed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export const JobDriveSchema = new Schema<IJobDrive>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: Number, required: true },
    stipend: { type: Number },
    eligibility: {
      branches: [{ type: String }],
      cgpaCutoff: { type: Number, default: 0 },
      backlogsAllowed: { type: Number, default: 0 },
      graduationYear: [{ type: Number }]
    },
    skills: [{ type: String }],
    applyDeadline: { type: Date, required: true },
    visitDate: { type: Date },
    interviewDate: { type: Date },
    venue: { type: String, default: "Campus Placement Cell / Virtual" },
    status: { type: String, enum: ["Draft", "Published", "Closed", "Cancelled"], default: "Published" }
  },
  { timestamps: true }
);

export const JobDrive = mongoose.models.JobDrive || mongoose.model<IJobDrive>("JobDrive", JobDriveSchema);


// --- APPLICATION MODEL ---
export interface IApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  jobDriveId: mongoose.Types.ObjectId;
  status: "Applied" | "Shortlisted" | "Rejected" | "Assessment" | "GD" | "Interview" | "HR" | "Offer" | "Joined";
  appliedAt: Date;
  remarks?: string;
  updatedAt: Date;
}

export const ApplicationSchema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    jobDriveId: { type: Schema.Types.ObjectId, ref: "JobDrive", required: true },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Assessment", "GD", "Interview", "HR", "Offer", "Joined"],
      default: "Applied"
    },
    appliedAt: { type: Date, default: Date.now },
    remarks: { type: String }
  },
  { timestamps: true }
);

// Prevent duplicate applications by same student for same job drive
ApplicationSchema.index({ studentId: 1, jobDriveId: 1 }, { unique: true });

export const Application = mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);


// --- ROUND MODEL ---
export interface IRound extends Document {
  applicationId: mongoose.Types.ObjectId;
  roundName: string;
  roundStatus: "Pending" | "Cleared" | "Failed";
  remarks?: string;
  date: Date;
}

export const RoundSchema = new Schema<IRound>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    roundName: { type: String, required: true },
    roundStatus: { type: String, enum: ["Pending", "Cleared", "Failed"], default: "Pending" },
    remarks: { type: String },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Round = mongoose.models.Round || mongoose.model<IRound>("Round", RoundSchema);


// --- NOTICE MODEL ---
export interface INotice extends Document {
  title: string;
  content: string;
  type: "General" | "Company" | "Exam" | "Placement" | "Reminder" | "Announcement";
  priority: "High" | "Medium" | "Low";
  createdBy: mongoose.Types.ObjectId;
  scheduleDate?: Date;
  isPublished: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["General", "Company", "Exam", "Placement", "Reminder", "Announcement"], required: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduleDate: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: true },
    attachments: [{ type: String }]
  },
  { timestamps: true }
);

export const Notice = mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);


// --- REQUEST MODEL ---
export interface IRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  type: "Profile Unlock" | "Profile Edit" | "Wrong CGPA" | "Wrong Phone Number" | "Leave Request" | "Placement Opt-Out";
  message: string;
  status: "Pending" | "Approved" | "Rejected";
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RequestSchema = new Schema<IRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    type: {
      type: String,
      enum: ["Profile Unlock", "Profile Edit", "Wrong CGPA", "Wrong Phone Number", "Leave Request", "Placement Opt-Out"],
      required: true
    },
    message: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    adminComment: { type: String }
  },
  { timestamps: true }
);

export const RequestModel = mongoose.models.Request || mongoose.model<IRequest>("Request", RequestSchema);


// --- ATTENDANCE MODEL ---
export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  round: string;
  date: Date;
  status: "Present" | "Absent";
  method: "QR" | "RFID" | "Manual";
}

export const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    round: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["Present", "Absent"], required: true },
    method: { type: String, enum: ["QR", "RFID", "Manual"], default: "Manual" }
  },
  { timestamps: true }
);

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);


// --- OFFER MODEL ---
export interface IOffer extends Document {
  studentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  jobDriveId: mongoose.Types.ObjectId;
  package: number; // LPA
  offerDate: Date;
  status: "Accepted" | "Declined" | "Pending";
  createdAt: Date;
}

export const OfferSchema = new Schema<IOffer>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    jobDriveId: { type: Schema.Types.ObjectId, ref: "JobDrive", required: true },
    package: { type: Number, required: true },
    offerDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Accepted", "Declined", "Pending"], default: "Pending" }
  },
  { timestamps: true }
);

export const Offer = mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);
