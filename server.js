// server.js
const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // serves login.html, callback.html, etc.

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * ===========================
 * GITHUB OAUTH FLOW
 * ===========================
 */
app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.json({ success: false, message: "No code provided" });
  }

  try {
    // Step 1: Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.json({ success: false, message: "Failed to get access token" });
    }

    const accessToken = tokenData.access_token;

    // Step 2: Fetch user data
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const userData = await userResponse.json();

    res.json({ success: true, user: userData });

  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    res.json({ success: false, message: "GitHub login failed" });
  }
});

/**
 * ===========================
 * GOOGLE OAUTH FLOW
 * ===========================
 */
app.post("/auth/google", async (req, res) => {
  const token = req.body.token;
  if (!token) return res.json({ success: false, message: "No token provided" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    res.json({
      success: true,
      user: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      }
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.json({ success: false, message: "Google login failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
