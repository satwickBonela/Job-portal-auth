const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let firebaseConfig;

if (process.env.FIREBASE_PRIVATE_KEY) {
  // RENDER / PRODUCTION
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
} else {
  // LOCAL DEVELOPMENT
  firebaseConfig = require("./serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

/* HOME ROUTE */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* REGISTER */
app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    // Store role as custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      role: role,
    });

    res.send(
      `User registered successfully as ${role}. You can now login.`
    );
  } catch (error) {
    res.send(error.message);
  }
});


/* LOGIN (UI ONLY FOR NOW) */
app.post("/login", (req, res) => {
  res.send("Login Successful");
});

/* PORT */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
