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

// ── Video Search (Piped API — free YouTube proxy, no key) ─────
// Returns video results with IDs that can be embedded as YouTube iframes

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.projectsegfau.lt',
];

async function pipedFetch(path) {
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return res.json();
    } catch { /* try next */ }
  }
  throw new Error('Video search unavailable');
}

export async function searchVideos(query, filter = 'videos') {
  const data = await pipedFetch(`/search?q=${encodeURIComponent(query)}&filter=${filter}`);
  return (data.items || [])
    .filter(v => v.type === 'stream')
    .slice(0, 8)
    .map(v => ({
      id: v.url?.replace('/watch?v=', '') || '',
      title: v.title || '',
      thumbnail: v.thumbnail || '',
      duration: v.duration || 0,
      channel: v.uploaderName || '',
      views: v.views || 0,
    }));
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
