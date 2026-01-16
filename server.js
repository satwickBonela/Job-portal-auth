const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================================
   FIREBASE INITIALIZATION (FIRST!)
================================ */

// Support BOTH local + Render
let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY) {
  // Render / Production
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
} else {
  // Local development
  serviceAccount = require("./serviceAccountKey.json");
}

// 🔥 THIS MUST COME BEFORE firestore() OR auth()
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ NOW it is safe to use Firestore/Auth
const db = admin.firestore();

/* ================================
   MULTER CONFIG (RESUME UPLOAD)
================================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================================
   ROUTES
================================ */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* JOB SEEKER PROFILE */
app.post("/jobseeker-profile", upload.single("resume"), async (req, res) => {
  try {
    console.log("FORM DATA:", req.body);
    console.log("FILE:", req.file);

    const profileData = {
      fullname: req.body.fullname,
      skills: req.body.skills,
      phone: req.body.phone,
      email: req.body.email,
      resume: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    await db.collection("jobseekers").add(profileData);

    console.log("✅ DATA STORED IN FIRESTORE");
    res.send("Job Seeker profile saved successfully");
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).send(err.message);
  }
});

/* EMPLOYER PROFILE */
app.post("/employer-profile", async (req, res) => {
  try {
    await db.collection("employers").add({
      companyName: req.body.companyName,
      companyDomain: req.body.companyDomain,
      location: req.body.location,
      contact: req.body.contact,
      email: req.body.email,
      createdAt: new Date(),
    });

    res.send("Employer profile saved successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ================================
   SERVER START
================================ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
