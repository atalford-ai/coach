import React, { useState, useEffect } from 'react';
import { THEME } from '../../theme';
import { FOOTBALL_CATEGORIES, LEVELS, FOOTBALL_DRILLS } from '../../data/football_drills';
import { PLAY_CATEGORIES, FOOTBALL_PLAYS } from '../../data/football_plays';
import {
  fetchExercises,
  fetchExerciseDetail,
  searchExercises,
  searchVideos,
  youtubeEmbedUrl,
  footballSearchQuery,
  WGER_CATEGORIES,
} from '../../lib/api';

// ── Styles ────────────────────────────────────────────────────
const S = {
  header: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, letterSpacing: '0.03em',
  },
  label: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11, fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  card: {
    background: THEME.g800, borderRadius: 12,
    padding: '14px 16px', cursor: 'pointer',
    border: `1px solid ${THEME.g700}`,
    transition: 'border-color 0.2s',
  },
};

// ── Level Badge ───────────────────────────────────────────────
function LevelBadge({ lv }) {
  const colors = { PRO: '#ff4444', COL: '#4488ff', HS: THEME.accent };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      background: (colors[lv] || THEME.accent) + '30',
      color: lv === 'PRO' ? '#ff6666' : lv === 'COL' ? '#6699ff' : THEME.accent,
      fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em',
    }}>{lv}</span>
  );
}

// ── Filter Chip ───────────────────────────────────────────────
function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
      background: active ? THEME.accent : THEME.g800,
      color: active ? THEME.bg : THEME.g500, transition: 'all 0.15s',
    }}>{label}</button>
  );
}

// ══════════════════════════════════════════════════════════════
// VIDEO POPOUT — fullscreen overlay with embedded player
// Everything stays in the app — no new tabs, no leaving the page
// ══════════════════════════════════════════════════════════════
function VideoPopout({ query, onClose }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const doSearch = async () => {
    setLoading(true);
    try {
      const results = await searchVideos(query);
      setVideos(results);
      // Auto-play first result
      if (results.length > 0 && !playing) setPlaying(results[0]);
    } catch { setVideos([]); }
    setLoading(false);
  };

  useEffect(() => { doSearch(); }, [query]);

  const retry = async () => {
    setRetrying(true);
    await doSearch();
    setRetrying(false);
  };

  const fmt = (s) => {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: THEME.bg,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top bar — BACK button always visible */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: `1px solid ${THEME.g700}`,
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: THEME.accent,
          fontSize: 14, cursor: 'pointer', ...S.header,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 18 }}>&larr;</span> BACK
        </button>
        {playing && (
          <button onClick={() => setPlaying(null)} style={{
            background: THEME.g700, border: 'none', color: THEME.g300,
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
            ...S.header, fontSize: 11,
          }}>
            CLOSE PLAYER
          </button>
        )}
      </div>

      {/* Embedded YouTube player — stays in the app */}
      {playing && (
        <div style={{ width: '100%', background: '#000', flexShrink: 0 }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={youtubeEmbedUrl(playing.id)}
              title={playing.title}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%', border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ padding: '10px 16px', background: THEME.g900 }}>
            <div style={{ ...S.header, fontSize: 14, color: THEME.white }}>{playing.title}</div>
            {playing.channel && (
              <div style={{ fontSize: 11, color: THEME.g500, marginTop: 2 }}>{playing.channel}</div>
            )}
          </div>
        </div>
      )}

      {/* Video list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{ ...S.label, color: THEME.accent, marginBottom: 10 }}>
          {videos.length > 0 ? `${videos.length} VIDEOS` : 'SEARCHING'}: "{query}"
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: THEME.g500 }}>
            Searching for videos...
          </div>
        )}

        {/* No results — retry button, no external links */}
        {!loading && videos.length === 0 && (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ fontSize: 14, color: THEME.g300, marginBottom: 16 }}>
              No videos found yet. The video APIs may be warming up.
            </div>
            <button
              onClick={retry}
              disabled={retrying}
              style={{
                padding: '14px 32px',
                background: THEME.accent, color: THEME.bg,
                border: 'none', borderRadius: 10, cursor: 'pointer',
                ...S.header, fontSize: 15,
                opacity: retrying ? 0.5 : 1,
              }}
            >
              {retrying ? 'SEARCHING...' : 'RETRY SEARCH'}
            </button>
            <div style={{ fontSize: 12, color: THEME.g500, marginTop: 16 }}>
              Trying multiple video sources automatically.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {videos.map((v, i) => (
            <div
              key={v.id || i}
              onClick={() => setPlaying(v)}
              style={{
                display: 'flex', gap: 12, padding: 10,
                background: playing?.id === v.id ? THEME.g700 : THEME.g800,
                borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${playing?.id === v.id ? THEME.accent : THEME.g700}`,
              }}
            >
              {v.thumbnail && (
                <div style={{
                  width: 120, minWidth: 120, height: 68,
                  borderRadius: 6, overflow: 'hidden', position: 'relative',
                  background: THEME.g700, flexShrink: 0,
                }}>
                  <img src={v.thumbnail} alt="" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                  }} />
                  {v.duration > 0 && (
                    <span style={{
                      position: 'absolute', bottom: 4, right: 4,
                      background: 'rgba(0,0,0,0.8)', color: '#fff',
                      fontSize: 10, padding: '1px 4px', borderRadius: 3,
                    }}>{fmt(v.duration)}</span>
                  )}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  ...S.header, fontSize: 13, color: THEME.white,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>{v.title}</div>
                {v.channel && (
                  <div style={{ fontSize: 11, color: THEME.g500, marginTop: 4 }}>{v.channel}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PLAY CARD — shows formation, position assignments, drills
// ══════════════════════════════════════════════════════════════
function PlayCard({ play, onVideo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{ ...S.card, borderColor: expanded ? THEME.accent : THEME.g700 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...S.header, fontSize: 16, color: THEME.white }}>{play.name}</div>
          <div style={{ fontSize: 11, color: THEME.accent, marginTop: 2, ...S.label }}>{play.formation}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {play.level.map(lv => <LevelBadge key={lv} lv={lv} />)}
        </div>
      </div>

      <div style={{ fontSize: 13, color: THEME.g300, marginTop: 6, lineHeight: 1.4 }}>{play.desc}</div>

      {expanded && (
        <div style={{ marginTop: 14 }}>
          {/* Position assignments */}
          <div style={{ ...S.label, color: THEME.accent, marginBottom: 8 }}>POSITION ASSIGNMENTS</div>
          {Object.entries(play.assignments).map(([pos, text]) => (
            <div key={pos} style={{
              display: 'flex', gap: 10, marginBottom: 8,
              padding: '8px 10px', background: THEME.g900, borderRadius: 8,
            }}>
              <div style={{
                ...S.header, fontSize: 12, color: THEME.accent,
                minWidth: 50, flexShrink: 0,
              }}>{pos}</div>
              <div style={{ fontSize: 12, color: THEME.g300, lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}

          {/* Related drills */}
          {play.drills?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...S.label, color: THEME.g500, marginBottom: 6 }}>RELATED DRILLS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {play.drills.map(d => (
                  <span key={d} style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 6,
                    background: THEME.g700, color: THEME.g300,
                  }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Video button */}
          <button
            onClick={(e) => { e.stopPropagation(); onVideo(play.name, play.level[0]); }}
            style={{
              width: '100%', marginTop: 14, padding: '12px 0',
              background: THEME.accent, color: THEME.bg,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              ...S.header, fontSize: 14,
            }}
          >
            WATCH VIDEO
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DRILL CARD
// ══════════════════════════════════════════════════════════════
function DrillCard({ drill, onVideo, onApi }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{ ...S.card, borderColor: expanded ? THEME.accent : THEME.g700 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...S.header, fontSize: 16, color: THEME.white }}>{drill.name}</div>
          <div style={{ fontSize: 13, color: THEME.g300, marginTop: 4, lineHeight: 1.4 }}>{drill.desc}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {drill.level.map(lv => <LevelBadge key={lv} lv={lv} />)}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          <div style={{ ...S.label, color: THEME.accent, marginBottom: 6 }}>COACHING POINTS</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {drill.points.map((pt, i) => (
              <li key={i} style={{ fontSize: 13, color: THEME.g300, lineHeight: 1.6 }}>{pt}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onVideo(drill.name, drill.level[0]); }}
              style={{
                flex: 1, padding: '10px 0', background: THEME.accent, color: THEME.bg,
                border: 'none', borderRadius: 8, cursor: 'pointer', ...S.header, fontSize: 13,
              }}
            >WATCH VIDEO</button>
            <button
              onClick={(e) => { e.stopPropagation(); onApi(drill); }}
              style={{
                flex: 1, padding: '10px 0', background: 'none', color: THEME.accent,
                border: `1px solid ${THEME.accent}`, borderRadius: 8, cursor: 'pointer',
                ...S.header, fontSize: 13,
              }}
            >EXERCISES</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// API EXERCISE CARD
// ══════════════════════════════════════════════════════════════
function ApiExerciseCard({ exercise }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDetail = async () => {
    if (detail) { setDetail(null); return; }
    setLoading(true);
    try {
      const d = await fetchExerciseDetail(exercise.data?.id || exercise.id);
      setDetail(d);
    } catch { setDetail({ error: true }); }
    setLoading(false);
  };

  const name = exercise.data?.name || exercise.name || 'Exercise';
  const desc = exercise.data?.description || exercise.description || '';

  return (
    <div onClick={loadDetail} style={{
      background: THEME.g900, borderRadius: 10, padding: '12px 14px',
      cursor: 'pointer', border: `1px solid ${THEME.g700}`,
    }}>
      <div style={{ ...S.header, fontSize: 14, color: THEME.white }}>{name}</div>
      {desc && (
        <div style={{ fontSize: 12, color: THEME.g300, marginTop: 4, lineHeight: 1.4 }}>
          {desc.replace(/<[^>]*>/g, ' ').slice(0, 150)}
        </div>
      )}
      {loading && <div style={{ fontSize: 12, color: THEME.accent, marginTop: 8 }}>Loading...</div>}
      {detail && !detail.error && (
        <div style={{ marginTop: 8 }}>
          {detail.images?.length > 0 && (
            <img src={detail.images[0].image} alt={name}
              style={{ width: '100%', maxWidth: 250, borderRadius: 8, marginBottom: 8 }} />
          )}
          {detail.muscles?.length > 0 && (
            <div style={{ fontSize: 11, color: THEME.g300 }}>
              <span style={{ color: THEME.accent, fontWeight: 700 }}>Muscles: </span>
              {detail.muscles.map(m => m.name_en || m.name).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// API PANEL (popout for related exercises)
// ══════════════════════════════════════════════════════════════
function ApiPanel({ drill, onClose }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const term = getSearchTerms(drill);
        const data = await searchExercises(term, 10);
        if (!cancelled) setResults(data);
      } catch (err) { if (!cancelled) setError(err.message); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [drill.id]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: THEME.bg + 'f5',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: `1px solid ${THEME.g700}`, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: THEME.accent,
          fontSize: 14, cursor: 'pointer', ...S.header,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 18 }}>&larr;</span> BACK
        </button>
        <div style={{ ...S.label, color: THEME.g500, fontSize: 10 }}>WGER API</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ ...S.header, fontSize: 18, color: THEME.white, marginBottom: 4 }}>
          Related: {drill.name}
        </div>
        <div style={{ ...S.label, color: THEME.accent, marginBottom: 16 }}>EXERCISE DATABASE</div>

        {loading && <div style={{ textAlign: 'center', padding: 40, color: THEME.g500 }}>Fetching...</div>}
        {error && <div style={{ textAlign: 'center', padding: 20, color: '#ff6666', fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((ex, i) => <ApiExerciseCard key={ex.data?.id || i} exercise={ex} />)}
        </div>

        {!loading && !error && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: 30, color: THEME.g500 }}>No exercises found.</div>
        )}
      </div>
    </div>
  );
}

function getSearchTerms(drill) {
  const map = {
    speed: 'sprint squat', strength: drill.name.toLowerCase(),
    qb: 'shoulder throw', wr: 'sprint agility', rb: 'squat lunge',
    ol: 'bench press squat', lb: 'deadlift squat', db: 'sprint agility',
    special: 'sprint', conditioning: 'cardio run',
  };
  return map[drill.category] || drill.name;
}

// ══════════════════════════════════════════════════════════════
// MAIN DRILL LIBRARY
// ══════════════════════════════════════════════════════════════
export default function DrillLibrary() {
  // Sub-tab: plays, drills, exercises
  const [subTab, setSubTab] = useState('plays');

  // Plays state
  const [playSide, setPlaySide] = useState('all');
  const [playCat, setPlayCat] = useState('all');
  const [playSearch, setPlaySearch] = useState('');

  // Drills state
  const [drillCat, setDrillCat] = useState('all');
  const [drillLevel, setDrillLevel] = useState('all');
  const [drillSearch, setDrillSearch] = useState('');

  // Exercise API state
  const [apiCategory, setApiCategory] = useState(null);
  const [apiResults, setApiResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiSearch, setApiSearch] = useState('');

  // Panels
  const [videoQuery, setVideoQuery] = useState(null);
  const [apiPanel, setApiPanel] = useState(null);

  // Open video popout
  const openVideo = (name, level) => {
    setVideoQuery(footballSearchQuery(name, level || 'HS', 'drill'));
  };

  // Filter plays
  const filteredPlays = FOOTBALL_PLAYS.filter(p => {
    if (playSide !== 'all') {
      const cat = PLAY_CATEGORIES.find(c => c.id === p.category);
      if (cat && cat.side !== playSide) return false;
    }
    if (playCat !== 'all' && p.category !== playCat) return false;
    if (playSearch) {
      const q = playSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter drills
  const filteredDrills = FOOTBALL_DRILLS.filter(d => {
    if (drillCat !== 'all' && d.category !== drillCat) return false;
    if (drillLevel !== 'all' && !d.level.includes(drillLevel)) return false;
    if (drillSearch) {
      const q = drillSearch.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q);
    }
    return true;
  });

  // Exercise API
  const loadApiCat = async (catId) => {
    setApiCategory(catId); setApiLoading(true);
    try {
      const data = await fetchExercises({ category: catId, limit: 20 });
      setApiResults(data.results || []);
    } catch { setApiResults([]); }
    setApiLoading(false);
  };
  const doApiSearch = async () => {
    if (!apiSearch.trim()) return;
    setApiCategory(null); setApiLoading(true);
    try {
      const data = await searchExercises(apiSearch.trim(), 20);
      setApiResults(data);
    } catch { setApiResults([]); }
    setApiLoading(false);
  };

  const activeCats = playSide === 'all' ? PLAY_CATEGORIES : PLAY_CATEGORIES.filter(c => c.side === playSide);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
          letterSpacing: '0.06em', color: THEME.white,
        }}>PLAYBOOK</div>
        <div style={{ fontSize: 12, color: THEME.g500, marginTop: -2 }}>
          Football plays, drills & training — HS to NFL
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{
        display: 'flex', margin: '14px 16px 0', background: THEME.g800,
        borderRadius: 10, overflow: 'hidden',
      }}>
        {[
          { id: 'plays', label: 'PLAYS' },
          { id: 'drills', label: 'DRILLS' },
          { id: 'exercises', label: 'EXERCISES' },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
            ...S.header, fontSize: 13,
            background: subTab === t.id ? THEME.accent : 'transparent',
            color: subTab === t.id ? THEME.bg : THEME.g500,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ PLAYS TAB ═══════════════════════════════════════════ */}
      {subTab === 'plays' && (
        <div>
          <div style={{ padding: '12px 16px 0' }}>
            <input type="text" placeholder="Search plays..."
              value={playSearch} onChange={e => setPlaySearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', background: THEME.g800,
                border: `1px solid ${THEME.g700}`, borderRadius: 8,
                color: THEME.white, fontSize: 14, fontFamily: "'Barlow', sans-serif",
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Side filter */}
          <div style={{ padding: '10px 16px 0', display: 'flex', gap: 6 }}>
            <Chip label="All" active={playSide === 'all'} onClick={() => { setPlaySide('all'); setPlayCat('all'); }} />
            <Chip label="Offense" active={playSide === 'offense'} onClick={() => { setPlaySide('offense'); setPlayCat('all'); }} />
            <Chip label="Defense" active={playSide === 'defense'} onClick={() => { setPlaySide('defense'); setPlayCat('all'); }} />
            <Chip label="Special" active={playSide === 'special'} onClick={() => { setPlaySide('special'); setPlayCat('all'); }} />
          </div>

          {/* Category filter */}
          <div style={{
            padding: '8px 16px', display: 'flex', gap: 6,
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          }}>
            <Chip label="All" active={playCat === 'all'} onClick={() => setPlayCat('all')} />
            {activeCats.map(c => (
              <Chip key={c.id} label={c.label} active={playCat === c.id} onClick={() => setPlayCat(c.id)} />
            ))}
          </div>

          <div style={{ padding: '0 16px 8px', fontSize: 12, color: THEME.g500 }}>
            {filteredPlays.length} play{filteredPlays.length !== 1 ? 's' : ''}
          </div>

          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredPlays.map(p => (
              <PlayCard key={p.id} play={p} onVideo={openVideo} />
            ))}
          </div>

          {filteredPlays.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: THEME.g500 }}>No plays match.</div>
          )}
        </div>
      )}

      {/* ═══ DRILLS TAB ══════════════════════════════════════════ */}
      {subTab === 'drills' && (
        <div>
          <div style={{ padding: '12px 16px 0' }}>
            <input type="text" placeholder="Search drills..."
              value={drillSearch} onChange={e => setDrillSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', background: THEME.g800,
                border: `1px solid ${THEME.g700}`, borderRadius: 8,
                color: THEME.white, fontSize: 14, fontFamily: "'Barlow', sans-serif",
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ padding: '10px 16px 0', display: 'flex', gap: 6 }}>
            <Chip label="All Levels" active={drillLevel === 'all'} onClick={() => setDrillLevel('all')} />
            {LEVELS.map(lv => (
              <Chip key={lv.id} label={lv.label} active={drillLevel === lv.id} onClick={() => setDrillLevel(lv.id)} />
            ))}
          </div>

          <div style={{
            padding: '8px 16px', display: 'flex', gap: 6,
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          }}>
            <Chip label="All" active={drillCat === 'all'} onClick={() => setDrillCat('all')} />
            {FOOTBALL_CATEGORIES.map(cat => (
              <Chip key={cat.id} label={`${cat.icon} ${cat.label}`}
                active={drillCat === cat.id} onClick={() => setDrillCat(cat.id)} />
            ))}
          </div>

          <div style={{ padding: '0 16px 8px', fontSize: 12, color: THEME.g500 }}>
            {filteredDrills.length} drill{filteredDrills.length !== 1 ? 's' : ''}
          </div>

          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDrills.map(d => (
              <DrillCard key={d.id} drill={d} onVideo={openVideo} onApi={setApiPanel} />
            ))}
          </div>

          {filteredDrills.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: THEME.g500 }}>No drills match.</div>
          )}
        </div>
      )}

      {/* ═══ EXERCISES TAB ═══════════════════════════════════════ */}
      {subTab === 'exercises' && (
        <div>
          <div style={{ padding: '12px 16px 0', display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Search exercises (squat, bench, lunge)..."
              value={apiSearch} onChange={e => setApiSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doApiSearch()}
              style={{
                flex: 1, padding: '10px 14px', background: THEME.g800,
                border: `1px solid ${THEME.g700}`, borderRadius: 8,
                color: THEME.white, fontSize: 14, fontFamily: "'Barlow', sans-serif",
                outline: 'none',
              }}
            />
            <button onClick={doApiSearch} style={{
              padding: '10px 18px', background: THEME.accent, color: THEME.bg,
              border: 'none', borderRadius: 8, ...S.header, fontSize: 13, cursor: 'pointer',
            }}>SEARCH</button>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(WGER_CATEGORIES).map(([name, id]) => (
              <Chip key={id} label={name.charAt(0).toUpperCase() + name.slice(1)}
                active={apiCategory === id} onClick={() => loadApiCat(id)} />
            ))}
          </div>

          <div style={{ padding: '0 16px 8px', fontSize: 11, color: THEME.g500 }}>
            Powered by Wger API — free exercise database
          </div>

          {apiLoading && <div style={{ textAlign: 'center', padding: 40, color: THEME.g500 }}>Loading...</div>}

          {!apiLoading && apiResults.length === 0 && !apiCategory && !apiSearch && (
            <div style={{ textAlign: 'center', padding: 40, color: THEME.g500, fontSize: 13 }}>
              Select a muscle group or search to pull exercises from the API.
            </div>
          )}

          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {apiResults.map((ex, i) => <ApiExerciseCard key={ex.data?.id || ex.id || i} exercise={ex} />)}
          </div>
        </div>
      )}

      {/* ═══ POPOUTS ═════════════════════════════════════════════ */}
      {videoQuery && <VideoPopout query={videoQuery} onClose={() => setVideoQuery(null)} />}
      {apiPanel && <ApiPanel drill={apiPanel} onClose={() => setApiPanel(null)} />}
    </div>
  );
}
