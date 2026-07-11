import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import bcrypt from "bcryptjs";
import fs from "fs";
import multer from "multer";
import { connectDB } from "./server/db";
import {
  User,
  Student,
  Company,
  JobDrive,
  Application,
  Round,
  Notice,
  RequestModel,
  Attendance,
  Offer
} from "./server/models";
import {
  authenticateToken,
  authorizeRoles,
  generateToken,
  AuthenticatedRequest
} from "./server/auth";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- CONFIGURE FILE UPLOAD DIRECTORY (MULTER) ---
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF format documents are permitted on the roster.") as any, false);
    }
  }
});

// Resume PDF Upload Route
app.post("/api/upload/resume", upload.single("resume"), (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was attached" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process resume upload" });
  }
});

// --- CONNECT DATABASE ---
// The database is connected before the server starts so deployment failures are visible early.

// ==========================================
// A. AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/register
app.post("/api/auth/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, rollNumber, branch, course, college, graduationYear, gender, phoneNumber } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "Name, email, password, and role are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email is already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: role === "student" ? false : true // Admins/recruiters default verified for mock ease
    });

    const savedUser = await newUser.save();

    // If student, create Student Profile
    if (role === "student") {
      if (!rollNumber || !branch || !course || !college || !graduationYear || !gender || !phoneNumber) {
        // Delete user if student profile details are missing
        await User.findByIdAndDelete(savedUser._id);
        res.status(400).json({ error: "Student roll number, branch, course, college, graduation year, gender, and phone number are required" });
        return;
      }

      const existingRoll = await Student.findOne({ rollNumber });
      if (existingRoll) {
        await User.findByIdAndDelete(savedUser._id);
        res.status(400).json({ error: "Roll number is already registered" });
        return;
      }

      const newStudent = new Student({
        userId: savedUser._id,
        rollNumber,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "Student",
        branch,
        course,
        college,
        graduationYear,
        email,
        phoneNumber,
        cgpa: 7.0, // Default start CGPA
        backlogs: 0,
        attendance: 100,
        skills: [],
        isVerified: false,
        isFrozen: false
      });

      await newStudent.save();
    }

    // Generate token
    const token = generateToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
      name: savedUser.name
    });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        isVerified: savedUser.isVerified
      }
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Server registration failed: " + error.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Fetch student data if user is a student
    let studentData = null;
    if (user.role === "student") {
      studentData = await Student.findOne({ userId: user._id });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      student: studentData
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login process failed: " + error.message });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req: Request, res: Response) => {
  res.json({ message: "Logout successful" });
});

// GET /api/auth/verify
app.get("/api/auth/verify", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    let studentData = null;
    if (user.role === "student") {
      studentData = await Student.findOne({ userId: user._id });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      student: studentData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// B. STUDENTS ENDPOINTS
// ==========================================

// GET /api/students (Admin)
app.get("/api/students", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const students = await Student.find().populate("userId", "name email role isVerified");
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/students/:id (Student profile - supports User ID or Student Profile ID)
app.get("/api/students/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // A student can only view their own profile, unless they are admin or recruiter
    if (req.user?.role === "student") {
      const selfStudent = await Student.findOne({ userId: req.user.userId });
      if (!selfStudent || (selfStudent._id.toString() !== id && selfStudent.userId.toString() !== id)) {
        res.status(403).json({ error: "Forbidden: You can only access your own profile" });
        return;
      }
    }

    let student = await Student.findById(id).populate("userId", "name email role isVerified");
    if (!student) {
      // Fallback search by userId
      student = await Student.findOne({ userId: id }).populate("userId", "name email role isVerified");
    }

    if (!student) {
      res.status(404).json({ error: "Student profile not found" });
      return;
    }

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/students/:id (Update student details)
app.put("/api/students/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Guard: Students can only update their own profile, and only if not frozen
    if (req.user?.role === "student") {
      const selfStudent = await Student.findOne({ userId: req.user.userId });
      if (!selfStudent || (selfStudent._id.toString() !== id && selfStudent.userId.toString() !== id)) {
        res.status(403).json({ error: "Forbidden: You can only edit your own profile" });
        return;
      }

      if (selfStudent.isFrozen) {
        res.status(400).json({ error: "Your profile is frozen. Create an unlock request to make updates." });
        return;
      }
    }

    let student = await Student.findById(id);
    if (!student) {
      student = await Student.findOne({ userId: id });
    }

    if (!student) {
      res.status(404).json({ error: "Student profile not found" });
      return;
    }

    // Update fields (prevent changing critical fields by students if desired, but we let them edit requested fields)
    const updates = req.body;
    
    // Prevent students from manually toggling verification, frozen status, or core academics direct bypass unless admin
    if (req.user?.role !== "admin") {
      delete updates.isVerified;
      delete updates.isFrozen;
      delete updates.studentStatus;
      delete updates.userId;
      // Admin request needed for CGPA corrections
      if (updates.cgpa !== undefined && updates.cgpa !== student.cgpa) {
        delete updates.cgpa;
      }
    }

    Object.assign(student, updates);
    const updatedStudent = await student.save();

    // Update user name as well if changed
    if (updates.firstName || updates.lastName) {
      const newName = `${updates.firstName || student.firstName} ${updates.lastName || student.lastName}`;
      await User.findByIdAndUpdate(student.userId, { name: newName });
    }

    res.json({ message: "Profile updated successfully", student: updatedStudent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/students/:id/applications
app.get("/api/students/:id/applications", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let studentId = id;

    // Check if ID is User ID, convert to Student ID
    const student = await Student.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    studentId = student._id.toString();

    if (req.user?.role === "student" && student.userId.toString() !== req.user.userId) {
      res.status(403).json({ error: "Unauthorized access" });
      return;
    }

    const applications = await Application.find({ studentId })
      .populate({
        path: "jobDriveId",
        populate: { path: "companyId" }
      });
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/students/:id/offers
app.get("/api/students/:id/offers", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const offers = await Offer.find({ studentId: student._id }).populate("companyId").populate("jobDriveId");
    res.json(offers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/students/:id/freeze (Admin)
app.put("/api/students/:id/freeze", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isFrozen } = req.body;

    const student = await Student.findOneAndUpdate(
      { $or: [{ _id: id }, { userId: id }] },
      { isFrozen },
      { new: true }
    );

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res.json({ message: `Student profile ${isFrozen ? "frozen" : "unfrozen"} successfully`, student });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/students/:id/verify (Admin)
app.put("/api/students/:id/verify", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const student = await Student.findOneAndUpdate(
      { $or: [{ _id: id }, { userId: id }] },
      { isVerified },
      { new: true }
    );

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // Also verify User account
    await User.findByIdAndUpdate(student.userId, { isVerified });

    res.json({ message: `Student verification status updated`, student });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// C. COMPANIES ENDPOINTS
// ==========================================

// GET /api/companies (All authenticated users)
app.get("/api/companies", authenticateToken, async (req: Request, res: Response) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recruiter/company (Fetch recruiter's assigned company)
app.get("/api/recruiter/company", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findOne({ hrEmail: req.user?.email });
    if (!company) {
      res.status(404).json({ error: "No registered company matches this recruiter's HR email." });
      return;
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/:id/applications (Fetch all applications for a company)
app.get("/api/companies/:id/applications", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await JobDrive.find({ companyId: req.params.id });
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ jobDriveId: { $in: jobIds } })
      .populate("studentId")
      .populate({
        path: "jobDriveId",
        populate: { path: "companyId" }
      });
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/companies (Admin / Recruiter)
app.post("/api/companies", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response) => {
  try {
    const newCompany = new Company(req.body);
    const saved = await newCompany.save();
    res.status(201).json({ message: "Company added successfully", company: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/:id
app.get("/api/companies/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/companies/:id (Admin / Recruiter)
app.put("/api/companies/:id", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    res.json({ message: "Company updated successfully", company: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/companies/:id (Admin)
app.delete("/api/companies/:id", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Company not found" });
      return;
    }
    // Delete any job drives & offers linked to it to clean up
    await JobDrive.deleteMany({ companyId: req.params.id });
    res.json({ message: "Company and associated job drives deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/:id/jobs
app.get("/api/companies/:id/jobs", authenticateToken, async (req: Request, res: Response) => {
  try {
    const jobs = await JobDrive.find({ companyId: req.params.id });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// D. JOB DRIVES ENDPOINTS
// ==========================================

// GET /api/jobs (All authenticated)
app.get("/api/jobs", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query: any = {};
    
    // Students should only see Published, Closed, or Cancelled (not Drafts)
    if (req.user?.role === "student") {
      query.status = { $ne: "Draft" };
    }

    const drives = await JobDrive.find(query).populate("companyId");
    res.json(drives);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs (Admin / Recruiter)
app.post("/api/jobs", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response) => {
  try {
    const newDrive = new JobDrive(req.body);
    const saved = await newDrive.save();
    res.status(201).json({ message: "Job drive created successfully", jobDrive: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id
app.get("/api/jobs/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const drive = await JobDrive.findById(req.params.id).populate("companyId");
    if (!drive) {
      res.status(404).json({ error: "Job drive not found" });
      return;
    }
    res.json(drive);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/jobs/:id (Admin / Recruiter)
app.put("/api/jobs/:id", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await JobDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ error: "Job drive not found" });
      return;
    }
    res.json({ message: "Job drive updated successfully", jobDrive: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/jobs/:id (Admin / Recruiter)
app.delete("/api/jobs/:id", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await JobDrive.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Job drive not found" });
      return;
    }
    await Application.deleteMany({ jobDriveId: req.params.id });
    res.json({ message: "Job drive deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs/:id/publish (Admin / Recruiter)
app.post("/api/jobs/:id/publish", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response): Promise<void> => {
  try {
    const drive = await JobDrive.findByIdAndUpdate(req.params.id, { status: "Published" }, { new: true });
    if (!drive) {
      res.status(404).json({ error: "Job drive not found" });
      return;
    }
    res.json({ message: "Job drive published successfully", jobDrive: drive });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs/:id/close (Admin / Recruiter)
app.post("/api/jobs/:id/close", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response): Promise<void> => {
  try {
    const drive = await JobDrive.findByIdAndUpdate(req.params.id, { status: "Closed" }, { new: true });
    if (!drive) {
      res.status(404).json({ error: "Job drive not found" });
      return;
    }
    res.json({ message: "Job drive applications closed successfully", jobDrive: drive });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id/applicants
app.get("/api/jobs/:id/applicants", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response) => {
  try {
    const applicants = await Application.find({ jobDriveId: req.params.id }).populate("studentId");
    res.json(applicants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// E. APPLICATIONS ENDPOINTS
// ==========================================

// GET /api/applications (Admin / Recruiter see all)
app.get("/api/applications", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let applications;
    if (req.user?.role === "student") {
      const student = await Student.findOne({ userId: req.user.userId });
      applications = await Application.find({ studentId: student?._id })
        .populate({ path: "jobDriveId", populate: { path: "companyId" } });
    } else {
      applications = await Application.find()
        .populate("studentId")
        .populate({ path: "jobDriveId", populate: { path: "companyId" } });
    }
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/applications (Student applies to a Job Drive)
app.post("/api/applications", authenticateToken, authorizeRoles("student"), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobDriveId } = req.body;
    if (!jobDriveId) {
      res.status(400).json({ error: "Job Drive ID is required" });
      return;
    }

    const student = await Student.findOne({ userId: req.user?.userId });
    if (!student) {
      res.status(404).json({ error: "Student profile not found" });
      return;
    }

    if (student.isFrozen) {
      res.status(400).json({ error: "Your profile is frozen. You cannot submit applications." });
      return;
    }

    // Verify Eligibility
    const drive = await JobDrive.findById(jobDriveId).populate("companyId");
    if (!drive) {
      res.status(404).json({ error: "Job drive not found" });
      return;
    }

    if (drive.status !== "Published") {
      res.status(400).json({ error: "Applications for this drive are not currently open." });
      return;
    }

    if (new Date() > new Date(drive.applyDeadline)) {
      res.status(400).json({ error: "The deadline for this job drive has passed." });
      return;
    }

    if (student.cgpa < drive.eligibility.cgpaCutoff) {
      res.status(400).json({ error: `Ineligible: CGPA of ${student.cgpa} is below the required cutoff of ${drive.eligibility.cgpaCutoff}.` });
      return;
    }

    if (student.backlogs > drive.eligibility.backlogsAllowed) {
      res.status(400).json({ error: `Ineligible: You have ${student.backlogs} backlog(s). Allowed backlogs: ${drive.eligibility.backlogsAllowed}.` });
      return;
    }

    if (!drive.eligibility.branches.includes("All") && !drive.eligibility.branches.includes(student.branch)) {
      res.status(400).json({ error: `Ineligible: This drive is only open to branches: ${drive.eligibility.branches.join(", ")}.` });
      return;
    }

    // Check duplicate
    const existing = await Application.findOne({ studentId: student._id, jobDriveId });
    if (existing) {
      res.status(400).json({ error: "You have already applied for this placement drive." });
      return;
    }

    const appRecord = new Application({
      studentId: student._id,
      jobDriveId,
      status: "Applied"
    });

    const savedApp = await appRecord.save();

    // Create Round 1 Pending entry automatically
    const r1 = new Round({
      applicationId: savedApp._id,
      roundName: "Round 1 - Technical Assessment / Shortlisting",
      roundStatus: "Pending",
      remarks: "Applied. Screening is currently underway."
    });
    await r1.save();

    res.status(201).json({ message: "Successfully applied for the placement drive!", application: savedApp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/applications/:id/status (Admin / Recruiter update status)
app.put("/api/applications/:id/status", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const allowed = ["Applied", "Shortlisted", "Rejected", "Assessment", "GD", "Interview", "HR", "Offer", "Joined"];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }

    const application = await Application.findById(id).populate("studentId").populate("jobDriveId");
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    application.status = status;
    if (remarks) application.remarks = remarks;
    const updated = await application.save();

    // Add round entry for selection history tracking
    const newRound = new Round({
      applicationId: updated._id,
      roundName: `${status} Phase Update`,
      roundStatus: status === "Rejected" ? "Failed" : "Cleared",
      remarks: remarks || `Moved to ${status} phase.`
    });
    await newRound.save();

    // If status updated to "Offer", create an Offer entry if it doesn't already exist
    if (status === "Offer") {
      const drive = await JobDrive.findById(application.jobDriveId);
      const existingOffer = await Offer.findOne({ studentId: application.studentId, jobDriveId: application.jobDriveId });
      if (!existingOffer && drive) {
        const o = new Offer({
          studentId: application.studentId,
          companyId: drive.companyId,
          jobDriveId: drive._id,
          package: drive.salary,
          status: "Pending"
        });
        await o.save();
      }
    }

    res.json({ message: "Application status updated successfully", application: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/export (Admin CSV export dummy link)
app.get("/api/applications/export", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const apps = await Application.find()
      .populate("studentId")
      .populate({ path: "jobDriveId", populate: { path: "companyId" } });

    let csvContent = "Student Name,Roll Number,Branch,Company,Role,Salary (LPA),Status,Applied Date\n";
    apps.forEach((a: any) => {
      if (a.studentId && a.jobDriveId) {
        const studentName = `${a.studentId.firstName} ${a.studentId.lastName}`;
        const companyName = a.jobDriveId.companyId?.companyName || "N/A";
        const dateStr = new Date(a.appliedAt).toLocaleDateString();
        csvContent += `"${studentName}","${a.studentId.rollNumber}","${a.studentId.branch}","${companyName}","${a.jobDriveId.title}",${a.jobDriveId.salary},"${a.status}","${dateStr}"\n`;
      }
    });

    res.header("Content-Type", "text/csv");
    res.attachment("placement-applications-export.csv");
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// F. NOTICES ENDPOINTS
// ==========================================

// GET /api/notices (All)
app.get("/api/notices", authenticateToken, async (req: Request, res: Response) => {
  try {
    const notices = await Notice.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notices (Admin)
app.post("/api/notices", authenticateToken, authorizeRoles("admin"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, type, priority, isPublished } = req.body;
    const notice = new Notice({
      title,
      content,
      type,
      priority,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user?.userId
    });
    const saved = await notice.save();
    res.status(201).json({ message: "Notice created successfully", notice: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notices/:id
app.get("/api/notices/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      res.status(404).json({ error: "Notice not found" });
      return;
    }
    res.json(notice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notices/:id (Admin)
app.put("/api/notices/:id", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ error: "Notice not found" });
      return;
    }
    res.json({ message: "Notice updated successfully", notice: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/notices/:id (Admin)
app.delete("/api/notices/:id", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Notice not found" });
      return;
    }
    res.json({ message: "Notice deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// G. REQUESTS ENDPOINTS (Unlock Profile, CGPA corrects, etc.)
// ==========================================

// GET /api/requests (Student gets their own, Admin gets all)
app.get("/api/requests", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === "student") {
      const student = await Student.findOne({ userId: req.user.userId });
      if (!student) {
        res.json([]);
        return;
      }
      const requests = await RequestModel.find({ studentId: student._id }).sort({ createdAt: -1 });
      res.json(requests);
    } else {
      const requests = await RequestModel.find().populate("studentId").sort({ createdAt: -1 });
      res.json(requests);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/requests (Student creates a request)
app.post("/api/requests", authenticateToken, authorizeRoles("student"), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, message } = req.body;
    if (!type || !message) {
      res.status(400).json({ error: "Request type and explanation message are required" });
      return;
    }

    const student = await Student.findOne({ userId: req.user?.userId });
    if (!student) {
      res.status(404).json({ error: "Student profile not found" });
      return;
    }

    const newRequest = new RequestModel({
      studentId: student._id,
      type,
      message,
      status: "Pending"
    });

    const saved = await newRequest.save();
    res.status(201).json({ message: "Support ticket request created successfully", request: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/requests/:id/status (Admin resolves a request)
app.put("/api/requests/:id/status", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const request = await RequestModel.findById(id);
    if (!request) {
      res.status(404).json({ error: "Request ticket not found" });
      return;
    }

    request.status = status;
    if (adminComment) request.adminComment = adminComment;
    const saved = await request.save();

    // Trigger action based on approved request
    if (status === "Approved") {
      if (request.type === "Profile Unlock") {
        await Student.findByIdAndUpdate(request.studentId, { isFrozen: false });
      } else if (request.type === "Placement Opt-Out") {
        await Student.findByIdAndUpdate(request.studentId, { studentStatus: "Opted-Out", isFrozen: true });
      }
    }

    res.json({ message: "Request ticket status updated successfully", request: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requests/:id
app.get("/api/requests/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await RequestModel.findById(req.params.id).populate("studentId");
    if (!ticket) {
      res.status(404).json({ error: "Request ticket not found" });
      return;
    }
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// H. ATTENDANCE ENDPOINTS
// ==========================================

// GET /api/attendance
app.get("/api/attendance", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === "student") {
      const student = await Student.findOne({ userId: req.user.userId });
      const attendance = await Attendance.find({ studentId: student?._id }).populate("companyId");
      res.json(attendance);
    } else {
      const attendance = await Attendance.find().populate("studentId").populate("companyId");
      res.json(attendance);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/attendance (Log attendance)
app.post("/api/attendance", authenticateToken, authorizeRoles("admin", "recruiter"), async (req: Request, res: Response) => {
  try {
    const { rollNumber, companyId, round, status, method } = req.body;

    if (!rollNumber || !companyId || !round || !status) {
      res.status(400).json({ error: "Roll number, Company, Placement Round, and attendance Status are required" });
      return;
    }

    const student = await Student.findOne({ rollNumber });
    if (!student) {
      res.status(404).json({ error: "Student with that roll number was not found." });
      return;
    }

    const record = new Attendance({
      studentId: student._id,
      companyId,
      round,
      status,
      method: method || "Manual"
    });

    const saved = await record.save();
    res.status(201).json({ message: "Attendance logged successfully", record: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/attendance/report (Generate report summary)
app.get("/api/attendance/report", authenticateToken, authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const totalRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: "Present" });
    const absentRecords = await Attendance.countDocuments({ status: "Absent" });
    const records = await Attendance.find().populate("studentId", "firstName lastName rollNumber branch").populate("companyId", "companyName");

    res.json({
      summary: {
        totalRecords,
        presentRecords,
        absentRecords,
        attendanceRate: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 100
      },
      records
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// I. DASHBOARD STATS, REPORTS & ANALYTICS
// ==========================================

// GET /api/dashboard/stats
app.get("/api/dashboard/stats", authenticateToken, async (req: Request, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments();
    const eligibleStudents = await Student.countDocuments({ studentStatus: "Eligible" });
    const registeredCompanies = await Company.countDocuments({ status: "Active" });
    const activeDrives = await JobDrive.countDocuments({ status: "Published" });
    const totalApplications = await Application.countDocuments();
    
    // Offers
    const offersCount = await Offer.countDocuments();
    const acceptedOffersCount = await Offer.countDocuments({ status: "Accepted" });
    
    // Calculated placement percentage
    const placementRate = totalStudents > 0 ? Math.round((acceptedOffersCount / totalStudents) * 100) : 0;

    res.json({
      stats: {
        totalStudents,
        eligibleStudents,
        registeredCompanies,
        activeDrives,
        totalApplications,
        offersCount,
        acceptedOffersCount,
        placementRate,
        interviewsToday: 3 // Static standard
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/charts
app.get("/api/analytics/charts", authenticateToken, async (req: Request, res: Response) => {
  try {
    // 1. Applications per month (Line chart mock trend based on days)
    const applicationsTrend = [
      { month: "Jan", applications: 25 },
      { month: "Feb", applications: 40 },
      { month: "Mar", applications: 75 },
      { month: "Apr", applications: 120 },
      { month: "May", applications: 90 },
      { month: "Jun", applications: 150 },
      { month: "Jul", applications: 180 }
    ];

    // 2. Branch-wise placements (Bar chart)
    const students = await Student.find();
    const offers = await Offer.find({ status: "Accepted" }).populate("studentId");
    
    const branchPlacements: { [key: string]: { total: number; placed: number } } = {
      "Computer Science": { total: 0, placed: 0 },
      "Electronics & Communication": { total: 0, placed: 0 },
      "Mechanical Engineering": { total: 0, placed: 0 },
      "Civil Engineering": { total: 0, placed: 0 }
    };

    // Aggregate totals
    students.forEach((s: any) => {
      if (branchPlacements[s.branch] !== undefined) {
        branchPlacements[s.branch].total += 1;
      }
    });

    // Aggregate placed
    offers.forEach((o: any) => {
      if (o.studentId && branchPlacements[o.studentId.branch] !== undefined) {
        branchPlacements[o.studentId.branch].placed += 1;
      }
    });

    const branchPlacementsData = Object.keys(branchPlacements).map(branch => ({
      branch,
      students: branchPlacements[branch].total,
      placed: branchPlacements[branch].placed,
      rate: branchPlacements[branch].total > 0 
        ? Math.round((branchPlacements[branch].placed / branchPlacements[branch].total) * 100) 
        : 0
    }));

    // 3. Package distribution (Histogram bins)
    const packageDistribution = [
      { range: "3-6 LPA", count: 2 },
      { range: "6-10 LPA", count: 4 },
      { range: "10-15 LPA", count: 3 },
      { range: "15-20 LPA", count: 2 },
      { range: "20-30 LPA", count: 1 },
      { range: "30+ LPA", count: 1 }
    ];

    // 4. Company Visits & Placed per company (Pie/Bar Chart)
    const companyVisits = [
      { name: "Google", offers: 2, visits: 2 },
      { name: "Microsoft", offers: 3, visits: 2 },
      { name: "Amazon", offers: 4, visits: 1 },
      { name: "Goldman Sachs", offers: 3, visits: 2 },
      { name: "McKinsey", offers: 1, visits: 1 },
      { name: "TCS", offers: 15, visits: 1 }
    ];

    res.json({
      applicationsTrend,
      branchPlacements: branchPlacementsData,
      packageDistribution,
      companyVisits
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/placement
app.get("/api/reports/placement", authenticateToken, async (req: Request, res: Response) => {
  try {
    const students = await Student.find();
    const offers = await Offer.find().populate("studentId").populate("companyId").populate("jobDriveId");
    
    res.json({
      totalStudentsCount: students.length,
      placedStudentsCount: offers.filter(o => o.status === "Accepted").length,
      offers,
      reportsGeneratedAt: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// VITE AND STATIC ASSETS SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
export default app;
