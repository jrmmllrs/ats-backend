// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const bodyParser = require("body-parser");
// const { google } = require("googleapis");
// require("dotenv").config(); // load .env variables

// const app = express();


// console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);

// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
//     credentials: true,
//   })
// );
// app.use(cookieParser());
// app.use(bodyParser.json());
// app.post("/auth/logout", (req, res) => {
//   try {
//     res.clearCookie("tokens", { path: "/" }); // remove the Google tokens cookie
//     return res.json({ success: true });
//   } catch (err) {
//     console.error("Logout error:", err);
//     res.status(500).json({ success: false });
//   }
// });

// // ✅ Initialize OAuth2 Client
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// // ✅ Scopes → added calendar.readonly
// const SCOPES = [
//   "https://www.googleapis.com/auth/calendar.events",
//   "https://www.googleapis.com/auth/calendar.readonly",
//   "https://www.googleapis.com/auth/userinfo.profile",
//   "https://www.googleapis.com/auth/userinfo.email",
//   "openid",
// ];

// // 1️⃣ Get Google OAuth URL
// app.get("/auth/url", (req, res) => {
//   try {
//     const url = oauth2Client.generateAuthUrl({
//       access_type: "offline",
//       prompt: "consent",
//       scope: SCOPES,
//     });
//     res.json({ url });
//   } catch (err) {
//     console.error("Error generating auth URL:", err);
//     res.status(500).json({ error: "Failed to generate auth URL" });
//   }
// });

// // 2️⃣ Handle Google OAuth callback
// app.get("/oauth2callback", async (req, res) => {
//   try {
//     const code = req.query.code;
//     if (!code) throw new Error("No code provided in callback");

//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     // Save tokens in a secure HTTP-only cookie
//     res.cookie("tokens", JSON.stringify(tokens), {
//       httpOnly: true,
//       secure: false, // ⚠️ set true in production (HTTPS)
//     });

//     // Redirect to frontend
//     const frontend = process.env.CLIENT_ORIGIN || "http://localhost:5173";
//     res.redirect(`${frontend}/?auth=success`);
//   } catch (err) {
//     console.error("OAuth2 callback error:", err);
//     res.status(500).send("Authentication failed");
//   }
// });

// // ✅ Helper: set OAuth credentials from cookies
// function setCredentialsFromCookies(req) {
//   const cookie = req.cookies.tokens;
//   if (!cookie) return false;
//   const tokens = JSON.parse(cookie);
//   oauth2Client.setCredentials(tokens);
//   return true;
// }

// // 3️⃣ Fetch appointments (Google Calendar events)
// app.get("/api/calendar/appointments", async (req, res) => {
//   try {
//     if (!setCredentialsFromCookies(req))
//       return res.status(401).json({ error: "Not authenticated" });

//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//     const response = await calendar.events.list({
//       calendarId: "primary",
//       timeMin: new Date().toISOString(), // upcoming events
//       maxResults: 20,
//       singleEvents: true,
//       orderBy: "startTime",
//     });

//     res.json({ events: response.data.items });
//   } catch (err) {
//     console.error("Error fetching appointments:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 4️⃣ Create a single event
// app.post("/api/calendar/event", async (req, res) => {
//   try {
//     if (!setCredentialsFromCookies(req)) {
//       return res.status(401).json({ error: "Not authenticated" });
//     }

//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });
//     const { event } = req.body;

//     const response = await calendar.events.insert({
//       calendarId: "primary",
//       resource: event,
//     });

//     res.json({ data: response.data });
//   } catch (err) {
//     console.error("Event creation error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 5️⃣ Bulk insert events
// app.post("/api/calendar/events/bulk", async (req, res) => {
//   try {
//     if (!setCredentialsFromCookies(req)) {
//       return res.status(401).json({ error: "Not authenticated" });
//     }

//     const calendar = google.calendar({ version: "v3", auth: oauth2Client });
//     const { events } = req.body;
//     const results = [];

//     for (const ev of events) {
//       const r = await calendar.events.insert({
//         calendarId: "primary",
//         resource: ev,
//       });
//       results.push(r.data);
//     }

//     res.json({ inserted: results.length, results });
//   } catch (err) {
//     console.error("Bulk insert error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 6️⃣ Get logged-in user info
// app.get("/api/me", async (req, res) => {
//   try {
//     if (!setCredentialsFromCookies(req)) {
//       return res.json({ authenticated: false });
//     }

//     const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
//     const userinfo = await oauth2.userinfo.get();
//     res.json({ authenticated: true, user: userinfo.data });
//   } catch (err) {
//     console.error("User info error:", err);
//     res.json({ authenticated: false });
//   }
// });