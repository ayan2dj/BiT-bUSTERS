import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// To serve your frontend files (login.html etc.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// ---------------- GOOGLE OAUTH ----------------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "https://bit-busters.vercel.app/";

// Step 1: Redirect to Google's OAuth consent screen
app.get("/auth/google", (req, res) => {
  const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=openid%20email%20profile`;
  res.redirect(authURL);
});

// Step 2: Handle Google OAuth callback
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing OAuth code");

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error });
    }

    // Get user info
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const user = await userInfoResponse.json();

    // Redirect to frontend with user data stored in localStorage
    const redirectHTML = `
      <script>
        localStorage.setItem("user", JSON.stringify(${JSON.stringify(user)}));
        window.location.href = "/";
      </script>
    `;
    res.send(redirectHTML);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).send("OAuth Failed");
  }
});

// ---------------- DEFAULT ROUTE ----------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = 5500;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
