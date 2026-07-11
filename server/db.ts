import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  User,
  Student,
  Company,
  JobDrive,
  Application,
  Notice,
  RequestModel,
  Attendance,
  Offer
} from "./models";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/placement_portal";

export async function connectDB() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully to Cluster0.");
    await seedDatabase();
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

async function seedDatabase() {
  try {
    // Check if we need to seed
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already initialized. Skipping seeding.");
      return;
    }

    console.log("Database is empty. Starting database seeding with high-quality placement data...");

    // 1. Create Hashed Passwords
    const studentHash = await bcrypt.hash("password123", 10);
    const adminHash = await bcrypt.hash("admin123", 10);
    const recruiterHash = await bcrypt.hash("recruiter123", 10);

    // 2. Create Users
    const usersData = [
      // Admins
      { name: "Placement Officer Admin", email: "admin@university.edu", password: adminHash, role: "admin", isVerified: true },
      { name: "Coordinator Sarah", email: "sarah.coord@university.edu", password: adminHash, role: "admin", isVerified: true },
      
      // Recruiters
      { name: "Google HR Team", email: "recruiter@company.com", password: recruiterHash, role: "recruiter", isVerified: true },
      { name: "Microsoft Hiring", email: "ms.recruit@microsoft.com", password: recruiterHash, role: "recruiter", isVerified: true },
      { name: "Goldman Sachs Talent", email: "gs.recruit@gs.com", password: recruiterHash, role: "recruiter", isVerified: true },
      { name: "McKinsey Talent Partner", email: "mck.recruit@mckinsey.com", password: recruiterHash, role: "recruiter", isVerified: true },
      { name: "Tata Motors Careers", email: "tata.recruit@tata.com", password: recruiterHash, role: "recruiter", isVerified: true },

      // Students
      { name: "Alex Carter", email: "student@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Priya Sharma", email: "priya.sharma@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "John Doe", email: "john.doe@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Neha Patel", email: "neha.patel@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Rohan Verma", email: "rohan.verma@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Emily Watson", email: "emily.watson@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Siddharth Sen", email: "sid.sen@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Aarav Mehta", email: "aarav.mehta@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Ananya Iyer", email: "ananya.iyer@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Kabir Singh", email: "kabir.singh@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Meera Nair", email: "meera.nair@university.edu", password: studentHash, role: "student", isVerified: true },
      { name: "Vikram Malhotra", email: "vikram.m@university.edu", password: studentHash, role: "student", isVerified: true }
    ];

    const insertedUsers = await User.insertMany(usersData);
    console.log(`Seeded ${insertedUsers.length} Users.`);

    const adminUser = insertedUsers.find(u => u.email === "admin@university.edu")!;
    const googleUser = insertedUsers.find(u => u.email === "recruiter@company.com")!;
    const msUser = insertedUsers.find(u => u.email === "ms.recruit@microsoft.com")!;

    // 3. Create Companies
    const companiesData = [
      {
        companyName: "Google",
        logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=150&auto=format&fit=crop&q=60",
        description: "Google's mission is to organize the world's information and make it universally accessible and useful.",
        website: "https://careers.google.com",
        location: "Bangalore / Mountain View",
        industry: "Technology / Internet",
        hrName: "Sundar HR Team",
        hrEmail: "recruiter@company.com",
        hrPhone: "+91 98765 43210",
        type: ["Full-time", "Internship", "Hybrid"],
        status: "Active"
      },
      {
        companyName: "Microsoft",
        logo: "https://images.unsplash.com/photo-1625014020903-e329f586c990?w=150&auto=format&fit=crop&q=60",
        description: "Empower every person and every organization on the planet to achieve more.",
        website: "https://careers.microsoft.com",
        location: "Hyderabad / Seattle",
        industry: "Technology / Enterprise",
        hrName: "Satya Hiring Lead",
        hrEmail: "ms.recruit@microsoft.com",
        hrPhone: "+91 98765 43211",
        type: ["Full-time", "Internship", "PPO"],
        status: "Active"
      },
      {
        companyName: "Amazon",
        logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=150&auto=format&fit=crop&q=60",
        description: "Earth's most customer-centric company, where people can find and discover anything they want to buy online.",
        website: "https://amazon.jobs",
        location: "Chennai / Bangalore",
        industry: "E-Commerce / Cloud Computing",
        hrName: "Jeff Talent Officer",
        hrEmail: "amazon.hiring@amazon.com",
        hrPhone: "+91 98765 43212",
        type: ["Full-time", "Internship"],
        status: "Active"
      },
      {
        companyName: "McKinsey & Company",
        logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=60",
        description: "A global management consulting firm that serves a broad mix of private, public, and social sector institutions.",
        website: "https://www.mckinsey.com",
        location: "Mumbai / Gurgaon",
        industry: "Management Consulting",
        hrName: "Sarah Partner",
        hrEmail: "mck.recruit@mckinsey.com",
        hrPhone: "+91 98765 43213",
        type: ["Full-time"],
        status: "Active"
      },
      {
        companyName: "Goldman Sachs",
        logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=60",
        description: "A leading global financial institution that delivers a broad range of financial services to a large client base.",
        website: "https://www.goldmansachs.com",
        location: "Bangalore",
        industry: "Investment Banking",
        hrName: "David GS Recruiter",
        hrEmail: "gs.recruit@gs.com",
        hrPhone: "+91 98765 43214",
        type: ["Full-time", "Internship", "PPO"],
        status: "Active"
      },
      {
        companyName: "Tata Consultancy Services (TCS)",
        logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=60",
        description: "An IT services, consulting and business solutions organization that has been partnering with many global businesses.",
        website: "https://www.tcs.com",
        location: "Pune / Delhi NCR",
        industry: "IT Services",
        hrName: "Chandra HR",
        hrEmail: "tcs.recruit@tcs.com",
        hrPhone: "+91 98765 43215",
        type: ["Full-time", "Internship"],
        status: "Active"
      },
      {
        companyName: "Reliance Industries",
        logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=150&auto=format&fit=crop&q=60",
        description: "Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai.",
        website: "https://www.ril.com",
        location: "Mumbai / Jamnagar",
        industry: "Conglomerate / Energy",
        hrName: "Ambani Hiring Group",
        hrEmail: "ril.recruit@ril.com",
        hrPhone: "+91 98765 43216",
        type: ["Full-time"],
        status: "Active"
      },
      {
        companyName: "JP Morgan Chase",
        logo: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop&q=60",
        description: "A leading global financial services firm and one of the largest banking institutions in the United States.",
        website: "https://careers.jpmorganchase.com",
        location: "Mumbai / Bangalore",
        industry: "Finance / Banking",
        hrName: "Jamie Talent Lead",
        hrEmail: "jpm.recruit@jpmorgan.com",
        hrPhone: "+91 98765 43217",
        type: ["Full-time", "Internship"],
        status: "Active"
      },
      {
        companyName: "Tata Motors",
        logo: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=150&auto=format&fit=crop&q=60",
        description: "A leading global automobile manufacturer of cars, utility vehicles, buses, trucks, and defense vehicles.",
        website: "https://www.tatamotors.com",
        location: "Pune / Jamshedpur",
        industry: "Automotive / Manufacturing",
        hrName: "Ratan Careers",
        hrEmail: "tata.recruit@tata.com",
        hrPhone: "+91 98765 43218",
        type: ["Full-time", "Hybrid"],
        status: "Active"
      },
      {
        companyName: "BCG (Boston Consulting Group)",
        logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&auto=format&fit=crop&q=60",
        description: "A global management consulting firm and the world's leading advisor on business strategy.",
        website: "https://www.bcg.com",
        location: "Delhi / Bangalore",
        industry: "Management Consulting",
        hrName: "Emma Consultant Recruiter",
        hrEmail: "bcg.recruit@bcg.com",
        hrPhone: "+91 98765 43219",
        type: ["Full-time"],
        status: "Active"
      }
    ];

    const insertedCompanies = await Company.insertMany(companiesData);
    console.log(`Seeded ${insertedCompanies.length} Companies.`);

    const googleCo = insertedCompanies.find(c => c.companyName === "Google")!;
    const msCo = insertedCompanies.find(c => c.companyName === "Microsoft")!;
    const amazonCo = insertedCompanies.find(c => c.companyName === "Amazon")!;
    const gsCo = insertedCompanies.find(c => c.companyName === "Goldman Sachs")!;
    const mckCo = insertedCompanies.find(c => c.companyName === "McKinsey & Company")!;
    const tcsCo = insertedCompanies.find(c => c.companyName === "Tata Consultancy Services (TCS)")!;
    const rilCo = insertedCompanies.find(c => c.companyName === "Reliance Industries")!;
    const jpmCo = insertedCompanies.find(c => c.companyName === "JP Morgan Chase")!;
    const tatamCo = insertedCompanies.find(c => c.companyName === "Tata Motors")!;

    // 4. Create Students
    const branches = ["Computer Science", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering"];
    const placementCycles = ["2026-2027 Cycle", "2025-2026 Cycle"];
    const universities = ["Institute of Science and Technology", "VIT University", "IIT Madras", "BITS Pilani"];

    const studentsMeta = [
      { name: "Alex Carter", email: "student@university.edu", rollNumber: "RA2311003010156", branch: "Computer Science", cgpa: 9.2, backlogs: 0, attendance: 95 },
      { name: "Priya Sharma", email: "priya.sharma@university.edu", rollNumber: "RA2311003010157", branch: "Electronics & Communication", cgpa: 8.8, backlogs: 0, attendance: 92 },
      { name: "John Doe", email: "john.doe@university.edu", rollNumber: "RA2311003010158", branch: "Computer Science", cgpa: 7.5, backlogs: 1, attendance: 85 },
      { name: "Neha Patel", email: "neha.patel@university.edu", rollNumber: "RA2311003010159", branch: "Computer Science", cgpa: 9.6, backlogs: 0, attendance: 98 },
      { name: "Rohan Verma", email: "rohan.verma@university.edu", rollNumber: "RA2311003010160", branch: "Electronics & Communication", cgpa: 8.1, backlogs: 0, attendance: 90 },
      { name: "Emily Watson", email: "emily.watson@university.edu", rollNumber: "RA2311003010161", branch: "Computer Science", cgpa: 9.5, backlogs: 0, attendance: 96 },
      { name: "Siddharth Sen", email: "sid.sen@university.edu", rollNumber: "RA2311003010162", branch: "Mechanical Engineering", cgpa: 8.4, backlogs: 0, attendance: 89 },
      { name: "Aarav Mehta", email: "aarav.mehta@university.edu", rollNumber: "RA2311003010163", branch: "Mechanical Engineering", cgpa: 6.9, backlogs: 2, attendance: 80 },
      { name: "Ananya Iyer", email: "ananya.iyer@university.edu", rollNumber: "RA2311003010164", branch: "Computer Science", cgpa: 9.8, backlogs: 0, attendance: 99 },
      { name: "Kabir Singh", email: "kabir.singh@university.edu", rollNumber: "RA2311003010165", branch: "Civil Engineering", cgpa: 7.2, backlogs: 0, attendance: 88 },
      { name: "Meera Nair", email: "meera.nair@university.edu", rollNumber: "RA2311003010166", branch: "Electronics & Communication", cgpa: 8.9, backlogs: 0, attendance: 94 },
      { name: "Vikram Malhotra", email: "vikram.m@university.edu", rollNumber: "RA2311003010167", branch: "Civil Engineering", cgpa: 8.3, backlogs: 0, attendance: 91 }
    ];

    const studentsData = studentsMeta.map(meta => {
      const user = insertedUsers.find(u => u.email === meta.email)!;
      const spaceSplit = meta.name.split(" ");
      const firstName = spaceSplit[0];
      const lastName = spaceSplit[1] || "";
      
      return {
        userId: user._id,
        rollNumber: meta.rollNumber,
        firstName,
        lastName,
        branch: meta.branch,
        course: "B.Tech",
        college: "Institute of Science and Technology",
        graduationYear: 2027,
        placementCycle: "2026-2027 Cycle",
        studentStatus: meta.cgpa >= 8.0 && meta.backlogs === 0 ? "Eligible" : "Needs Review",
        gender: firstName === "Alex" || firstName === "John" || firstName === "Rohan" || firstName === "Siddharth" || firstName === "Aarav" || firstName === "Kabir" || firstName === "Vikram" ? "Male" : "Female",
        birthday: new Date("2005-06-15"),
        nationality: "Indian",
        aadhaarNumber: `1234 5678 ${Math.floor(1000 + Math.random() * 9000)}`,
        email: meta.email,
        phoneNumber: `+91 99887 ${Math.floor(50000 + Math.random() * 49999)}`,
        personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        github: `https://github.com/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        hackerrank: `https://hackerrank.com/${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        cgpa: meta.cgpa,
        backlogs: meta.backlogs,
        attendance: meta.attendance,
        skills: meta.branch === "Computer Science" 
          ? ["React.js", "Node.js", "MongoDB", "TypeScript", "Python", "Data Structures"]
          : meta.branch.includes("Electronics")
          ? ["Embedded C", "VLSI", "IoT", "Arduino", "MATLAB", "Circuit Design"]
          : ["CAD/CAM", "SolidWorks", "Thermodynamics", "AutoCAD", "MATLAB"],
        resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        isVerified: true,
        isFrozen: false,
        mentor: "Dr. K. Ganesan, Professor/CSE",
        advisor: "Mrs. J. Jean, Asst. Professor/CSE",
        address: {
          current: { city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "603203", addressLine: "Potheri Main Road, Nagar" },
          permanent: { city: "New Delhi", state: "Delhi", country: "India", pincode: "110001", addressLine: "A-52, Preet Vihar" }
        },
        parentDetails: {
          father: { name: `Mr. Rajesh ${lastName}`, email: `rajesh.${lastName.toLowerCase()}@gmail.com`, phone: "+91 91234 56789", occupation: "Business Analyst", company: "Infosys", officeAddress: "Infosys Campus, Delhi" },
          mother: { name: `Mrs. Savita ${lastName}`, email: `savita.${lastName.toLowerCase()}@gmail.com`, phone: "+91 92234 56789", occupation: "Home Maker", officeAddress: "N/A" }
        }
      };
    });

    const insertedStudents = await Student.insertMany(studentsData);
    console.log(`Seeded ${insertedStudents.length} Students.`);

    const alexSt = insertedStudents.find(s => s.email === "student@university.edu")!;
    const priyaSt = insertedStudents.find(s => s.email === "priya.sharma@university.edu")!;
    const johnSt = insertedStudents.find(s => s.email === "john.doe@university.edu")!;
    const nehaSt = insertedStudents.find(s => s.email === "neha.patel@university.edu")!;

    // 5. Create Job Drives (15-20 drives)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const jobDrivesData = [
      {
        companyId: googleCo._id,
        title: "Software Engineer - Campus Graduate",
        description: "Join Google as a software engineer to build systems that handle petabytes of data, scaling for billions of active daily users worldwide.",
        salary: 32, // LPA
        eligibility: { branches: ["Computer Science", "Electronics & Communication"], cgpaCutoff: 8.5, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["C++", "Java", "Python", "Data Structures & Algorithms"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-08-15"),
        interviewDate: new Date("2026-08-18"),
        venue: "Placement Cell Block A, Conference Room 1",
        status: "Published"
      },
      {
        companyId: googleCo._id,
        title: "Site Reliability Engineer (SRE) Intern",
        description: "SREs at Google run, maintain, and scale the largest production services on earth, bridging systems design with code execution.",
        salary: 18,
        stipend: 80000,
        eligibility: { branches: ["Computer Science"], cgpaCutoff: 8.0, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["Linux Systems", "Python", "Golang", "Networking"],
        applyDeadline: tomorrow,
        visitDate: new Date("2026-07-25"),
        interviewDate: new Date("2026-07-28"),
        venue: "Virtual via Google Meet",
        status: "Published"
      },
      {
        companyId: msCo._id,
        title: "Software Engineering Intern (Summer 2027)",
        description: "Microsoft is looking for highly motivated software engineering interns to build components of Windows, Azure, or Office suite.",
        salary: 24,
        stipend: 125000,
        eligibility: { branches: ["Computer Science", "Electronics & Communication"], cgpaCutoff: 8.0, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["C#", "TypeScript", "React.js", "Azure Services"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-08-01"),
        interviewDate: new Date("2026-08-05"),
        venue: "Tech Hub, Block C Auditorium",
        status: "Published"
      },
      {
        companyId: msCo._id,
        title: "Technical Consultant (Full-time)",
        description: "Work directly with Microsoft's enterprise customers to design, architecture, and configure cloud-scale business applications.",
        salary: 14,
        eligibility: { branches: ["Computer Science", "Electronics & Communication", "Mechanical Engineering"], cgpaCutoff: 7.5, backlogsAllowed: 1, graduationYear: [2027] },
        skills: ["Communication", "PowerApps", "Cloud Infrastructure", "SQL"],
        applyDeadline: new Date("2026-07-15"),
        visitDate: new Date("2026-07-20"),
        interviewDate: new Date("2026-07-22"),
        venue: "Placement Block Seminar Hall B",
        status: "Published"
      },
      {
        companyId: amazonCo._id,
        title: "Software Development Engineer (SDE-1)",
        description: "Build cutting edge retail technologies, microservices, and logistical software at massive global scale in Amazon SDE-1 role.",
        salary: 28,
        eligibility: { branches: ["Computer Science", "Electronics & Communication"], cgpaCutoff: 8.0, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["Java", "System Design", "AWS", "NoSQL"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-09-01"),
        interviewDate: new Date("2026-09-04"),
        venue: "Main Campus Library, Tech Lab 2",
        status: "Published"
      },
      {
        companyId: gsCo._id,
        title: "Financial Analyst (Full-time)",
        description: "Apply your quantitative skills, mathematical modelling, and financial software engineering to execute high frequency transactions and asset trading.",
        salary: 22,
        eligibility: { branches: ["Computer Science", "Electronics & Communication", "Mechanical Engineering"], cgpaCutoff: 8.0, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["Quantitative Finance", "R / Python", "Data Analysis", "Excel"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-08-10"),
        interviewDate: new Date("2026-08-12"),
        venue: "Goldman Sachs Office Bangalore / Virtual",
        status: "Published"
      },
      {
        companyId: gsCo._id,
        title: "Summer Analyst Intern",
        description: "Kickstart your career in banking with an intense summer internship working on live fintech platforms and real-world trading pipelines.",
        salary: 12,
        stipend: 65000,
        eligibility: { branches: ["Computer Science", "Electronics & Communication"], cgpaCutoff: 7.8, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["Algorithms", "Python", "SQL", "Statistics"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-07-29"),
        interviewDate: new Date("2026-08-01"),
        venue: "Virtual",
        status: "Published"
      },
      {
        companyId: mckCo._id,
        title: "Business Analyst (Full-time)",
        description: "Solve the world's hardest strategic and operational challenges as part of small collaborative client teams at McKinsey.",
        salary: 21,
        eligibility: { branches: ["Computer Science", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering"], cgpaCutoff: 8.2, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["Problem Solving", "Case Interviews", "Financial Analysis", "Presentation"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-08-20"),
        interviewDate: new Date("2026-08-25"),
        venue: "Main Auditorium, Central Block",
        status: "Published"
      },
      {
        companyId: tcsCo._id,
        title: "TCS Ninja / Digital - System Engineer",
        description: "A comprehensive core development role focused on global client projects using modern frontends, enterprise backends, and cloud migrations.",
        salary: 7.5,
        eligibility: { branches: ["Computer Science", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering"], cgpaCutoff: 6.5, backlogsAllowed: 2, graduationYear: [2027] },
        skills: ["Java", "HTML/CSS", "DBMS", "Logical Reasoning"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-07-28"),
        interviewDate: new Date("2026-07-30"),
        venue: "TCS Ion Digital Center / Virtual",
        status: "Published"
      },
      {
        companyId: rilCo._id,
        title: "Graduate Engineer Trainee (GET)",
        description: "Manage large-scale petrochemical refinery systems, supply chains, or telecom infrastructures within Reliance Reliance Jio / Reliance Retail units.",
        salary: 10,
        eligibility: { branches: ["Mechanical Engineering", "Electronics & Communication", "Civil Engineering"], cgpaCutoff: 7.0, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["Thermodynamics", "PLC Systems", "Project Management", "MATLAB"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-08-05"),
        interviewDate: new Date("2026-08-08"),
        venue: "Mechanical Dept Seminar Hall",
        status: "Published"
      },
      {
        companyId: jpmCo._id,
        title: "Software Engineering Intern (JPMC)",
        description: "Work on JP Morgan's payment networks, automated clearinghouses, or credit risk assessment platforms.",
        salary: 16,
        stipend: 75000,
        eligibility: { branches: ["Computer Science", "Electronics & Communication"], cgpaCutoff: 7.8, backlogsAllowed: 0, graduationYear: [2027] },
        skills: ["Java", "Spring Boot", "React.js", "Docker"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-08-11"),
        interviewDate: new Date("2026-08-13"),
        venue: "Placement cell Main Block",
        status: "Published"
      },
      {
        companyId: tatamCo._id,
        title: "Automotive Product Designer",
        description: "Shape the future of electric vehicles (EVs) by developing CAD designs, vehicle dynamics, and advanced safety control systems.",
        salary: 12,
        eligibility: { branches: ["Mechanical Engineering", "Electronics & Communication"], cgpaCutoff: 7.2, backlogsAllowed: 1, graduationYear: [2027] },
        skills: ["SolidWorks", "Ansys", "Embedded Systems", "CAD Design"],
        applyDeadline: nextWeek,
        visitDate: new Date("2026-08-09"),
        interviewDate: new Date("2026-08-12"),
        venue: "CAD Design Lab, Mechanical Dept",
        status: "Published"
      }
    ];

    const insertedJobDrives = await JobDrive.insertMany(jobDrivesData);
    console.log(`Seeded ${insertedJobDrives.length} Job Drives.`);

    const googleSreDrive = insertedJobDrives.find(d => d.title.includes("SRE"))!;
    const msInternDrive = insertedJobDrives.find(d => d.title.includes("Software Engineering Intern"))!;
    const msConsultDrive = insertedJobDrives.find(d => d.title.includes("Technical Consultant"))!;
    const gsInternDrive = insertedJobDrives.find(d => d.title.includes("Summer Analyst"))!;
    const tcsNinjaDrive = insertedJobDrives.find(d => d.title.includes("Ninja"))!;

    // 6. Create Applications
    const applicationsData = [
      // Alex Carter applied to Google SRE, Microsoft Intern, Goldman Sachs Intern
      { studentId: alexSt._id, jobDriveId: googleSreDrive._id, status: "Shortlisted", remarks: "Candidate cleared Round 1 coding challenge." },
      { studentId: alexSt._id, jobDriveId: msInternDrive._id, status: "Applied", remarks: "Resume submitted." },
      { studentId: alexSt._id, jobDriveId: gsInternDrive._id, status: "Interview", remarks: "Technical Interview scheduled for 10:00 AM." },

      // Priya Sharma applied to Microsoft Intern, Goldman Sachs Intern, TCS Ninja
      { studentId: priyaSt._id, jobDriveId: msInternDrive._id, status: "Rejected", remarks: "Did not meet criteria in cognitive round." },
      { studentId: priyaSt._id, jobDriveId: gsInternDrive._id, status: "Shortlisted", remarks: "Cleared HackerRank coding test." },
      { studentId: priyaSt._id, jobDriveId: tcsNinjaDrive._id, status: "Offer", remarks: "Offered TCS Digital Role (7.5 LPA)." },

      // John Doe applied to TCS Ninja, Microsoft Consultant
      { studentId: johnSt._id, jobDriveId: tcsNinjaDrive._id, status: "Joined", remarks: "Offer accepted and induction complete." },
      { studentId: johnSt._id, jobDriveId: msConsultDrive._id, status: "Rejected", remarks: "Backlog eligibility restriction." },

      // Neha Patel applied to Google SRE, Microsoft Intern
      { studentId: nehaSt._id, jobDriveId: googleSreDrive._id, status: "Offer", remarks: "Offered SRE Internship role!" },
      { studentId: nehaSt._id, jobDriveId: msInternDrive._id, status: "Shortlisted", remarks: "Cleared Round 2 Technical Interview." }
    ];

    const insertedApplications = await Application.insertMany(applicationsData);
    console.log(`Seeded ${insertedApplications.length} Applications.`);

    // 7. Create Offers (based on Offers in applications)
    const offersData = [
      {
        studentId: priyaSt._id,
        companyId: tcsCo._id,
        jobDriveId: tcsNinjaDrive._id,
        package: 7.5,
        offerDate: new Date("2026-07-01"),
        status: "Accepted"
      },
      {
        studentId: johnSt._id,
        companyId: tcsCo._id,
        jobDriveId: tcsNinjaDrive._id,
        package: 7.5,
        offerDate: new Date("2026-07-02"),
        status: "Accepted"
      },
      {
        studentId: nehaSt._id,
        companyId: googleCo._id,
        jobDriveId: googleSreDrive._id,
        package: 18,
        offerDate: new Date("2026-07-05"),
        status: "Pending"
      }
    ];
    await Offer.insertMany(offersData);
    console.log("Seeded Offers.");

    // 8. Create Notices (10-15 notices)
    const noticesData = [
      {
        title: "Microsoft Internship Drive registrations closing today!",
        content: "Please note that registrations for Microsoft's Summer Internship 2027 will close tonight at 11:59 PM. Ensure your profile is locked and resume is updated before applying.",
        type: "Placement",
        priority: "High",
        createdBy: adminUser._id,
        isPublished: true
      },
      {
        title: "General Verification Deadline for B.Tech CSE",
        content: "All 2027 passed-out batch CSE students must get their CGPA verified by their respective advisors in the placement office before July 15th to maintain eligibility for Tier-1 companies.",
        type: "General",
        priority: "Medium",
        createdBy: adminUser._id,
        isPublished: true
      },
      {
        title: "HackerRank Practice Test - Saturday 10 AM",
        content: "A mandatory practice assessment has been scheduled on HackerRank. This will simulate real-world recruiter assessments. Link will be emailed 15 minutes prior.",
        type: "Exam",
        priority: "High",
        createdBy: adminUser._id,
        isPublished: true
      },
      {
        title: "Google SRE Interview Shortlist Announced",
        content: "Congratulations to the 15 students shortlisted for Google SRE interviews. Please check your tracking tab for schedule details and slot confirmation.",
        type: "Company",
        priority: "High",
        createdBy: adminUser._id,
        isPublished: true
      },
      {
        title: "Resume Editing Guidelines & Standards",
        content: "We noticed several resumes with incorrect format. Standard templates can be downloaded from our portal's settings. Resume size must be less than 5MB in PDF format.",
        type: "Reminder",
        priority: "Medium",
        createdBy: adminUser._id,
        isPublished: true
      },
      {
        title: "Workshop on Management Consulting Cases by McKinsey Partners",
        content: "Join us in the Central Block Auditorium this Thursday at 2:00 PM for a case study strategy workshop conducted by McKinley Partners and university alumni.",
        type: "Announcement",
        priority: "Low",
        createdBy: adminUser._id,
        isPublished: true
      },
      {
        title: "TCS Ninja Drive Results",
        content: "TCS Ninja drive results have been declared. 2 of our core students received offers. Offer letters can be uploaded in your student dashboard profile document section.",
        type: "Placement",
        priority: "Medium",
        createdBy: adminUser._id,
        isPublished: true
      },
      {
        title: "Goldman Sachs Test Instructions",
        content: "Students appearing for the GS assessment tomorrow must join the Zoom call 10 minutes prior with clear video. Mobile hotspots are not recommended.",
        type: "Exam",
        priority: "High",
        createdBy: adminUser._id,
        isPublished: true
      }
    ];
    await Notice.insertMany(noticesData);
    console.log("Seeded Notices.");

    // 9. Create Requests (5-8 requests)
    const requestsData = [
      {
        studentId: alexSt._id,
        type: "Profile Unlock",
        message: "Requesting unlock to update my updated CGPA from 9.1 to 9.2 based on semester 6 results.",
        status: "Approved",
        adminComment: "Profile unlocked. Please submit CGPA proof after updating."
      },
      {
        studentId: priyaSt._id,
        type: "Wrong CGPA",
        message: "My portal shows 8.6 instead of 8.8. Please rectify.",
        status: "Pending"
      },
      {
        studentId: johnSt._id,
        type: "Leave Request",
        message: "Need permission to skip TCS on-campus interview due to medical emergency.",
        status: "Rejected",
        adminComment: "Medical certificate not uploaded. Please submit certificate to request desk."
      },
      {
        studentId: alexSt._id,
        type: "Profile Edit",
        message: "Need to update my phone number to my active WhatsApp number (+91 9900881122).",
        status: "Pending"
      }
    ];
    await RequestModel.insertMany(requestsData);
    console.log("Seeded Requests.");

    // 10. Seed Attendance
    const attendanceData = [
      { studentId: alexSt._id, companyId: googleCo._id, round: "Round 1 - Technical Assessment", date: new Date(), status: "Present", method: "QR" },
      { studentId: priyaSt._id, companyId: msCo._id, round: "Round 1 - Coding Challenge", date: new Date(), status: "Absent", method: "Manual" },
      { studentId: nehaSt._id, companyId: googleCo._id, round: "Round 1 - Technical Assessment", date: new Date(), status: "Present", method: "QR" }
    ];
    await Attendance.insertMany(attendanceData);
    console.log("Seeded Attendance records.");

    console.log("Database seeded successfully with all initial placement records!");
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
}
