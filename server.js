import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Basic rate limiter to avoid abuse of API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120 // maximum 120 requests per minute
});
app.use("/api/", apiLimiter);

// Configure file uploads. Uploaded files live in uploads/ until parsed.
const upload = multer({ dest: "uploads/" });

// Helper: parse CSV/XLSX into array of recipient objects
function parseSheet(filePath) {
  const workbook = XLSX.readFile(filePath, { raw: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  // Normalize keys to lowercase for easier lookup
  return rows
    .map((row) => {
      const normalized = Object.keys(row).reduce((acc, key) => {
        acc[key.toLowerCase().trim()] = row[key];
        return acc;
      }, {});
      const email =
        normalized.email || normalized.emails || normalized["e-mail"] || "";
      const name =
        normalized.name ||
        normalized.fullname ||
        normalized.firstname ||
        normalized["first name"] ||
        "";
      return {
        email: String(email || "").trim(),
        name: String(name || "").trim()
      };
    })
    .filter((r) => r.email);
}

// Helper: replace {{name}} tokens in an HTML template
function personalize(html, name) {
  const safeName = name || "there";
  return html.replace(/\{\{\s*name\s*\}\}/gi, safeName);
}

// Helper: sleep for a given number of milliseconds
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: configure nodemailer transporter from env vars
function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100
  });
}

// --- Routes ---

// Serve the client application
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle CSV/XLSX uploads and return parsed recipients
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const recipients = parseSheet(req.file.path);
    // Remove the temporary file after parsing
    fs.unlink(req.file.path, () => {});
    return res.json({ count: recipients.length, recipients });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Preview personalized HTML without sending emails
app.post("/api/preview", async (req, res) => {
  const { htmlTemplate, recipients = [] } = req.body || {};
  if (!htmlTemplate) {
    return res.status(400).json({ error: "htmlTemplate is required" });
  }
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "recipients array required" });
  }
  // Limit previews to first 20 to avoid huge payloads
  const previews = recipients.slice(0, 20).map((r) => {
    return {
      email: r.email,
      name: r.name,
      html: personalize(htmlTemplate, r.name || "")
    };
  });
  return res.json({ total: recipients.length, previewed: previews.length, previews });
});

// Send emails to provided recipients
app.post("/api/send", async (req, res) => {
  const {
    subject,
    fromName,
    fromEmail,
    htmlTemplate,
    recipients = [],
    testMode = false
  } = req.body || {};

  // Validate required fields
  if (!subject || !fromEmail || !htmlTemplate) {
    return res.status(400).json({ error: "subject, fromEmail, htmlTemplate required" });
  }
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "recipients array required" });
  }

  const MAX_PER_BATCH = Number(process.env.MAX_PER_BATCH || 200);
  if (recipients.length > MAX_PER_BATCH) {
    return res.status(400).json({ error: `Limit ${MAX_PER_BATCH} recipients per batch` });
  }

  const transport = buildTransport();
  const delay = Number(process.env.SEND_DELAY_MS || 400);

  const results = [];
  for (const recipient of recipients) {
    const to = recipient.email;
    const name = recipient.name || "";

    if (testMode && results.length >= 5) break;
    try {
      const info = await transport.sendMail({
        to,
        from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
        subject,
        html: personalize(htmlTemplate, name)
      });
      results.push({ to, status: "sent", id: info.messageId || null });
    } catch (err) {
      results.push({ to, status: "failed", error: String(err.message || err) });
    }
    // Sleep to throttle sends
    if (delay > 0) await sleep(delay);
  }

  return res.json({
    totalRequested: recipients.length,
    totalAttempted: results.length,
    sent: results.filter((r) => r.status === "sent").length,
    failed: results.filter((r) => r.status === "failed").length,
    results
  });
});

// Fallback error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal error" });
});

// Start the server
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Email Blast Tool running on http://localhost:${PORT}`);
});