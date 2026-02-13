/**
 * Seed the database with existing 2025 + 2026 data.
 * Run: node seed.js
 * Or:  node seed.js /path/to/csv  (to import from a CSV file)
 */
import { readFileSync, existsSync } from "fs";
import {
  initDB,
  upsertWeeklyBatch,
  upsertSpecialEvent,
  getStats,
} from "./db.js";
import { parseCSV } from "./csv-parser.js";

await initDB();

const csvPath = process.argv[2];

if (csvPath && existsSync(csvPath)) {
  console.log(`\nImporting CSV: ${csvPath}`);
  const csvText = readFileSync(csvPath, "utf-8");
  const parsed = parseCSV(csvText);

  const allRows = [];
  for (const [svc, entries] of Object.entries(parsed.services)) {
    for (const entry of entries) allRows.push({ ...entry, service: svc });
  }

  const result = upsertWeeklyBatch(allRows);
  console.log(`  Weekly: ${result.added} added, ${result.updated} updated`);

  for (const ev of parsed.specialEvents) {
    upsertSpecialEvent(ev);
    console.log(`  Event: ${ev.name} (${ev.data.length} entries)`);
  }
} else {
  console.log("\nSeeding with built-in 2025 + 2026 data...");
  seedBuiltinData();
}

const stats = getStats();
console.log(`\nDatabase now contains:`);
console.log(`  Weekly data rows:  ${stats.weeklyRows}`);
console.log(`  Special events:    ${stats.specialEvents}`);
console.log(`  DB file: ./data/streampulse.db\n`);

/* ═══════════════════════════════════════════════════════════════════════ */

function seedBuiltinData() {
  // 2026 data (original dashboard data)
  const data2026 = {
    insights: [
      { date: "2026-01-02", youtube: 34, facebook: 93, x: 7, instagram: 40, pt_youtube: 4, total: 178 },
      { date: "2026-01-09", youtube: 63, facebook: 101, x: 2, instagram: 36, pt_youtube: 4, total: 206 },
      { date: "2026-01-16", youtube: 31, facebook: 92, x: 11, instagram: 21, pt_youtube: 9, total: 164 },
      { date: "2026-01-23", youtube: 35, facebook: 110, x: 16, instagram: 31, pt_youtube: 6, total: 198 },
      { date: "2026-01-30", youtube: 54, facebook: 97, x: 13, instagram: 29, pt_youtube: 10, total: 203 },
      { date: "2026-02-06", youtube: 40, facebook: 97, x: 4, instagram: 28, pt_youtube: 5, total: 174 },
    ],
    jhb: [
      { date: "2026-01-04", youtube: 893, facebook: 242, x: 13, instagram: 242, telegram: 2, emerge: 0, boxcast: 49, total: 1441 },
      { date: "2026-01-11", youtube: 580, facebook: 251, x: 6, instagram: 115, telegram: 2, emerge: 6, boxcast: 49, total: 1009 },
      { date: "2026-01-18", youtube: 532, facebook: 206, x: 13, instagram: 143, telegram: 2, emerge: 4, boxcast: 43, total: 943 },
      { date: "2026-01-25", youtube: 1151, facebook: 301, x: 29, instagram: 172, telegram: 2, emerge: 0, boxcast: 203, total: 1858 },
      { date: "2026-02-01", youtube: 670, facebook: 168, x: 15, instagram: 103, telegram: 2, emerge: 0, boxcast: 73, total: 1031 },
      { date: "2026-02-08", youtube: 481, facebook: 123, x: 3, instagram: 108, telegram: 3, emerge: 3, boxcast: 58, total: 779 },
    ],
    charlotte: [
      { date: "2026-01-04", youtube: 39, facebook: 4, x: 0, instagram: 36, telegram: 0, total: 79 },
      { date: "2026-01-11", youtube: 27, facebook: 7, x: 0, instagram: 23, telegram: 0, total: 57 },
      { date: "2026-01-18", youtube: 23, facebook: 6, x: 0, instagram: 8, telegram: 0, total: 37 },
      { date: "2026-01-25", youtube: 48, facebook: 11, x: 0, instagram: 22, telegram: 0, total: 81 },
      { date: "2026-02-01", youtube: 42, facebook: 12, x: 0, instagram: 13, telegram: 0, total: 67 },
      { date: "2026-02-08", youtube: 27, facebook: 4, x: 0, instagram: 16, telegram: 0, total: 47 },
    ],
    biblestudy: [
      { date: "2026-02-03", youtube: 175, facebook: 72, x: 2, instagram: 63, telegram: 1, zoom: 35, boxcast: 52, total: 400 },
      { date: "2026-02-10", youtube: 168, facebook: 83, x: 4, instagram: 59, telegram: 1, zoom: 42, boxcast: 51, total: 408 },
    ],
  };

  const specialEvents2026 = [
    {
      name: "14 Days of Glory (JHB)", dates: "Jan 18 – Feb 1, 2026",
      data: [
        { date: "01-25", youtube: 925, facebook: 268, x: 27, instagram: 172, telegram: 2, boxcast: 203, total: 1597 },
        { date: "01-26", youtube: 313, facebook: 153, x: 7, instagram: 112, telegram: 1, boxcast: 260, total: 846 },
        { date: "01-27", youtube: 305, facebook: 129, x: 10, instagram: 100, telegram: 1, boxcast: 262, total: 807 },
        { date: "01-28", youtube: 362, facebook: 120, x: 21, instagram: 79, telegram: 2, boxcast: 246, total: 830 },
        { date: "01-29", youtube: 388, facebook: 102, x: 6, instagram: 93, telegram: 1, boxcast: 204, total: 794 },
        { date: "01-30", youtube: 362, facebook: 106, x: 5, instagram: 64, telegram: 3, boxcast: 174, total: 714 },
        { date: "01-31", youtube: 301, facebook: 118, x: 7, instagram: 142, telegram: 1, boxcast: 107, total: 676 },
      ],
    },
  ];

  // Insert 2026 data
  const rows2026 = [];
  for (const [svc, entries] of Object.entries(data2026)) {
    for (const e of entries) {
      rows2026.push({
        service: svc,
        date: e.date,
        month: e.date.slice(0, 7),
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
      });
    }
  }

  const result = upsertWeeklyBatch(rows2026);
  console.log(`  2026 weekly: ${result.added} added`);

  for (const ev of specialEvents2026) {
    upsertSpecialEvent(ev);
    console.log(`  2026 event: ${ev.name}`);
  }
}
