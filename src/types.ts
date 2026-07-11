export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "student" | "admin" | "recruiter";
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  _id: string;
  userId: string | User;
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
  birthday?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  _id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface JobDrive {
  id: string;
  _id: string;
  companyId: string | Company;
  title: string;
  description: string;
  salary: number; // LPA
  stipend?: number; // stipend/month
  eligibility: {
    branches: string[];
    cgpaCutoff: number;
    backlogsAllowed: number;
    graduationYear: number[];
  };
  skills: string[];
  applyDeadline: string;
  visitDate?: string;
  interviewDate?: string;
  venue?: string;
  status: "Draft" | "Published" | "Closed" | "Cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  _id: string;
  studentId: string | Student;
  jobDriveId: string | JobDrive;
  status: "Applied" | "Shortlisted" | "Rejected" | "Assessment" | "GD" | "Interview" | "HR" | "Offer" | "Joined";
  appliedAt: string;
  remarks?: string;
  updatedAt?: string;
}

export interface Notice {
  id: string;
  _id: string;
  title: string;
  content: string;
  type: "General" | "Company" | "Exam" | "Placement" | "Reminder" | "Announcement";
  priority: "High" | "Medium" | "Low";
  createdBy: string | User;
  scheduleDate?: string;
  isPublished: boolean;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportRequest {
  id: string;
  _id: string;
  studentId: string | Student;
  type: "Profile Unlock" | "Profile Edit" | "Wrong CGPA" | "Wrong Phone Number" | "Leave Request" | "Placement Opt-Out";
  message: string;
  status: "Pending" | "Approved" | "Rejected";
  adminComment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  _id: string;
  studentId: string | Student;
  companyId: string | Company;
  round: string;
  date: string;
  status: "Present" | "Absent";
  method: "QR" | "RFID" | "Manual";
  createdAt?: string;
}

export interface Offer {
  id: string;
  _id: string;
  studentId: string | Student;
  companyId: string | Company;
  jobDriveId: string | JobDrive;
  package: number;
  offerDate: string;
  status: "Accepted" | "Declined" | "Pending";
  createdAt?: string;
}

export interface DashboardStats {
  totalStudents: number;
  eligibleStudents: number;
  registeredCompanies: number;
  activeDrives: number;
  totalApplications: number;
  offersCount: number;
  acceptedOffersCount: number;
  placementRate: number;
  interviewsToday: number;
}
