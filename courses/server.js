// ─────────────────────────────────────────────────────────────
// 📦 Imports & Setup
// ─────────────────────────────────────────────────────────────
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const dotenv = require("dotenv");
const cors = require("cors");
const Student = require("./models/Student");
const Allocation = require("./models/Allocation");
const Selection = require("./models/Selection");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// 🌐 CORS Setup (allow frontend on Vercel to connect)
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000", // frontend url in .env
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static("public"));

// ─────────────────────────────────────────────────────────────
// 🌐 MongoDB Connection
// ─────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// ─────────────────────────────────────────────────────────────
// 🔐 Admin Session Logic
// ─────────────────────────────────────────────────────────────
const adminSessions = {};
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";
const ADMIN_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

function adminAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing admin token" });
  }
  const token = header.slice(7);
  const session = adminSessions[token];
  if (!session) {
    return res.status(401).json({ success: false, message: "Invalid admin token" });
  }
  if (Date.now() - session.createdAt > ADMIN_TOKEN_TTL_MS) {
    delete adminSessions[token];
    return res.status(401).json({ success: false, message: "Admin session expired" });
  }
  next();
}

// ─────────────────────────────────────────────────────────────
// 🔑 Admin Login
// ─────────────────────────────────────────────────────────────
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }
  const token = crypto.randomBytes(24).toString("hex");
  adminSessions[token] = { createdAt: Date.now() };
  return res.json({ success: true, token });
});

// ─────────────────────────────────────────────────────────────
// 📝 Student Registration
// ─────────────────────────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  const { name, email, department, semester } = req.body;
  if (!name || !email || !department || !semester) {
    return res
      .status(400)
      .json({ success: false, message: "name, email, department and semester are required" });
  }

  const roll = `${department.slice(0, 3).toUpperCase()}${Math.floor(
    1000 + Math.random() * 9000
  )}${Date.now().toString().slice(-4)}`.toUpperCase();

  const student = new Student({
    roll,
    name,
    email,
    department: department.toUpperCase(),
    semester,
  });

  try {
    await student.save();
    return res.json({ success: true, student });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to register student" });
  }
});

// ─────────────────────────────────────────────────────────────
// 🔓 Student Login
// ─────────────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  const { roll } = req.body;
  if (!roll) return res.status(400).json({ success: false, message: "Roll required" });

  const student = await Student.findOne({ roll: roll.trim().toUpperCase() });
  if (!student) return res.status(404).json({ success: false, message: "Student not found" });

  return res.json({ success: true, student });
});

// ─────────────────────────────────────────────────────────────
// 📚 Get All or Filtered Students (Admin)
// ─────────────────────────────────────────────────────────────
app.get("/api/admin/students", adminAuth, async (req, res) => {
  const dept = (req.query.department || "").trim().toUpperCase();
  const semester = (req.query.semester || "").trim();

  const filter = {};
  if (dept) filter.department = dept;
  if (semester) filter.semester = semester;

  try {
    const students = await Student.find(filter);

    if (dept || semester) {
      return res.json({ success: true, students });
    }

    const grouped = {};
    students.forEach((s) => {
      const d = (s.department || "UNKNOWN").toUpperCase();
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(s);
    });

    res.json({ success: true, grouped, students });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch students", error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 🎯 Course Allocation to Students (Department + Semester based)
// ─────────────────────────────────────────────────────────────
app.post("/api/admin/allocate", adminAuth, async (req, res) => {
  const { department, semester, courses } = req.body;
  if (!department || !semester || !Array.isArray(courses)) {
    return res.status(400).json({
      success: false,
      message: "department, semester and courses (array) required",
    });
  }

  try {
    const dept = department.trim().toUpperCase();
    const sem = semester.trim();
    const students = await Student.find({ department: dept, semester: sem });
    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "No students found in this department & semester",
      });
    }

    const allocations = [];
    for (const student of students) {
      const allocation = await Allocation.findOneAndUpdate(
        { roll: student.roll },
        { roll: student.roll, courses, allocatedAt: new Date() },
        { upsert: true, new: true }
      );

      student.courses = courses;
      await student.save();

      allocations.push(allocation);
    }

    res.json({ success: true, department: dept, semester: sem, allocations });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to allocate courses",
      error: e.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// 📄 View Allocated Courses (Student)
// ─────────────────────────────────────────────────────────────
app.get("/api/allocated/:roll", async (req, res) => {
  const roll = req.params.roll?.trim().toUpperCase();
  if (!roll) return res.status(400).json({ success: false, message: "roll required" });

  const allocation = await Allocation.findOne({ roll });
  if (!allocation)
    return res.status(404).json({ success: false, message: "No allocation found" });

  res.json({ success: true, allocation });
});

// ─────────────────────────────────────────────────────────────
// ✅ Student Selects Courses
// ─────────────────────────────────────────────────────────────
app.post("/api/select-courses", async (req, res) => {
  const { roll, courses } = req.body;
  if (!roll || !Array.isArray(courses) || courses.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "roll and non-empty courses array required" });
  }

  const normalized = roll.trim().toUpperCase();
  const allocation = await Allocation.findOne({ roll: normalized });
  if (!allocation) {
    return res
      .status(400)
      .json({ success: false, message: "No allocated courses for this roll" });
  }

  const allowedSet = new Set(allocation.courses);
  const invalid = courses.filter((c) => !allowedSet.has(c));
  if (invalid.length) {
    return res.status(400).json({
      success: false,
      message: "Trying to select unallocated course(s): " + invalid.join(", "),
    });
  }

  try {
    const selection = await Selection.findOneAndUpdate(
      { roll: normalized },
      { roll: normalized, courses, submittedAt: new Date() },
      { upsert: true, new: true }
    );

    await Student.findOneAndUpdate({ roll: normalized }, { courses }, { new: true });

    return res.json({ success: true, selection });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to save selection" });
  }
});

// ─────────────────────────────────────────────────────────────
// 🔍 Fetch Submitted Selection
// ─────────────────────────────────────────────────────────────
app.get("/api/selection/:roll", async (req, res) => {
  const roll = req.params.roll?.trim().toUpperCase();
  if (!roll) return res.status(400).json({ success: false, message: "roll required" });

  const selection = await Selection.findOne({ roll });
  if (!selection) return res.status(404).json({ success: false, message: "No selection found" });

  res.json({ success: true, selection });
});

// ─────────────────────────────────────────────────────────────
// 🚀 Launch Server
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
