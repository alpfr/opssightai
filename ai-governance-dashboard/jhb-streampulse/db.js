import initSqlJs from "sql.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = join(DATA_DIR, "streampulse.db");

let db = null;

export async function initDB() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    db = new SQL.Database(readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run("PRAGMA foreign_keys = ON");
  db.run(`CREATE TABLE IF NOT EXISTS weekly_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT, service TEXT NOT NULL, date TEXT NOT NULL, month TEXT NOT NULL,
    youtube INTEGER DEFAULT 0, facebook INTEGER DEFAULT 0, x INTEGER DEFAULT 0, instagram INTEGER DEFAULT 0,
    telegram INTEGER DEFAULT 0, emerge INTEGER DEFAULT 0, boxcast INTEGER DEFAULT 0, pt_youtube INTEGER DEFAULT 0,
    zoom INTEGER DEFAULT 0, total INTEGER DEFAULT 0, UNIQUE(service, date))`);
  db.run(`CREATE TABLE IF NOT EXISTS special_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, dates_label TEXT NOT NULL, UNIQUE(name, dates_label))`);
  db.run(`CREATE TABLE IF NOT EXISTS special_event_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL REFERENCES special_events(id) ON DELETE CASCADE,
    date TEXT NOT NULL, youtube INTEGER DEFAULT 0, facebook INTEGER DEFAULT 0, x INTEGER DEFAULT 0,
    instagram INTEGER DEFAULT 0, telegram INTEGER DEFAULT 0, emerge INTEGER DEFAULT 0, boxcast INTEGER DEFAULT 0,
    pt_youtube INTEGER DEFAULT 0, zoom INTEGER DEFAULT 0, total INTEGER DEFAULT 0, UNIQUE(event_id, date))`);
  db.run(`CREATE TABLE IF NOT EXISTS upload_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    mode TEXT NOT NULL, rows_added INTEGER DEFAULT 0, rows_updated INTEGER DEFAULT 0, rows_total INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS ai_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT, generated_at TEXT NOT NULL DEFAULT (datetime('now')),
    trigger_type TEXT NOT NULL DEFAULT 'upload', summary TEXT NOT NULL, highlights TEXT,
    alerts TEXT, raw_prompt_tokens INTEGER DEFAULT 0, raw_completion_tokens INTEGER DEFAULT 0)`);
  db.run("CREATE INDEX IF NOT EXISTS idx_weekly_service ON weekly_data(service)");
  db.run("CREATE INDEX IF NOT EXISTS idx_weekly_date ON weekly_data(date)");
  save();
  return db;
}

function save() { if (db) writeFileSync(DB_PATH, Buffer.from(db.export())); }

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}
function queryOne(sql, params = []) { return queryAll(sql, params)[0] || null; }

const COLS = "service, date, month, youtube, facebook, x, instagram, telegram, emerge, boxcast, pt_youtube, zoom, total";
function rowVals(r) {
  return [r.service, r.date, r.month || r.date.slice(0,7),
    r.youtube||0, r.facebook||0, r.x||0, r.instagram||0, r.telegram||0,
    r.emerge||0, r.boxcast||0, r.pt_youtube||0, r.zoom||0, r.total||0];
}
function updateVals(r) {
  return [r.month || r.date.slice(0,7), r.youtube||0, r.facebook||0, r.x||0, r.instagram||0,
    r.telegram||0, r.emerge||0, r.boxcast||0, r.pt_youtube||0, r.zoom||0, r.total||0];
}

export function upsertWeeklyBatch(rows) {
  let added = 0, updated = 0;
  db.run("BEGIN TRANSACTION");
  try {
    for (const row of rows) {
      const existing = queryOne("SELECT id FROM weekly_data WHERE service=? AND date=?", [row.service, row.date]);
      db.run(`INSERT INTO weekly_data (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(service,date) DO UPDATE SET month=?,youtube=?,facebook=?,x=?,instagram=?,telegram=?,emerge=?,boxcast=?,pt_youtube=?,zoom=?,total=?`,
        [...rowVals(row), ...updateVals(row)]);
      if (existing) updated++; else added++;
    }
    db.run("COMMIT");
  } catch(e) { db.run("ROLLBACK"); throw e; }
  save();
  return { added, updated };
}

export function replaceAllWeekly(rows) {
  db.run("BEGIN TRANSACTION");
  try {
    db.run("DELETE FROM weekly_data");
    for (const row of rows) {
      db.run(`INSERT INTO weekly_data (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, rowVals(row));
    }
    db.run("COMMIT");
  } catch(e) { db.run("ROLLBACK"); throw e; }
  save();
  return { added: rows.length, updated: 0 };
}

export function getWeeklyData() {
  const rows = queryAll("SELECT * FROM weekly_data ORDER BY service, date ASC");
  const grouped = {};
  for (const r of rows) { if (!grouped[r.service]) grouped[r.service] = []; grouped[r.service].push(r); }
  return grouped;
}

export function getWeeklyByService(svc) {
  return queryAll("SELECT * FROM weekly_data WHERE service=? ORDER BY date ASC", [svc]);
}

export function upsertSpecialEvent(ev) {
  db.run(`INSERT INTO special_events (name,dates_label) VALUES (?,?) ON CONFLICT(name,dates_label) DO UPDATE SET name=name`, [ev.name, ev.dates]);
  const row = queryOne("SELECT id FROM special_events WHERE name=? AND dates_label=?", [ev.name, ev.dates]);
  const eid = row.id;
  for (const d of ev.data) {
    const vals = [eid, d.date, d.youtube||0, d.facebook||0, d.x||0, d.instagram||0, d.telegram||0, d.emerge||0, d.boxcast||0, d.pt_youtube||0, d.zoom||0, d.total||0];
    const uvals = [d.youtube||0, d.facebook||0, d.x||0, d.instagram||0, d.telegram||0, d.emerge||0, d.boxcast||0, d.pt_youtube||0, d.zoom||0, d.total||0];
    db.run(`INSERT INTO special_event_data (event_id,date,youtube,facebook,x,instagram,telegram,emerge,boxcast,pt_youtube,zoom,total)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(event_id,date) DO UPDATE SET
      youtube=?,facebook=?,x=?,instagram=?,telegram=?,emerge=?,boxcast=?,pt_youtube=?,zoom=?,total=?`, [...vals, ...uvals]);
  }
  save();
}

export function replaceAllEvents(events) {
  db.run("DELETE FROM special_event_data");
  db.run("DELETE FROM special_events");
  for (const ev of events) upsertSpecialEvent(ev);
}

export function getSpecialEvents() {
  return queryAll("SELECT * FROM special_events ORDER BY id ASC").map(ev => ({
    id: ev.id, name: ev.name, dates: ev.dates_label,
    data: queryAll("SELECT * FROM special_event_data WHERE event_id=? ORDER BY date ASC", [ev.id]),
  }));
}

export function logUpload(info) {
  db.run("INSERT INTO upload_history (filename,mode,rows_added,rows_updated,rows_total) VALUES (?,?,?,?,?)",
    [info.filename, info.mode, info.rows_added, info.rows_updated, info.rows_total]);
  save();
}

export function getUploadHistory() { return queryAll("SELECT * FROM upload_history ORDER BY uploaded_at DESC LIMIT 20"); }

export function getStats() {
  return {
    weeklyRows: (queryOne("SELECT COUNT(*) as c FROM weekly_data"))?.c || 0,
    specialEvents: (queryOne("SELECT COUNT(*) as c FROM special_events"))?.c || 0,
  };
}

export function deleteServiceData(svc) { db.run("DELETE FROM weekly_data WHERE service=?", [svc]); save(); }

/* ── AI Insights ───────────────────────────────────────────────────── */
export function saveInsight({ trigger_type, summary, highlights, alerts, prompt_tokens, completion_tokens }) {
  db.run(`INSERT INTO ai_insights (trigger_type, summary, highlights, alerts, raw_prompt_tokens, raw_completion_tokens)
    VALUES (?,?,?,?,?,?)`, [trigger_type || "upload", summary, highlights || "[]", alerts || "[]", prompt_tokens || 0, completion_tokens || 0]);
  save();
}

export function getLatestInsight() {
  return queryOne("SELECT * FROM ai_insights ORDER BY generated_at DESC LIMIT 1");
}

export function getInsightHistory(limit = 10) {
  return queryAll("SELECT id, generated_at, trigger_type, summary FROM ai_insights ORDER BY generated_at DESC LIMIT ?", [limit]);
}
