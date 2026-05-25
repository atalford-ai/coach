// ── Training Content APIs ──────────────────────────────────────
// Free APIs for pulling text + video training content

const WGER_BASE = 'https://wger.de/api/v2';

// ── YouTube API Key ───────────────────────────────────────────
// Set in Railway env vars or in a .env file as VITE_YOUTUBE_API_KEY
// Get a free key at: https://console.cloud.google.com/apis/credentials
// Enable "YouTube Data API v3" — free tier = 10,000 units/day
const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

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

// ── Video Search ──────────────────────────────────────────────
// Primary: YouTube Data API v3 (requires VITE_YOUTUBE_API_KEY)
// Fallback: Invidious free instances

// YouTube Data API v3 — official, reliable, free tier
async function tryYouTubeAPI(query) {
  if (!YT_API_KEY) return null;
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: '8',
      key: YT_API_KEY,
    });
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.items || []).map(v => ({
      id: v.id?.videoId || '',
      title: v.snippet?.title || '',
      thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || '',
      duration: 0,
      channel: v.snippet?.channelTitle || '',
      views: 0,
    }));
  } catch { return null; }
}

// Invidious free instances (fallback)
const INVIDIOUS_INSTANCES = [
  'https://invidious.materialio.us',
  'https://inv.nadeko.net',
  'https://yewtu.be',
  'https://invidious.nerdvpn.de',
];

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
        thumbnail: v.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
        duration: v.lengthSeconds || 0,
        channel: v.author || '',
        views: v.viewCount || 0,
      }));
    } catch { /* try next */ }
  }
  return null;
}

// CORS proxy scrape (last resort)
async function tryCorsProxy(query) {
  const proxies = ['https://corsproxy.io/?url=', 'https://api.allorigins.win/raw?url='];
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  for (const proxy of proxies) {
    try {
      const res = await fetch(
        `${proxy}${encodeURIComponent(ytUrl)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) continue;
      const html = await res.text();
      const ids = [];
      const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
      let match;
      const seen = new Set();
      while ((match = regex.exec(html)) !== null && ids.length < 8) {
        if (!seen.has(match[1])) { seen.add(match[1]); ids.push(match[1]); }
      }
      if (ids.length === 0) continue;
      return ids.map((id, i) => ({
        id,
        title: `${query} — Video ${i + 1}`,
        thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        duration: 0, channel: '', views: 0,
      }));
    } catch { /* try next */ }
  }
  return null;
}

export async function searchVideos(query) {
  // 1. YouTube Data API (best — needs key)
  const yt = await tryYouTubeAPI(query);
  if (yt && yt.length > 0) return yt;

  // 2. Invidious free instances
  const inv = await tryInvidious(query);
  if (inv) return inv;

  // 3. CORS proxy scrape
  const proxy = await tryCorsProxy(query);
  if (proxy) return proxy;

  return [];
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
