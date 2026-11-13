'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const GREEN = '#1DB954';

/* ── Spotify iFrame API (minimal typings) ── */
interface PlaybackState { isPaused: boolean; isBuffering: boolean; duration: number; position: number }
interface SpotifyController {
  loadUri(uri: string): void;
  play(): void;
  pause(): void;
  togglePlay(): void;
  seek(seconds: number): void;
  addListener(event: 'playback_update', cb: (e: { data: PlaybackState }) => void): void;
  addListener(event: 'ready', cb: () => void): void;
}
interface SpotifyIFrameAPI {
  createController(
    el: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    cb: (c: SpotifyController) => void,
  ): void;
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    __spotifyIFrameAPI?: SpotifyIFrameAPI;
  }
}

function loadIframeApi(): Promise<SpotifyIFrameAPI> {
  return new Promise((resolve) => {
    if (window.__spotifyIFrameAPI) return resolve(window.__spotifyIFrameAPI);
    window.onSpotifyIframeApiReady = (api) => {
      window.__spotifyIFrameAPI = api;
      resolve(api);
    };
    if (!document.getElementById('spotify-iframe-api')) {
      const s = document.createElement('script');
      s.id = 'spotify-iframe-api';
      s.src = 'https://open.spotify.com/embed/iframe-api/v1';
      s.async = true;
      document.body.appendChild(s);
    }
  });
}

interface Meta {
  name: string;
  artist: string;
  url: string;
  uri: string;
  image: string | null;
  lyricsArtist?: string;
}

/* My favourite tracks — Spotify links, in display order */
const FAVOURITES: Meta[] = [
  { name: 'All I Need To Hear', artist: 'The 1975', url: 'https://open.spotify.com/track/5WdMBJD7V5CVBTBdE2at2D', uri: 'spotify:track:5WdMBJD7V5CVBTBdE2at2D', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0200702474f8e0e2b6155d48e3' },
  { name: 'Happier Than Ever', artist: 'ASTN', url: 'https://open.spotify.com/track/0xWWwyvYD1mEmaGTOiP0SU', uri: 'spotify:track:0xWWwyvYD1mEmaGTOiP0SU', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02becc03cd85795759bbbfd634' },
  { name: 'All That Matters', artist: 'Justin Bieber', url: 'https://open.spotify.com/track/2QXfY1mmasQNWIRJ2Hx1qT', uri: 'spotify:track:2QXfY1mmasQNWIRJ2Hx1qT', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0286b35d0bfa6bbceed7541a3d' },
  { name: 'Power Trip (feat. Miguel)', artist: 'J. Cole, Miguel', url: 'https://open.spotify.com/track/2uwnP6tZVVmTovzX5ELooy', uri: 'spotify:track:2uwnP6tZVVmTovzX5ELooy', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02c1bb124f993488cf21b269fc' },
  { name: 'Indecision (feat. Daniel Caesar)', artist: 'Rex Orange County, Daniel Caesar', url: 'https://open.spotify.com/track/5Iz37U02xYFAs9BId9MwwY', uri: 'spotify:track:5Iz37U02xYFAs9BId9MwwY', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e029227aad7e74dca81fa9ff0ba' },
  { name: 'Happiness', artist: 'Rex Orange County', url: 'https://open.spotify.com/track/7aSyG7cskkG3zhfO2JLxq3', uri: 'spotify:track:7aSyG7cskkG3zhfO2JLxq3', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021bd6d088d3d81972af4cb81d' },
  { name: 'Boredom (feat. Rex Orange County & Anna of the North)', artist: 'Tyler, The Creator, Rex Orange County, Anna of the North', url: 'https://open.spotify.com/track/5WNYg3usc6H8N3MBEp4zVk', uri: 'spotify:track:5WNYg3usc6H8N3MBEp4zVk', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e028940ac99f49e44f59e6f7fb3', lyricsArtist: 'Tyler, The Creator' },
  { name: 'Half-Life', artist: 'Duncan Sheik', url: 'https://open.spotify.com/track/4SwcSQIRh7M1dmzyYgCAHs', uri: 'spotify:track:4SwcSQIRh7M1dmzyYgCAHs', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e029d72caf1620ff39fe066d6f0' },
  { name: 'Unwell', artist: 'Matchbox Twenty', url: 'https://open.spotify.com/track/6Bm6qUCSatPAqkQllFL7oA', uri: 'spotify:track:6Bm6qUCSatPAqkQllFL7oA', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b23d1b3eb6fcd4a6c892d4f7' },
  { name: 'Sincerity Is Scary', artist: 'The 1975', url: 'https://open.spotify.com/track/6HguG9HRb1Ke1bhihfE4m8', uri: 'spotify:track:6HguG9HRb1Ke1bhihfE4m8', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e026c582022e90b11f0da287a9a' },
  { name: "B*tch, Don't Kill My Vibe", artist: 'Kendrick Lamar', url: 'https://open.spotify.com/track/5h5tBFnbcVioFXiOixTn6E', uri: 'spotify:track:5h5tBFnbcVioFXiOixTn6E', image: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0278de8b28de36a74afc0348b5' },
];


function parseSpotifyLink(input: string): { uri: string; url: string } | null {
  const m = input.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)
    ?? input.match(/^spotify:(track|album|playlist|episode|show|artist):([A-Za-z0-9]+)$/);
  if (!m) return null;
  return { uri: `spotify:${m[1]}:${m[2]}`, url: `https://open.spotify.com/${m[1]}/${m[2]}` };
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/* ── icons ── */
const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);
const PauseIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
);
const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zM9.5 12 18 18V6z" /></svg>
);
const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" /></svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
);
const LyricsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797zM10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z" /></svg>
);

/* ── Lyrics: LRCLIB (free, CORS-enabled, time-synced) ── */
interface LyricLine { t: number; text: string }
interface LyricsData { lines: LyricLine[]; synced: boolean }
interface LrcLibResult { trackName?: string; syncedLyrics?: string | null; plainLyrics?: string | null }
const NO_LINES: LyricLine[] = [];

function parseLrc(lrc: string): LyricLine[] {
  const out: LyricLine[] = [];
  for (const raw of lrc.split('\n')) {
    const m = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    if (m) out.push({ t: Number(m[1]) * 60 + Number(m[2]), text: m[3].trim() || '♪' });
  }
  return out;
}

async function fetchLyrics(meta: Meta): Promise<LyricsData> {
  const title = meta.name.replace(/\s*[(\[].*?[)\]]/g, '').trim();
  // A pasted link only has a generic "artist" (the link type), so search by title alone in that case.
  const knownArtist = !/^(track|album|playlist|episode|show|artist)$/.test(meta.artist);
  const params = new URLSearchParams({ track_name: title });
  if (knownArtist) params.set('artist_name', meta.lyricsArtist ?? meta.artist.split(',')[0].trim());
  try {
    const r = await fetch(`https://lrclib.net/api/search?${params.toString()}`);
    if (!r.ok) return { lines: NO_LINES, synced: false };
    const results: LrcLibResult[] = await r.json();
    const synced = results.filter((x) => x.syncedLyrics);
    const best = synced.find((x) => x.trackName?.toLowerCase() === title.toLowerCase()) ?? synced[0];
    if (best?.syncedLyrics) {
      const lines = parseLrc(best.syncedLyrics);
      if (lines.length) return { lines, synced: true };
    }
    const plain = results.find((x) => x.plainLyrics)?.plainLyrics;
    if (plain) return { lines: plain.split('\n').map((text) => ({ t: 0, text: text.trim() || '♪' })), synced: false };
  } catch { /* offline or blocked — fall through to "no lyrics" */ }
  return { lines: NO_LINES, synced: false };
}



const PROFILE_URL = 'https://open.spotify.com/user/rtoidubftyvjz4zvgojf3lj44?si=cfabc4a5bb334fa1';

const SpotifyGlyph = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-.99-.12-1.14-.6-.12-.48.12-.99.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
  </svg>
);
/* Transparent hot spot laid over a part of the iPod's click wheel (left/top/width/height are % of the iPod image). */
function WheelHit({ label, left, top, width, height, onClick, disabled = false }: {
  label: string; left: string; top: string; width: string; height: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="ipod-hit"
      style={{ position: 'absolute', left, top, width, height, zIndex: 2, background: 'transparent', border: 'none', padding: 0 }} />
  );
}
const mono = "'Consolas','Courier New',monospace";

interface MusicCtxValue {
  tracks: Meta[]
  activeIdx: number
  custom: Meta | null
  current: Meta
  playback: PlaybackState
  barOpen: boolean
  playing: boolean
  progress: number
  canStep: boolean
  selectTrack: (i: number) => void
  togglePlay: () => void
  step: (dir: 1 | -1) => void
  seek: (e: React.MouseEvent<HTMLDivElement>) => void
  playLink: (parsed: { uri: string; url: string }) => Promise<void>
}
const MusicCtx = createContext<MusicCtxValue | null>(null);
function useMusic() {
  const ctx = useContext(MusicCtx);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}

/** Owns the Spotify controller, docked player and lyrics. Mounted in the root layout so music survives page navigation. */
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const tracks = FAVOURITES;
  const [activeIdx, setActiveIdx] = useState(0);
  const [custom, setCustom] = useState<Meta | null>(null);
  const [playback, setPlayback] = useState<PlaybackState>({ isPaused: true, isBuffering: false, duration: 0, position: 0 });
  const [barOpen, setBarOpen] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const creatingRef = useRef(false);
  const loadedUriRef = useRef<string | null>(null);

  const current: Meta = custom ?? tracks[Math.max(activeIdx, 0)];
  const playing = barOpen && !playback.isPaused;

  /* ── Lyrics (synced, via LRCLIB) ── */
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyricsMap, setLyricsMap] = useState<Record<string, LyricsData>>({});
  const [activeLine, setActiveLine] = useState(-1);
  const baseRef = useRef({ pos: 0, stamp: 0, paused: true });
  const lyricsBoxRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fetchingRef = useRef<Set<string>>(new Set());

  const isTrack = current.uri.startsWith('spotify:track:');
  const lyrics: LyricsData | undefined = isTrack ? lyricsMap[current.uri] : undefined;
  const lyricLines = lyrics?.lines ?? NO_LINES;
  const lyricsSynced = lyrics?.synced ?? false;

  // Fetch lyrics the first time a track's lyrics are opened.
  useEffect(() => {
    if (!lyricsOpen || !barOpen || !isTrack || lyricsMap[current.uri] || fetchingRef.current.has(current.uri)) return;
    const meta = current;
    fetchingRef.current.add(meta.uri);
    void fetchLyrics(meta).then((data) => {
      fetchingRef.current.delete(meta.uri);
      setLyricsMap((prev) => ({ ...prev, [meta.uri]: data }));
    });
  }, [lyricsOpen, barOpen, isTrack, current, lyricsMap]);

  // Work out the active line ~60 times a second, interpolating between Spotify's position updates.
  useEffect(() => {
    if (!lyricsOpen || !lyricsSynced || lyricLines.length === 0) return;
    let raf = 0;
    const tick = () => {
      const b = baseRef.current;
      const pos = (b.paused ? b.pos : b.pos + (performance.now() - b.stamp)) / 1000;
      let idx = -1;
      for (let i = 0; i < lyricLines.length; i++) {
        if (lyricLines[i].t <= pos + 0.1) idx = i; else break;
      }
      setActiveLine((prev) => (prev === idx ? prev : idx));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lyricsOpen, lyricsSynced, lyricLines]);

  // Keep the active line centred.
  useEffect(() => {
    const box = lyricsBoxRef.current;
    if (!lyricsOpen || !box) return;
    const el = activeLine >= 0 ? lineRefs.current[activeLine] : null;
    if (!el) { box.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
  }, [activeLine, lyricsOpen, lyricLines]);

  useEffect(() => {
    if (!lyricsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLyricsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lyricsOpen]);


  /* keep page content clear of the docked player */
  useEffect(() => {
    document.body.style.paddingBottom = barOpen ? '76px' : '';
    return () => { document.body.style.paddingBottom = ''; };
  }, [barOpen]);

  const ensureController = useCallback(async (uri: string, autoplay: boolean) => {
    const existing = controllerRef.current;
    if (existing) {
      existing.loadUri(uri);
      loadedUriRef.current = uri;
      if (autoplay) existing.play();
      return;
    }
    if (creatingRef.current || !mountRef.current) return;
    creatingRef.current = true;
    const api = await loadIframeApi();
    api.createController(mountRef.current, { uri, width: '100%', height: 80 }, (c) => {
      controllerRef.current = c;
      loadedUriRef.current = uri;
      c.addListener('playback_update', (e) => {
        baseRef.current = { pos: e.data.position, stamp: performance.now(), paused: e.data.isPaused };
        setPlayback(e.data);
      });
      if (autoplay) c.addListener('ready', () => c.play());
    });
  }, []);

  const playMeta = useCallback((meta: Meta) => {
    setBarOpen(true);
    void ensureController(meta.uri, true);
  }, [ensureController]);

  const selectTrack = (i: number) => {
    setCustom(null);
    setActiveIdx(i);
    playMeta(tracks[i]);
  };

  const togglePlay = () => {
    if (!current) return;
    setBarOpen(true);
    if (controllerRef.current && loadedUriRef.current === current.uri) controllerRef.current.togglePlay();
    else void ensureController(current.uri, true);
  };

  const step = (dir: 1 | -1) => {
    if (custom) return;
    selectTrack((Math.max(activeIdx, 0) + dir + tracks.length) % tracks.length);
  };

  const closePlayer = () => {
    controllerRef.current?.pause();
    setLyricsOpen(false);
    setBarOpen(false);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!controllerRef.current || playback.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    controllerRef.current.seek((playback.duration * frac) / 1000);
  };

  const playLink = async (parsed: { uri: string; url: string }) => {
    const base: Meta = { name: 'Spotify link', artist: parsed.uri.split(':')[1], url: parsed.url, uri: parsed.uri, image: null };
    setCustom(base);
    playMeta(base);
    try {
      const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(parsed.url)}`);
      if (r.ok) {
        const d: { title?: string; thumbnail_url?: string } = await r.json();
        setCustom({ ...base, name: d.title ?? base.name, image: d.thumbnail_url ?? null });
      }
    } catch { /* keep the generic metadata */ }
  };

  const progress = playback.duration > 0 ? (playback.position / playback.duration) * 100 : 0;
  const canStep = tracks.length > 1 && !custom;


  const value: MusicCtxValue = { tracks, activeIdx, custom, current, playback, barOpen, playing, progress, canStep, selectTrack, togglePlay, step, seek, playLink };

  return (
    <MusicCtx.Provider value={value}>
      {children}

      {/* Hidden Spotify embed that actually plays the audio in the background */}
      <div aria-hidden="true" style={{ position: 'fixed', left: 0, bottom: 0, width: 300, height: 80, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div ref={mountRef} />
      </div>

      {/* Docked player — appears on play, stays at the bottom, can be closed */}
      <AnimatePresence>
      {barOpen && current && (
        <motion.div key="player" role="region" aria-label="Music player"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 70, height: 72, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', boxShadow: '0 -8px 32px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 6.25%' }}>
          <div className="rg-player-line" style={{ position: 'absolute', top: -1, left: 0, height: 2, width: `${progress}%`, background: GREEN }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ width: 44, height: 44, flexShrink: 0, background: 'var(--color-surface-raised)', borderRadius: 3, overflow: 'hidden' }}>
              {current.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <a href={current.url} target="_blank" rel="noopener noreferrer" className="rg-ticker" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span className="rg-ticker-track" key={current.uri}>
                  <span>{current.name}</span>
                  <span className="rg-ticker-dup" aria-hidden="true">{current.name}</span>
                </span>
              </a>
              <div style={{ fontSize: 12, color: 'var(--color-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.artist}</div>
            </div>
          </div>

          <div className="rg-player-mid" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 1 460px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button type="button" className="rg-player-extra" onClick={() => step(-1)} disabled={!canStep} aria-label="Previous track"
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', opacity: canStep ? 1 : 0.35, display: 'flex' }}><PrevIcon /></button>
              <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
                style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--color-text-primary)', color: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button type="button" className="rg-player-extra" onClick={() => step(1)} disabled={!canStep} aria-label="Next track"
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', opacity: canStep ? 1 : 0.35, display: 'flex' }}><NextIcon /></button>
            </div>
            <div className="rg-player-extra" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', fontSize: 11, color: 'var(--color-text-faint)', fontVariantNumeric: 'tabular-nums' }}>
              <span>{fmt(playback.position)}</span>
              <div onClick={seek} style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2, cursor: 'pointer' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: GREEN, borderRadius: 2 }} />
              </div>
              <span>{fmt(playback.duration)}</span>
            </div>
          </div>

          <div className="rg-player-right" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setLyricsOpen((v) => !v)} aria-label="Lyrics" aria-pressed={lyricsOpen} title="Lyrics"
              style={{ height: 36, padding: '0 12px', border: 'none', background: 'transparent', color: lyricsOpen ? GREEN : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
              <LyricsIcon />
              <span className="rg-player-extra">Lyrics</span>
            </button>
            <button type="button" onClick={closePlayer} aria-label="Close music player" title="Close"
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloseIcon />
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Lyrics view — opens above the docked player, synced to playback, styled like the rest of the site */}
      <AnimatePresence>
      {barOpen && lyricsOpen && current && (
        <motion.div key="lyrics" role="dialog" aria-label="Lyrics" className="bg-grid"
          initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          style={{ position: 'fixed', inset: '0 0 72px 0', zIndex: 65, display: 'flex', flexDirection: 'column', background: 'color-mix(in srgb, var(--color-background) 80%, transparent)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', color: 'var(--color-text-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, padding: '32px 6.25% 24px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 8 }}>Lyrics</p>
              <div className="text-heading-sm-new" style={{ color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.name}</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-faint)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.artist}</div>
            </div>
            <button type="button" className="btn-render-secondary" onClick={() => setLyricsOpen(false)} aria-label="Close lyrics" style={{ height: 40, fontSize: 14, flexShrink: 0 }}>
              <span>Close</span>
            </button>
          </div>

          <div ref={lyricsBoxRef} style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '6vh 6.25% 40vh' }}>
            <div style={{ maxWidth: 1000 }}>
              {lyrics && lyrics.lines.length > 0 ? (
                lyrics.lines.map((l, i) => {
                  const active = !lyrics.synced || i === activeLine;
                  return (
                    <button
                      key={i}
                      type="button"
                      ref={(el) => { lineRefs.current[i] = el; }}
                      onClick={() => { if (lyrics.synced) controllerRef.current?.seek(l.t); }}
                      disabled={!lyrics.synced}
                      className="text-heading-lg-new"
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, margin: '0 0 .3em',
                        cursor: lyrics.synced ? 'pointer' : 'default',
                        fontSize: 'clamp(28px, 4.2vw, 56px)', lineHeight: 1.15,
                        opacity: active ? 1 : 0.25, transition: 'opacity .3s',
                      }}
                    >
                      <span className={lyrics.synced && active ? 'gradient-text-purple' : undefined} style={{ color: 'var(--color-text-primary)' }}>{l.text}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-body-xl-new" style={{ color: 'var(--color-text-faint)' }}>
                  {!isTrack ? 'Lyrics are only available for single tracks.' : lyrics ? 'No lyrics found for this track.' : 'Loading lyrics\u2026'}
                </p>
              )}
            </div>
            {lyrics && lyrics.lines.length > 0 && (
              <p style={{ fontFamily: mono, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-gray-500)', marginTop: 32 }}>Lyrics from LRCLIB</p>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </MusicCtx.Provider>
  );
}

export default function MusicSection() {
  const { tracks, activeIdx, custom, current, playback, barOpen, playing, progress, canStep, selectTrack, togglePlay, step, seek, playLink } = useMusic();
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const visibleTracks = expanded ? tracks : tracks.slice(0, 6);

  const submitLink = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseSpotifyLink(link.trim());
    if (!parsed) { setLinkError('Paste a Spotify track, album or playlist link.'); return; }
    setLinkError('');
    void playLink(parsed);
  };

  return (
      <section id="music" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
        <div style={{ width: '100%', padding: '0 6.25%' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>Music</p>
            <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
              What I have <br /><span className="gradient-text-purple">on repeat</span>
            </h2>
          </motion.div>

          <div className="rg-music-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'start' }}>

            {/* Left — player card + paste-a-link */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ minWidth: 0 }}>
              <form onSubmit={submitLink} style={{ display: 'flex', gap: 12, maxWidth: 360, margin: '0 auto 20px' }}>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Paste a Spotify link"
                  aria-label="Spotify link"
                  className="input-field"
                  style={{ borderRadius: 999, padding: '.8rem 1.2rem', minWidth: 0 }}
                />
                <button type="submit" className="btn-render-primary" style={{ borderRadius: 999, flexShrink: 0 }}><span>Play</span></button>
              </form>
              {linkError && <p style={{ fontSize: 12, color: '#ff6b6b', maxWidth: 360, margin: '-8px auto 16px' }}>{linkError}</p>}

              {/* iPod — the PNG has a transparent screen window, so the "screen" sits underneath it */}
              <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1200 / 1975', margin: '0 auto', containerType: 'inline-size', filter: 'drop-shadow(0 24px 36px rgba(0,0,0,.32))' }}>
                <div style={{ position: 'absolute', left: '8.08%', top: '4.96%', width: '83.9%', height: '38.3%', background: '#fff', color: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                  <div style={{ height: '15%', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(#f4f7fb, #b4c0d4)', borderBottom: '1px solid #8793a8', fontSize: '4.4cqw', fontWeight: 700, color: '#222' }}>
                    <span style={{ position: 'absolute', left: '3cqw', fontSize: '3.2cqw', color: '#2a6fd6' }}>{playing ? '▶' : '❚❚'}</span>
                    Now Playing
                  </div>
                  <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: '3.5cqw', padding: '0 3.5cqw' }}>
                    <div style={{ width: '29cqw', height: '29cqw', flexShrink: 0, background: '#d8dde6', boxShadow: '0 1px 4px rgba(0,0,0,.4)', overflow: 'hidden' }}>
                      {current?.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={current.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '4.8cqw', fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{current.name}</div>
                      <div style={{ fontSize: '4cqw', color: '#3d4d69', marginTop: '1.2cqw', lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{current.artist}</div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, padding: '0 3.5cqw 2.5cqw' }}>
                    <div onClick={seek} style={{ height: '5cqw', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ width: '100%', height: '2.6cqw', border: '1px solid #7d8ba3', borderRadius: 2, background: 'linear-gradient(#dfe4ec, #f6f8fb)', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(#5ea2f5, #1f63c6)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '3.4cqw', fontWeight: 600, color: '#333', fontVariantNumeric: 'tabular-nums' }}>
                      <span>{fmt(playback.position)}</span>
                      <span>{playback.duration > 0 ? `-${fmt(playback.duration - playback.position)}` : '--:--'}</span>
                    </div>
                  </div>
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ipod.png" alt="iPod" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none', userSelect: 'none', zIndex: 1 }} />

                {/* click-wheel hot spots */}
                <WheelHit label="Open my Spotify profile" left="42.65%" top="55.1%" width="11.7%" height="7.1%" onClick={() => window.open(PROFILE_URL, '_blank', 'noopener,noreferrer')} />
                <WheelHit label="Previous track" left="19.3%" top="69.25%" width="11.7%" height="7.1%" onClick={() => step(-1)} disabled={!canStep} />
                <WheelHit label="Next track" left="66%" top="69.25%" width="11.7%" height="7.1%" onClick={() => step(1)} disabled={!canStep} />
                <WheelHit label={playing ? 'Pause' : 'Play'} left="42.65%" top="83.4%" width="11.7%" height="7.1%" onClick={togglePlay} />
                <WheelHit label={playing ? 'Pause' : 'Play'} left="39.15%" top="67.1%" width="18.7%" height="11.3%" onClick={togglePlay} />
              </div>

              {/* Spotify profile button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
                <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="btn-spotify">
                  <SpotifyGlyph />
                  <span>Spotify</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 10 20" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="9" width="2" height="2" /><rect x="4" y="7" width="2" height="2" /><rect x="2" y="5" width="2" height="2" />
                    <rect x="4" y="11" width="2" height="2" /><rect x="2" y="13" width="2" height="2" /><rect x="0" y="15" width="2" height="2" /><rect x="0" y="3" width="2" height="2" />
                  </svg>
                </a>
              </div>

            </motion.div>

            {/* Right — favourites */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} style={{ minWidth: 0 }}>
              <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-gray-400)', paddingBottom: 14, borderBottom: '1px solid var(--color-text-primary)' }}>
                My favourites
              </div>
              <ol style={{ listStyle: 'none' }}>
                {visibleTracks.map((t, i) => {
                  const active = !custom && i === activeIdx && (playing || barOpen);
                  return (
                    <li key={t.uri} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <button type="button" onClick={() => selectTrack(i)}
                        style={{ width: '100%', display: 'flex', gap: 20, alignItems: 'flex-start', textAlign: 'left', background: 'none', border: 'none', padding: '20px 0', color: 'inherit', cursor: 'pointer' }}>
                        <span style={{ fontFamily: mono, fontSize: 12, color: 'var(--color-gray-500)', paddingTop: 8, width: 24, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 300, color: active ? GREEN : 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                          <span style={{ display: 'block', fontFamily: mono, fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--color-gray-500)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.artist}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {tracks.length > 6 && (
                <div style={{ marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      padding: '10px 20px',
                      borderRadius: 999,
                      fontFamily: mono,
                      fontSize: 12,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-faint)',
                      cursor: 'pointer',
                      transition: 'color .2s, border-color .2s, background .2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                      e.currentTarget.style.borderColor = 'var(--color-purple-400)';
                      e.currentTarget.style.background = 'rgba(138,5,255,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-faint)';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <span>{expanded ? 'Hide' : 'See more...'}</span>
                    <span style={{ fontSize: 10, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
  );
}
