import express from "express";
import cors from "cors";
import multer from "multer";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  initDB,
  getWeeklyData,
  getWeeklyByService,
  getSpecialEvents,
  upsertWeeklyBatch,
  replaceAllWeekly,
  upsertSpecialEvent,
  replaceAllEvents,
  logUpload,
  getUploadHistory,
  getStats,
  deleteServiceData,
} from "./db.js";
import { parseCSV } from "./csv-parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";

app.use(cors());
app.use(express.json());

/* ── Multer for CSV uploads ─────────────────────────────────────────── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

/* ── Auth middleware ─────────────────────────────────────────────────── */
function requireAdmin(req, res, next) {
  const pin = req.headers["x-admin-pin"] || req.body?.pin;
  if (pin !== ADMIN_PIN) {
    return res.status(401).json({ error: "Invalid admin PIN" });
  }
  next();
}

/* ═══════════════════════════════════════════════════════════════════════
   API ROUTES
   ═══════════════════════════════════════════════════════════════════════ */

/* ── GET /api/data — All weekly data + special events ───────────────── */
app.get("/api/data", (_req, res) => {
  try {
    const data = getWeeklyData();
    const events = getSpecialEvents();
    res.json({ data, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/data — Manual entry (add/update individual rows) ─────── */
app.post("/api/data", requireAdmin, (req, res) => {
  try {
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: "entries array required" });
    }
    const rows = entries.map((e) => ({
      service: e.service,
      date: e.date,
      month: e.month || e.date.slice(0, 7),
      youtube: e.youtube || 0,
      facebook: e.facebook || 0,
      x: e.x || 0,
      instagram: e.instagram || 0,
      telegram: e.telegram || 0,
      emerge: e.emerge || 0,
      boxcast: e.boxcast || 0,
      pt_youtube: e.pt_youtube || 0,
      zoom: e.zoom || 0,
      total: e.total || 0,
    }));
    const result = upsertWeeklyBatch(rows);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/data/:service — Weekly data for one service ───────────── */
app.get("/api/data/:service", (req, res) => {
  try {
    const rows = getWeeklyByService(req.params.service);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/special-events — All special events ───────────────────── */
app.get("/api/special-events", (_req, res) => {
  try {
    const events = getSpecialEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/stats — Summary statistics ────────────────────────────── */
app.get("/api/stats", (_req, res) => {
  try {
    const stats = getStats();
    const history = getUploadHistory();
    res.json({ ...stats, lastUpload: history[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/uploads — Upload history ──────────────────────────────── */
app.get("/api/uploads", (_req, res) => {
  try {
    res.json(getUploadHistory());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/auth — Verify admin PIN ──────────────────────────────── */
app.post("/api/auth", (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid PIN" });
  }
});

/* ── POST /api/upload — CSV upload (replace/append) ─────────────────── */
app.post("/api/upload", requireAdmin, upload.single("csv"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No CSV file provided" });

    const mode = req.body.mode || "append"; // "replace" or "append"
    const csvText = req.file.buffer.toString("utf-8");
    const parsed = parseCSV(csvText);

    if (parsed.totalRows === 0) {
      return res.status(400).json({ error: "No data found in CSV. Check format." });
    }

    // Flatten services into rows
    const allRows = [];
    for (const [svc, entries] of Object.entries(parsed.services)) {
      for (const entry of entries) {
        allRows.push({ ...entry, service: svc });
      }
    }

    let result;
    if (mode === "replace") {
      result = replaceAllWeekly(allRows);
      if (parsed.specialEvents.length > 0) {
        replaceAllEvents(parsed.specialEvents);
      }
    } else {
      // append/merge — upsert (update existing, add new)
      result = upsertWeeklyBatch(allRows);
      for (const ev of parsed.specialEvents) {
        upsertSpecialEvent(ev);
      }
    }

    // Log the upload
    logUpload({
      filename: req.file.originalname,
      mode,
      rows_added: result.added,
      rows_updated: result.updated,
      rows_total: allRows.length,
    });

    res.json({
      success: true,
      mode,
      filename: req.file.originalname,
      ...result,
      rows: allRows.length,
      totalProcessed: allRows.length,
      specialEvents: parsed.specialEvents.length,
      stats: parsed.summary,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/export — Export current data as CSV ───────────────────── */
app.get("/api/export", (_req, res) => {
  try {
    const data = getWeeklyData();
    const services = Object.keys(data);

    // Build CSV
    const headers = [
      "service", "date", "month",
      "youtube", "facebook", "x", "instagram",
      "telegram", "emerge", "boxcast", "pt_youtube", "zoom", "total",
    ];

    let csv = headers.join(",") + "\n";
    for (const svc of services) {
      for (const row of data[svc]) {
        csv += headers.map((h) => row[h] ?? 0).join(",") + "\n";
      }
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=streampulse_export.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /api/data/:service — Delete one service's data ──────────── */
app.delete("/api/data/:service", requireAdmin, (req, res) => {
  try {
    deleteServiceData(req.params.service);
    res.json({ success: true, deleted: req.params.service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════════════
   SERVE FRONTEND (production)
   ═══════════════════════════════════════════════════════════════════════ */

const publicDir = join(__dirname, "public");
if (existsSync(join(publicDir, "index.html"))) {
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(join(publicDir, "index.html"));
  });
}

/* ── Start ──────────────────────────────────────────────────────────── */
async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║   JHB StreamPulse Dashboard v2.0             ║
  ║   Server running on http://localhost:${PORT}     ║
  ║   API:  http://localhost:${PORT}/api/data        ║
  ╚══════════════════════════════════════════════╝
    `);
  });
}

start().catch(console.error);
