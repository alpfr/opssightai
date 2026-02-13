/**
 * JHB StreamPulse CSV Parser
 * Parses the complex multi-service side-by-side CSV format
 * where 4 services share columns in each row.
 */

/* ── Helpers ────────────────────────────────────────────────────────── */

function parseVal(v) {
  if (!v || v.trim() === "" || v.trim() === "N/A") return 0;
  const n = parseInt(v.trim().replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function parseDate(d) {
  if (!d) return null;
  d = d.trim();
  // Try M/D/YYYY
  const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let [, month, day, year] = m;
  if (year.length === 2) year = "20" + year;
  if (parseInt(year) < 2020 || parseInt(year) > 2030) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/* ── Platform mappings per service ──────────────────────────────────── */

const PLAT_MAP = {
  insights: {
    Youtube: "youtube", "Youtube ": "youtube",
    Facebook: "facebook", "Facebook ": "facebook",
    "X (formerly Twitter)": "x",
    Instagram: "instagram", "Instagram ": "instagram",
    "PT's YouTube": "pt_youtube", "PT\u2019s YouTube": "pt_youtube",
  },
  jhb: {
    Youtube: "youtube",
    Facebook: "facebook",
    "X (formerly Twitter)": "x",
    Instagram: "instagram",
    Telegram: "telegram",
    Emerge: "emerge", "Emerge YouTube": "emerge",
    BoxCast: "boxcast",
  },
  charlotte: {
    Youtube: "youtube",
    Facebook: "facebook",
    "X (formerly Twitter)": "x",
    Instagram: "instagram",
    Telegram: "telegram",
  },
  biblestudy: {
    Youtube: "youtube", "Youtube ": "youtube",
    Facebook: "facebook", "Facebook ": "facebook",
    "X (formerly Twitter)": "x",
    Instagram: "instagram",
    Telegram: "telegram",
    Zoom: "zoom",
    BoxCast: "boxcast",
  },
};

// Column ranges: [labelCol, dateStart, dateEndExcl]
const SVC_RANGES = {
  insights:   [0,  1,  7],
  jhb:        [7,  8,  14],
  charlotte:  [14, 15, 21],
  biblestudy: [21, 22, 27],
};

/* ── Main parse function ────────────────────────────────────────────── */

export function parseCSV(csvText) {
  // Split into rows, handle both \r\n and \n
  const rawRows = csvText.split(/\r?\n/);

  // Simple CSV field splitter (handles quoted fields)
  const rows = rawRows.map((line) => {
    const fields = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
    fields.push(field);
    // Pad to 27 columns
    while (fields.length < 27) fields.push("");
    return fields;
  });

  // Find where "Special Programs" section starts
  let specialStart = rows.length;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0].includes("Special Programs")) {
      specialStart = i;
      break;
    }
  }

  const services = { insights: [], jhb: [], charlotte: [], biblestudy: [] };

  /* ── Parse regular monthly blocks ─────────────────────────────────── */
  let i = 0;
  while (i < specialStart) {
    const row = rows[i];

    // Find dates for each service in this row
    const allDates = {};
    for (const [svc, [_lcol, dstart, dend]] of Object.entries(SVC_RANGES)) {
      const dates = [];
      for (let c = dstart; c < dend; c++) {
        const d = parseDate(row[c]);
        if (d) dates.push([c, d]);
      }
      if (dates.length > 0) allDates[svc] = dates;
    }

    if (Object.keys(allDates).length === 0) { i++; continue; }

    // Read platform rows below
    let j = i + 1;
    const platformRows = [];
    while (j < specialStart && j < i + 12) {
      const prow = rows[j];
      const allEmpty = [0, 7, 14, 21].every(
        (c) => !prow[c] || prow[c].trim() === ""
      );
      const isTotal =
        prow[0].trim() === "" &&
        [1, 2, 3, 4, 5, 6].some((c) => parseVal(prow[c]) > 0);
      if (isTotal || (allEmpty && j > i + 1)) break;
      platformRows.push(prow);
      j++;
    }

    // Extract data per service
    for (const [svc, dateCols] of Object.entries(allDates)) {
      const [lcol, ,] = SVC_RANGES[svc];
      const pmap = PLAT_MAP[svc];

      for (const [col, date] of dateCols) {
        const entry = {
          service: svc,
          date,
          month: date.slice(0, 7),
          youtube: 0, facebook: 0, x: 0, instagram: 0,
          telegram: 0, emerge: 0, boxcast: 0, pt_youtube: 0, zoom: 0,
          total: 0,
        };

        let total = 0;
        for (const prow of platformRows) {
          const pname = prow[lcol].trim();
          if (pname in pmap) {
            const pk = pmap[pname];
            const val = parseVal(prow[col]);
            entry[pk] = val;
            total += val;
          }
        }
        entry.total = total;
        if (total > 0) services[svc].push(entry);
      }
    }

    i = j + 1;
  }

  /* ── Parse special events ─────────────────────────────────────────── */
  const specialEvents = [];

  // Helper: find row starting from index with text matching
  function findRow(startIdx, match) {
    for (let k = startIdx; k < rows.length; k++) {
      if (rows[k][0].includes(match)) return k;
    }
    return -1;
  }

  // Helper: find row with dual match (contextMatch in nearby rows above rowMatch)
  function findRowBelow(startIdx, contextMatch, rowMatch) {
    const ctx = contextMatch.toLowerCase();
    for (let k = startIdx; k < rows.length; k++) {
      if (rows[k][0].includes(rowMatch)) {
        // Check that contextMatch appears in the 3 rows above (case-insensitive)
        for (let b = Math.max(startIdx, k - 3); b < k; b++) {
          if (rows[b][0].toLowerCase().includes(ctx)) return k;
        }
      }
    }
    return -1;
  }

  const STD_PLAT = {
    Youtube: "youtube", Facebook: "facebook",
    "X (formerly Twitter)": "x", Instagram: "instagram",
    Telegram: "telegram", BoxCast: "boxcast",
  };

  // Helper: parse platform data from rows below a header
  function parsePlatformBlock(startRow, numDateCols, platMap) {
    const pdata = {};
    const pmap = platMap || STD_PLAT;
    for (let k = startRow; k < Math.min(startRow + 8, rows.length); k++) {
      const pname = rows[k][0].trim();
      if (pname in pmap) {
        pdata[pmap[pname]] = [];
        for (let c = 1; c <= numDateCols; c++) {
          pdata[pmap[pname]].push(parseVal(rows[k][c]));
        }
      }
    }
    return pdata;
  }

  // Helper: build event entries from platform data and date labels
  function buildEventEntries(dateLabels, pdata) {
    return dateLabels.map((dl, wi) => {
      const entry = { date: dl, youtube: 0, facebook: 0, x: 0, instagram: 0, telegram: 0, boxcast: 0, total: 0 };
      let t = 0;
      for (const [pk, vals] of Object.entries(pdata)) {
        const v = vals[wi] || 0;
        entry[pk] = v;
        t += v;
      }
      entry.total = t;
      return entry;
    });
  }

  // Helper: push event only if it has non-zero data
  function pushIfData(name, dates, entries) {
    const total = entries.reduce((s, e) => s + e.total, 0);
    if (total > 0) {
      specialEvents.push({ name, dates, data: entries });
    }
  }

  /* ── 14 Days of Glory (JHB) ────────────────────────────────────────── */
  let idx = findRow(specialStart, "14 DOG");
  if (idx >= 0 && !rows[idx][0].includes("Charlotte")) {
    const dates = [];
    for (let c = 1; c <= 14; c++) { const d = parseDate(rows[idx][c]); if (d) dates.push(d); }
    const pdata = parsePlatformBlock(idx + 1, dates.length, STD_PLAT);
    const edata = dates.map((date, wi) => {
      const entry = { date: date.slice(5), youtube: 0, facebook: 0, x: 0, instagram: 0, telegram: 0, total: 0 };
      let t = 0;
      for (const [pk, vals] of Object.entries(pdata)) { const v = vals[wi] || 0; entry[pk] = v; t += v; }
      entry.total = t;
      return entry;
    });
    pushIfData("14 Days of Glory (JHB)", "Jan 19 – Feb 1, 2025", edata);
  }

  /* ── 14 Days of Glory (Charlotte) ──────────────────────────────────── */
  idx = findRow(specialStart, "Charlotte January 2025 - 14 DOG");
  if (idx < 0) idx = findRow(specialStart, "Charlotte.*14 DOG");
  if (idx >= 0) {
    const dates = [];
    for (let c = 1; c <= 14; c++) { const d = parseDate(rows[idx][c]); if (d) dates.push(d); }
    const pdata = parsePlatformBlock(idx + 1, dates.length, STD_PLAT);
    const edata = dates.map((date, wi) => {
      const entry = { date: date.slice(5), youtube: 0, facebook: 0, x: 0, instagram: 0, telegram: 0, total: 0 };
      let t = 0;
      for (const [pk, vals] of Object.entries(pdata)) { const v = vals[wi] || 0; entry[pk] = v; t += v; }
      entry.total = t;
      return entry;
    });
    pushIfData("14 Days of Glory (Charlotte)", "Jan 19 – Feb 1, 2025", edata);
  }

  /* ── Solution Night Services (JHB) ─────────────────────────────────── */
  for (let k = specialStart; k < rows.length; k++) {
    if (rows[k][0].trim() === "Solution Night Services" && rows[k][1]?.includes("January")) {
      // Check if preceded by "Jesus House Baltimore" (not Charlotte)
      let isJHB = false;
      for (let b = Math.max(specialStart, k - 3); b < k; b++) {
        if (rows[b][0].includes("Baltimore") || rows[b][0].includes("Jesus House B")) isJHB = true;
      }
      if (!isJHB && k > specialStart) isJHB = true; // First occurrence = JHB
      if (!isJHB) continue;

      const monthLabels = [];
      for (let c = 1; c <= 12; c++) monthLabels.push(rows[k][c]?.trim() || "");
      const pdata = parsePlatformBlock(k + 1, 12, STD_PLAT);
      const edata = [];
      for (let mi = 0; mi < monthLabels.length; mi++) {
        if (!monthLabels[mi]) continue;
        const entry = { date: monthLabels[mi].slice(0, 3), youtube: 0, facebook: 0, x: 0, instagram: 0, telegram: 0, boxcast: 0, total: 0 };
        let t = 0;
        for (const [pk, vals] of Object.entries(pdata)) { const v = vals[mi] || 0; entry[pk] = v; t += v; }
        entry.total = t;
        if (t > 0) edata.push(entry);
      }
      pushIfData("Solution Night Services (JHB)", "2025 Monthly", edata);
      break;
    }
  }

  /* ── The Word Works Conference 2025 (JHB) ──────────────────────────── */
  idx = findRowBelow(specialStart, "Baltimore", "Word Works Conference");
  if (idx >= 0) {
    const dateLabels = [];
    for (let c = 1; c <= 6; c++) { const l = rows[idx][c]?.trim(); if (l) dateLabels.push(l.replace(/th|st|nd|rd/, "")); }
    const pdata = parsePlatformBlock(idx + 1, dateLabels.length, STD_PLAT);
    pushIfData("The Word Works Conference (JHB)", "Mar 24–28, 2025", buildEventEntries(dateLabels, pdata));
  }

  /* ── The Word Works Conference 2025 (Charlotte) ────────────────────── */
  idx = findRowBelow(specialStart, "Charlotte", "Word Works Conference");
  if (idx >= 0) {
    const dateLabels = [];
    for (let c = 1; c <= 6; c++) { const l = rows[idx][c]?.trim(); if (l) dateLabels.push(l.replace(/th|st|nd|rd/, "")); }
    const pdata = parsePlatformBlock(idx + 1, dateLabels.length, STD_PLAT);
    pushIfData("The Word Works Conference (Charlotte)", "Mar 24–28, 2025", buildEventEntries(dateLabels, pdata));
  }

  /* ── MYPC Conference 2025 (JHB) ────────────────────────────────────── */
  idx = findRowBelow(specialStart, "Baltimore", "MYPC Conference");
  if (idx >= 0) {
    const dateLabels = [];
    for (let c = 1; c <= 5; c++) { const l = rows[idx][c]?.trim(); if (l) dateLabels.push(l.replace(/th|st|nd|rd/, "")); }
    const pdata = parsePlatformBlock(idx + 1, dateLabels.length, STD_PLAT);
    pushIfData("MYPC Conference (JHB)", "Jun 2–4, 2025", buildEventEntries(dateLabels, pdata));
  }

  /* ── MYPC Conference 2025 (Charlotte) ──────────────────────────────── */
  idx = findRowBelow(specialStart, "Charlotte", "MYPC Conference");
  if (idx >= 0) {
    const dateLabels = [];
    for (let c = 1; c <= 5; c++) { const l = rows[idx][c]?.trim(); if (l) dateLabels.push(l.replace(/th|st|nd|rd/, "")); }
    const pdata = parsePlatformBlock(idx + 1, dateLabels.length, STD_PLAT);
    pushIfData("MYPC Conference (Charlotte)", "Jun 2–4, 2025", buildEventEntries(dateLabels, pdata));
  }

  /* ── PENIEL 2025 (JHB) ────────────────────────────────────────────── */
  idx = findRowBelow(specialStart, "Baltimore", "PENIEL 2025");
  if (idx >= 0) {
    const dateLabels = [];
    for (let c = 1; c <= 5; c++) { const l = rows[idx][c]?.trim(); if (l) dateLabels.push(l.replace(/th|st|nd|rd/, "")); }
    const pdata = parsePlatformBlock(idx + 1, dateLabels.length, STD_PLAT);
    pushIfData("PENIEL 2025 (JHB)", "Jul 31 – Aug 2, 2025", buildEventEntries(dateLabels, pdata));
  }

  /* ── PENIEL 2025 (Charlotte) ───────────────────────────────────────── */
  idx = findRowBelow(specialStart, "Charlotte", "PENIEL 2025");
  if (idx >= 0) {
    const dateLabels = [];
    for (let c = 1; c <= 5; c++) { const l = rows[idx][c]?.trim(); if (l) dateLabels.push(l.replace(/th|st|nd|rd/, "")); }
    const pdata = parsePlatformBlock(idx + 1, dateLabels.length, STD_PLAT);
    pushIfData("PENIEL 2025 (Charlotte)", "Jul 31 – Aug 2, 2025", buildEventEntries(dateLabels, pdata));
  }

  /* ── GLC 2025 ──────────────────────────────────────────────────────── */
  idx = findRow(specialStart, "GLC 2025 - DAY1");
  if (idx >= 0) {
    // GLC has a unique session format — aggregate the speaker viewer counts
    // Row structure: Speakers row with dates, then speaker rows with viewer counts
    const speakersRow = idx + 1; // "Speakers, Sept 26th, ..."
    // Day 1 sessions
    const day1Sessions = [];
    const day2Sessions = [];
    for (let k = idx + 2; k < Math.min(idx + 15, rows.length); k++) {
      const label = rows[k][0].trim();
      const val1 = parseVal(rows[k][1]); // Day 1 column
      const val2 = parseVal(rows[k][4]); // Day 2 column
      if (val1 > 0) day1Sessions.push({ speaker: label, viewers: val1 });
      if (val2 > 0) day2Sessions.push({ speaker: label, viewers: val2 });
    }
    const edata = [];
    if (day1Sessions.length) {
      const total = day1Sessions.reduce((s, d) => s + d.viewers, 0);
      edata.push({ date: "Sep 26", youtube: total, facebook: 0, x: 0, instagram: 0, telegram: 0, total });
    }
    if (day2Sessions.length) {
      const total = day2Sessions.reduce((s, d) => s + d.viewers, 0);
      edata.push({ date: "Sep 27", youtube: total, facebook: 0, x: 0, instagram: 0, telegram: 0, total });
    }
    pushIfData("GLC 2025", "Sep 26–27, 2025", edata);
  }

  /* ── Watch Night Service (JHB) ─────────────────────────────────────── */
  for (let k = specialStart; k < rows.length; k++) {
    if (rows[k][0].includes("Watch Night") && k > 0 && rows[k - 1][0].includes("Baltimore")) {
      const pdata = {};
      for (let j2 = k + 1; j2 < Math.min(k + 7, rows.length); j2++) {
        const pname = rows[j2][0].trim();
        if (pname in STD_PLAT) pdata[STD_PLAT[pname]] = parseVal(rows[j2][1]);
      }
      let total = 0;
      const entry = { date: "12-31", youtube: 0, facebook: 0, x: 0, instagram: 0, telegram: 0, total: 0 };
      for (const [pk, v] of Object.entries(pdata)) { entry[pk] = v; total += v; }
      entry.total = total;
      pushIfData("Watch Night Service (JHB)", "Dec 31, 2025", [entry]);
      break;
    }
  }

  /* ── Watch Night Service (Charlotte) ───────────────────────────────── */
  for (let k = specialStart; k < rows.length; k++) {
    if (rows[k][0].includes("Watch Night") && k > 0 && rows[k - 1][0].toLowerCase().includes("charlotte")) {
      const pdata = {};
      for (let j2 = k + 1; j2 < Math.min(k + 7, rows.length); j2++) {
        const pname = rows[j2][0].trim();
        if (pname in STD_PLAT) pdata[STD_PLAT[pname]] = parseVal(rows[j2][1]);
      }
      let total = 0;
      const entry = { date: "12-31", youtube: 0, facebook: 0, x: 0, instagram: 0, telegram: 0, total: 0 };
      for (const [pk, v] of Object.entries(pdata)) { entry[pk] = v; total += v; }
      entry.total = total;
      pushIfData("Watch Night Service (Charlotte)", "Dec 31, 2025", [entry]);
      break;
    }
  }

  /* ── Summary ──────────────────────────────────────────────────────── */
  const summary = {};
  for (const [svc, entries] of Object.entries(services)) {
    summary[svc] = {
      weeks: entries.length,
      dateRange: entries.length ? [entries[0].date, entries[entries.length - 1].date] : [],
      totalViewers: entries.reduce((s, e) => s + e.total, 0),
    };
  }

  return {
    services,
    specialEvents,
    summary,
    totalRows: Object.values(services).reduce((s, a) => s + a.length, 0),
  };
}
