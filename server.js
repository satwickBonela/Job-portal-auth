const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* HOME PAGE */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

/* REGISTER */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    await admin.auth().createUser({ email, password });
    res.send("User Registered Successfully");
  } catch (error) {
    res.send(error.message);
  }
});

/* LOGIN */
app.post("/login", (req, res) => {
  res.send("Login Successful");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {

  console.log("Server running on http://localhost:3000");
});
