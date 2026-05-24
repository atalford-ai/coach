// Google Workspace Integration — Calendar + Sheets
// Uses Google Identity Services + gapi for API calls

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest',
];

// Client ID from Firebase project's Google Cloud Console
// Coach must enable Calendar API + Sheets API in Cloud Console
const CLIENT_ID = '931542784586-placeholder.apps.googleusercontent.com';

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient = null;
let accessToken = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function initGoogle() {
  await loadScript('https://apis.google.com/js/api.js');
  await loadScript('https://accounts.google.com/gsi/client');

  await new Promise((resolve) => {
    window.gapi.load('client', resolve);
  });

  await window.gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
  });
  gapiLoaded = true;

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: getClientId(),
    scope: SCOPES,
    callback: () => {},
  });
  gisLoaded = true;
}

function getClientId() {
  // Allow override via localStorage for easy config
  return localStorage.getItem('fs-google-client-id') || CLIENT_ID;
}

export function setClientId(id) {
  localStorage.setItem('fs-google-client-id', id);
}

export function getStoredClientId() {
  return localStorage.getItem('fs-google-client-id') || '';
}

export function isConnected() {
  return !!accessToken;
}

export async function connect() {
  if (!gapiLoaded || !gisLoaded) await initGoogle();

  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if (resp.error) { reject(resp); return; }
      accessToken = resp.access_token;
      localStorage.setItem('fs-google-connected', 'true');
      resolve(resp);
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function disconnect() {
  if (accessToken) {
    window.google.accounts.oauth2.revoke(accessToken);
  }
  accessToken = null;
  localStorage.removeItem('fs-google-connected');
}

// ── Google Calendar ──────────────────────────────────────────────────────────

export async function syncToCalendar(workouts, coachName) {
  if (!accessToken) throw new Error('Not connected to Google');

  const results = [];
  for (const w of workouts) {
    if (!w.date) continue;
    const event = {
      summary: `${w.name} — ${coachName || 'Practice'}`,
      description: (w.exercises || []).map(ex =>
        `${ex.name}${ex.sets ? ` — ${ex.sets}×${ex.reps}${ex.repsUnit || ''}` : ''}${ex.rest ? ` (${ex.rest}s rest)` : ''}`
      ).join('\n'),
      start: { date: w.date },
      end: { date: w.date },
      colorId: '9', // blueberry
    };

    try {
      const resp = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      results.push({ id: w.id, status: 'ok', eventId: resp.result.id });
    } catch (err) {
      results.push({ id: w.id, status: 'error', error: err.message });
    }
  }
  return results;
}

// ── Google Sheets ────────────────────────────────────────────────────────────

export async function exportToSheets(title, headers, rows) {
  if (!accessToken) throw new Error('Not connected to Google');

  // Create new spreadsheet
  const createResp = await window.gapi.client.sheets.spreadsheets.create({
    resource: {
      properties: { title },
    },
  });

  const spreadsheetId = createResp.result.spreadsheetId;
  const sheetUrl = createResp.result.spreadsheetUrl;

  // Write data
  const values = [headers, ...rows];
  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    resource: { values },
  });

  return { spreadsheetId, sheetUrl };
}

// ── Pre-built export helpers ─────────────────────────────────────────────────

export async function exportRoster(athletes, groups) {
  const headers = ['Name', 'Email', 'Events', 'Group', 'Connected'];
  const rows = athletes.map(a => {
    const grp = groups.find(g => g.id === a.groupId);
    return [
      a.name || '',
      a.email || '',
      (a.events || []).join(', '),
      grp?.name || '',
      a.linkedUserId ? 'Yes' : 'No',
    ];
  });
  return exportToSheets('FirstStep Roster', headers, rows);
}

export async function exportTimes(times, athletes) {
  const headers = ['Athlete', 'Event', 'Time', 'Date'];
  const rows = times.map(t => {
    const athlete = athletes.find(a => a.id === t.athleteId);
    return [
      athlete?.name || t.athleteName || '',
      t.event || '',
      t.time || '',
      t.date || '',
    ];
  });
  return exportToSheets('FirstStep Times', headers, rows);
}

export async function exportAttendance(attendance, athletes) {
  const headers = ['Date', 'Present', 'Total', 'Rate'];
  const rows = attendance.map(a => [
    a.date || '',
    String(a.present || 0),
    String(a.total || athletes.length),
    a.total ? `${Math.round((a.present / a.total) * 100)}%` : '',
  ]);
  return exportToSheets('FirstStep Attendance', headers, rows);
}

// ── CSV fallback (no Google connection needed) ───────────────────────────────

export function downloadCSV(filename, headers, rows) {
  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
