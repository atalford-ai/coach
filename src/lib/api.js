// ── Training Content APIs ──────────────────────────────────────
// Free APIs for pulling text + video training content

const WGER_BASE = 'https://wger.de/api/v2';
const PIPED_BASE = 'https://pipedapi.kavin.rocks';

// ── Wger Exercise API (free, no key) ──────────────────────────
export async function fetchExercises({ category, muscle, limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams({
    format: 'json', language: 2, limit: String(limit), offset: String(offset),
  });
  if (category) params.set('category', category);
  if (muscle) params.set('muscles', muscle);
  const res = await fetch(`${WGER_BASE}/exercise/?${params}`);
  if (!res.ok) throw new Error(`Wger API error: ${res.status}`);
  return res.json();
}

export async function fetchExerciseDetail(exerciseId) {
  const res = await fetch(`${WGER_BASE}/exerciseinfo/${exerciseId}/?format=json`);
  if (!res.ok) throw new Error(`Wger API error: ${res.status}`);
  return res.json();
}

export async function searchExercises(term, limit = 20) {
  const res = await fetch(`${WGER_BASE}/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`);
  if (!res.ok) throw new Error(`Wger API error: ${res.status}`);
  const data = await res.json();
  return data.suggestions || [];
}

// ── Video Search (multiple free YouTube proxy APIs, no key) ───
// Tries Piped instances, then Invidious instances, then returns fallback

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.projectsegfau.lt',
  'https://pipedapi.r4fo.com',
  'https://pipedapi.leptons.xyz',
];

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://invidious.materialio.us',
  'https://yewtu.be',
];

// Try Piped API
async function tryPiped(query) {
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(
        `${base}/search?q=${encodeURIComponent(query)}&filter=videos`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const items = (data.items || []).filter(v => v.type === 'stream').slice(0, 8);
      if (items.length === 0) continue;
      return items.map(v => ({
        id: v.url?.replace('/watch?v=', '') || '',
        title: v.title || '',
        thumbnail: v.thumbnail || '',
        duration: v.duration || 0,
        channel: v.uploaderName || '',
        views: v.views || 0,
      }));
    } catch { /* try next */ }
  }
  return null;
}

// Try Invidious API
async function tryInvidious(query) {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(
        `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const items = (data || []).filter(v => v.type === 'video').slice(0, 8);
      if (items.length === 0) continue;
      return items.map(v => ({
        id: v.videoId || '',
        title: v.title || '',
        thumbnail: v.videoThumbnails?.[0]?.url || '',
        duration: v.lengthSeconds || 0,
        channel: v.author || '',
        views: v.viewCount || 0,
      }));
    } catch { /* try next */ }
  }
  return null;
}

export async function searchVideos(query) {
  // Try Piped first, then Invidious
  const piped = await tryPiped(query);
  if (piped) return piped;

  const invidious = await tryInvidious(query);
  if (invidious) return invidious;

  throw new Error('Video search unavailable');
}

// Build a YouTube embed URL from a video ID
export function youtubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

// Build a football-specific search query
export function footballSearchQuery(name, level, type = 'drill') {
  const lvl = level === 'PRO' ? 'NFL' : level === 'COL' ? 'college' : 'high school';
  return `${name} football ${type} ${lvl}`;
}

// ── Wger Category / Muscle Maps ───────────────────────────────
export const WGER_CATEGORIES = {
  abs: 10, arms: 8, back: 12, calves: 14,
  cardio: 15, chest: 11, legs: 9, shoulders: 13,
};
