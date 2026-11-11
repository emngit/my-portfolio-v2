'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

const W = 560;
const H = 230;
const GROUND_Y = 185;       // y of the ground line
const SPRITE_W = 72;        // drawn size on canvas (64px source → 72px)
const SPRITE_H = 72;
// Sprite frames are 64px tall; last non-transparent row is 44 → 19px transparent at bottom.
// Scaled to SPRITE_H=72: 19/64*72 ≈ 21px of empty space below the feet.
// FOOT_OFFSET shifts the logical ground clamp so feet land exactly on GROUND_Y.
const FOOT_OFFSET = 21;
const DINO_X = 30;          // fixed x position of character
const GRAVITY = 0.6;
const JUMP_V = -13;
const FAST_FALL_V = 9;      // downward speed an airborne ↓ press snaps to
const FAST_FALL_GRAVITY = 3; // gravity multiplier while ↓ is held in the air
const BASE_SPEED = 4.5;
const MAX_SPEED = 12;       // cap: at 60fps the obstacle is on screen ≥ ~0.7s, still enough to react
const SPEED_INC = 0.001;    // per frame -> reaches MAX_SPEED after ~75s of play
const MIN_GAP_FRAMES = 56;  // min time between obstacle spawns (a jump lasts ≈ 43 frames)
const PAIR_GAP = 34;        // px between the two buildings of a pair
const SKY_SIZE = 56;        // drawn size of the sun / moon sprite

interface DinoState {
  y: number; vy: number; onGround: boolean;
  frame: number; frameTick: number; ducking: boolean;
  deathFrame: number; deathTick: number;
}
interface Obstacle { x: number; y: number; w: number; h: number; kind: 'cactus' | 'bird'; art?: 'plane' | 'ufo'; }
interface Cloud     { x: number; y: number; }
interface Smoke     { x: number; y: number; vx: number; vy: number; life: number; max: number; }
const SMOKE_PX = 3;         // pixel size of the slide dust

/* ── collision impact: pixel burst + flying debris (same chunky-pixel look as the sprites) ── */
interface Spark  { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; }
interface Impact { sparks: Spark[]; age: number; x: number; y: number; }
const SPARK_COLORS = ['#ffffff', '#ffe066', '#ff9f43', '#ff5e5e'];
const snap3 = (n: number) => Math.round(n / 3) * 3;

function spawnImpact(im: Impact, x: number, y: number, kind: 'cactus' | 'bird') {
  im.x = x; im.y = y; im.age = 0; im.sparks = [];
  const debris = kind === 'bird' ? '#c9a27a' : '#8a8fa8';
  for (let i = 0; i < 26; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 4.5;
    im.sparks.push({
      x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.5,
      life: 0, max: 28 + Math.floor(Math.random() * 18),
      size: Math.random() < 0.5 ? 3 : 6,
      color: i < 8 ? debris : SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    });
  }
}

/** Advances and draws the impact — call exactly once per frame, after the character. */
function drawImpact(ctx: CanvasRenderingContext2D, im: Impact) {
  if (im.age >= 0 && im.age < 10) {
    const a = im.age;
    const r = 6 + a * 4;
    const size = a < 5 ? 6 : 3;
    ctx.globalAlpha = 1 - a / 10;
    ctx.fillStyle = a < 4 ? '#ffffff' : a < 7 ? '#ffe066' : '#ff9f43';
    for (let k = 0; k < 8; k++) {
      const ang = (k * Math.PI) / 4;
      ctx.fillRect(snap3(im.x + Math.cos(ang) * r) - size / 2, snap3(im.y + Math.sin(ang) * r) - size / 2, size, size);
    }
    if (a < 3) { // brief white flash at the point of impact
      const f = 18 - a * 5;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(im.x - f / 2), Math.round(im.y - f / 2), f, f);
    }
    im.age++;
  }
  for (let i = im.sparks.length - 1; i >= 0; i--) {
    const p = im.sparks[i];
    p.life++;
    p.vy += 0.28;
    p.x += p.vx;
    p.y += p.vy;
    if (p.y > GROUND_Y) { p.y = GROUND_Y; p.vy *= -0.4; p.vx *= 0.7; }
    if (p.life >= p.max) { im.sparks.splice(i, 1); continue; }
    ctx.globalAlpha = p.life / p.max > 0.7 ? 0.35 : 1;
    ctx.fillStyle = p.color;
    ctx.fillRect(snap3(p.x), snap3(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

/* ── sprite sheet paths ── */
const RUN_FRAMES   = 8;
const FALL_FRAMES  = 2;
const DEATH_FRAMES = 7;
const DUCK_FRAMES  = 7;   // pickup_ground_1 … pickup_ground_7

function runSrc  (i: number) { return `/character/Character2M_3_run_${i}.png`;   }
function fallSrc (i: number) { return `/character/Character2M_3_fall_${i}.png`;  }
function deathSrc(i: number) { return `/character/Character2M_3_death_${i}.png`; }
function duckSrc (i: number) { return `/character/Character2M_3_pickup_ground_${i + 1}.png`; }
const idleSrc = '/character/Character2M_3_idle_0.png';

/* ── preload helper ── */
function loadImage(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src;
  return img;
}

/* ── canvas helpers ── */
function drawBuilding(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const W = o.w;
  const H = o.h;

  // main facade
  ctx.fillStyle = '#5a5a6e';
  ctx.fillRect(o.x, o.y, W, H);

  // rooftop ledge (slightly darker, 4px tall)
  ctx.fillStyle = '#3e3e50';
  ctx.fillRect(o.x - 2, o.y, W + 4, 4);

  // small rooftop box (antenna base)
  ctx.fillStyle = '#3e3e50';
  ctx.fillRect(o.x + Math.floor(W / 2) - 3, o.y - 6, 6, 6);

  // antenna
  ctx.fillStyle = '#535353';
  ctx.fillRect(o.x + Math.floor(W / 2) - 1, o.y - 12, 2, 8);

  // windows — 2 columns, rows every 10px
  ctx.fillStyle = '#c8d8f0';
  const winW = 4, winH = 4, colX = [4, W - 8];
  for (let wy = o.y + 10; wy < o.y + H - 6; wy += 10) {
    for (const cx of colX) {
      ctx.fillRect(o.x + cx, wy, winW, winH);
    }
  }

  // subtle right-side shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(o.x + W - 3, o.y + 4, 3, H - 4);
}

function drawPlane(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const x = o.x, y = o.y;

  // fuselage
  ctx.fillStyle = '#5a5a6e';
  ctx.fillRect(x + 8,  y + 8,  36, 10);

  // nose cone (tapered right)
  ctx.fillRect(x + 44, y + 9,   6,  8);
  ctx.fillRect(x + 50, y + 10,  4,  6);
  ctx.fillRect(x + 54, y + 11,  3,  4);

  // tail body
  ctx.fillRect(x,      y + 9,   8,  8);

  // top tail fin
  ctx.fillStyle = '#3e3e50';
  ctx.fillRect(x + 2,  y + 2,   6,  7);
  ctx.fillRect(x + 4,  y,       4,  3);

  // main wing (below fuselage centre)
  ctx.fillStyle = '#7a7a8e';
  ctx.fillRect(x + 14, y + 18,  22,  5);
  ctx.fillRect(x + 20, y + 23,  12,  3);

  // small rear wing
  ctx.fillRect(x + 2,  y + 17,  10,  4);

  // windows
  ctx.fillStyle = '#c8d8f0';
  ctx.fillRect(x + 30, y + 10,  4, 4);
  ctx.fillRect(x + 38, y + 10,  4, 4);

  // engine under wing
  ctx.fillStyle = '#3e3e50';
  ctx.fillRect(x + 22, y + 26,  10, 4);
  ctx.fillRect(x + 20, y + 25,  14, 2);
}

function drawCloud(ctx: CanvasRenderingContext2D, c: Cloud, isDark = false) {
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.12)' : '#ccc';
  ctx.fillRect(c.x,      c.y + 8, 50,  8);
  ctx.fillRect(c.x + 8,  c.y + 4, 34,  8);
  ctx.fillRect(c.x + 16, c.y,     18,  8);
}

/* ── sound effects (synthesised with Web Audio — no asset files) ── */
type Sfx = 'jump' | 'die' | 'milestone' | 'start';
let audioCtx: AudioContext | null = null;
let gameOnScreen = false; // set by the component's IntersectionObserver

function tone(ac: AudioContext, type: OscillatorType, f0: number, f1: number, at: number, dur: number, vol: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t = ac.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function playSound(kind: Sfx) {
  // Own AudioContext (never touches the Spotify iframe), and silent unless the game is visible.
  if (typeof window === 'undefined' || !gameOnScreen || document.hidden) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  audioCtx ??= new AC();
  const ac = audioCtx;
  const play = () => {
    switch (kind) {
      case 'jump':      tone(ac, 'square', 280, 900, 0, 0.18, 0.14); tone(ac, 'triangle', 560, 1800, 0, 0.18, 0.1); break;
      case 'start':     tone(ac, 'square', 440, 660, 0, 0.08, 0.1); tone(ac, 'square', 660, 880, 0.08, 0.1, 0.1); break;
      case 'milestone': tone(ac, 'square', 880, 880, 0, 0.07, 0.1); tone(ac, 'square', 1175, 1175, 0.1, 0.12, 0.1); break;
      case 'die':       tone(ac, 'sawtooth', 300, 50, 0, 0.45, 0.15); tone(ac, 'square', 120, 40, 0, 0.3, 0.1); break;
    }
  };
  // A suspended context has a frozen clock — schedule only once it is actually running.
  if (ac.state === 'running') play();
  else void ac.resume().then(play);
}

/* ── component ── */
export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bigRef = useRef<HTMLCanvasElement>(null);
  const [expanded, setExpanded] = useState(false);

  /* preload all sprites once into a stable ref */
  const imgs = useRef<{
    run:   HTMLImageElement[];
    fall:  HTMLImageElement[];
    death: HTMLImageElement[];
    duck:  HTMLImageElement[];
    idle:  HTMLImageElement;
    ufo:   HTMLImageElement;
    moon:  HTMLImageElement;
    sun:   HTMLImageElement;
  } | null>(null);

  if (!imgs.current && typeof window !== 'undefined') {
    imgs.current = {
      run:   Array.from({ length: RUN_FRAMES },   (_, i) => loadImage(runSrc(i))),
      fall:  Array.from({ length: FALL_FRAMES },  (_, i) => loadImage(fallSrc(i))),
      death: Array.from({ length: DEATH_FRAMES }, (_, i) => loadImage(deathSrc(i))),
      duck:  Array.from({ length: DUCK_FRAMES },  (_, i) => loadImage(duckSrc(i))),
      idle:  loadImage(idleSrc),
      ufo:   loadImage('/game/rick-and-morty-spaceship.png'),
      moon:  loadImage('/game/soul-eater-moon.png'),
      sun:   loadImage('/game/soul-eater-sun.png'),
    };
  }

  const g = useRef({
    dino: {
      y: GROUND_Y - SPRITE_H + FOOT_OFFSET, vy: 0, onGround: true,
      frame: 0, frameTick: 0, ducking: false,
      deathFrame: 0, deathTick: 0,
    } as DinoState,
    obstacles: [] as Obstacle[],
    clouds: [{ x: 80, y: 25 }, { x: 320, y: 42 }] as Cloud[],
    score: 0,
    hi: 0,
    speed: BASE_SPEED,
    nextObs: 70,
    wingTick: 0,
    wingFrame: 0,
    state: 'idle' as 'idle' | 'running' | 'dead',
    raf: 0,
    pebbleOff: 0,   // frozen pebble offset on death
    downHeld: false, // ↓ currently held (fast-fall in the air, duck on landing)
    smoke: [] as Smoke[],
    smokeTick: 0,
    impact: { sparks: [], age: -1, x: 0, y: 0 } as Impact,
    shake: 0,        // frames of screen-shake left after a crash
  });

  const startOrRestart = useCallback(() => {
    const s = g.current;
    s.dino = {
      y: GROUND_Y - SPRITE_H + FOOT_OFFSET, vy: 0, onGround: true,
      frame: 0, frameTick: 0, ducking: false,
      deathFrame: 0, deathTick: 0,
    };
    s.obstacles = [];
    s.smoke = [];
    s.impact = { sparks: [], age: -1, x: 0, y: 0 };
    s.shake = 0;
    s.score = 0;
    s.speed = BASE_SPEED;
    s.nextObs = 70;
    s.state = 'running';
  }, []);

  const jump = useCallback(() => {
    const s = g.current;
    if (s.state === 'idle' || s.state === 'dead') { startOrRestart(); playSound('start'); return; }
    if (s.dino.onGround) {
      playSound('jump');
      s.dino.vy = JUMP_V;
      s.dino.onGround = false;
      s.dino.ducking = false;
    }
  }, [startOrRestart]);

  const setDuck = useCallback((on: boolean) => {
    const s = g.current;
    s.downHeld = on;
    if (s.state !== 'running') return;
    if (!s.dino.onGround) {
      // pressing down mid-air slams the character back to the floor
      if (on && s.dino.vy < FAST_FALL_V) s.dino.vy = FAST_FALL_V;
      return;
    }
    // start at pickup_ground_3 (index 2) immediately on press — no tick delay
    if (on && !s.dino.ducking) { s.dino.frame = 2; s.dino.frameTick = 0; }
    // on release, reset so run cycle resumes cleanly
    if (!on && s.dino.ducking) { s.dino.frame = 0; s.dino.frameTick = 0; }
    s.dino.ducking = on;
  }, []);

  /* ── draw character sprite ── */
  function drawCharacter(ctx: CanvasRenderingContext2D, d: DinoState, state: string) {
    const sp = imgs.current!;
    let img: HTMLImageElement;

    if (state === 'dead') {
      img = sp.death[Math.min(d.deathFrame, DEATH_FRAMES - 1)];
    } else if (d.ducking) {
      // play frames 2–3 (pickup_ground_3 to _4), hold on frame 3
      img = sp.duck[Math.min(Math.max(d.frame, 2), 3)];
    } else if (!d.onGround) {
      img = sp.fall[d.frame % FALL_FRAMES];
    } else if (state === 'running') {
      img = sp.run[d.frame % RUN_FRAMES];
    } else {
      // idle screen — keep the character running in place
      img = sp.run[d.frame % RUN_FRAMES];
    }

    if (img.complete && img.naturalWidth > 0) {
      // the death frames sit ~3px lower in their sprite box than the run frames — lift them so the body rests on the floor
      const dy = state === 'dead' ? d.y - 3 : d.y;
      ctx.drawImage(img, DINO_X, dy, SPRITE_W, SPRITE_H);
    }
  }

  /* ── game loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function loop() {
      const s = g.current;
      s.raf = requestAnimationFrame(loop);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      /* screen shake after a crash — fresh transform every frame, back to identity when it ends */
      if (s.shake > 0) {
        const amp = Math.ceil(s.shake / 4);
        ctx.setTransform(1, 0, 0, 1, Math.round((Math.random() * 2 - 1) * amp), Math.round((Math.random() * 2 - 1) * amp));
        s.shake--;
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      /* ── sky background ── */
      if (isDark) {
        // night sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        grad.addColorStop(0,   '#0a0a1a');
        grad.addColorStop(1,   '#1a1a3e');
        ctx.fillStyle = grad;
      } else {
        // day sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        grad.addColorStop(0,   '#87ceeb');
        grad.addColorStop(1,   '#e0f4ff');
        ctx.fillStyle = grad;
      }
      ctx.fillRect(-8, -8, W + 16, GROUND_Y + 8); // oversized so the screen-shake never exposes an edge

      /* ── ground strip ── */
      ctx.fillStyle = isDark ? '#1a1a2e' : '#c8b89a';
      ctx.fillRect(-8, GROUND_Y, W + 16, H - GROUND_Y + 8);

      /* ── sun / moon (Soul Eater sprites) ── */
      const sky = isDark ? imgs.current!.moon : imgs.current!.sun;
      if (sky.complete && sky.naturalWidth > 0) {
        ctx.drawImage(sky, W - 104, 24, SKY_SIZE, SKY_SIZE);
      }
      if (isDark) {
        // stars — fixed positions via seeded pattern
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        [[40,15],[120,8],[200,20],[300,6],[420,18],[500,10],[80,30],[350,25],[460,35]].forEach(([sx,sy]) => {
          ctx.fillRect(sx, sy, 2, 2);
        });
      }

      /* ground line */
      ctx.strokeStyle = isDark ? '#3a3a5a' : '#888';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-8, GROUND_Y + 2); ctx.lineTo(W + 8, GROUND_Y + 2); ctx.stroke();

      /* ground pebbles — scroll at exactly the obstacle speed (px per frame) so the floor and buildings stay in sync */
      ctx.fillStyle = isDark ? '#2a2a4a' : '#aaa';
      if (s.state !== 'dead') s.pebbleOff = (s.pebbleOff + s.speed) % 55;
      for (let x = -s.pebbleOff; x < W; x += 55) {
        ctx.fillRect(x,      GROUND_Y + 6,  3, 2);
        ctx.fillRect(x + 28, GROUND_Y + 11, 2, 2);
      }

      /* clouds — only scroll when not dead */
      for (const c of s.clouds) {
        drawCloud(ctx, c, isDark);
        if (s.state !== 'dead') {
          c.x -= s.speed * 0.25;
          if (c.x + 50 < 0) c.x = W + Math.random() * 160;
        }
      }

      /* ── idle / dead — no physics update ── */
      if (s.state !== 'running') {
        /* advance idle run animation */
        if (s.state === 'idle') {
          s.dino.frameTick++;
          if (s.dino.frameTick >= 6) { s.dino.frame++; s.dino.frameTick = 0; }
        }
        /* advance death animation */
        if (s.state === 'dead') {
          /* if we died mid-jump, fall to the floor instead of hovering */
          const floorY = GROUND_Y - SPRITE_H + FOOT_OFFSET;
          if (s.dino.y < floorY) {
            s.dino.vy += GRAVITY;
            s.dino.y = Math.min(floorY, s.dino.y + s.dino.vy);
            if (s.dino.y >= floorY) { s.dino.vy = 0; s.dino.onGround = true; }
          }
          s.dino.deathTick++;
          if (s.dino.deathTick >= 7) {
            s.dino.deathTick = 0;
            if (s.dino.deathFrame < DEATH_FRAMES - 1) s.dino.deathFrame++;
          }
        }

        drawCharacter(ctx, s.dino, s.state);
        drawImpact(ctx, s.impact);

        ctx.fillStyle = isDark ? '#c8c8e8' : '#535353';
        ctx.textAlign = 'center';
        if (s.state === 'idle') {
          ctx.font = 'bold 13px monospace';
          ctx.fillText('Press Space / Tap to Play', W / 2, H / 2 - 8);
          ctx.font = '10px monospace';
          ctx.fillStyle = isDark ? '#8888aa' : '#888';
          ctx.fillText('↑ Space = Jump   ↓ = Duck', W / 2, H / 2 + 10);
        } else {
          ctx.font = 'bold 13px monospace';
          ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
          ctx.font = '10px monospace';
          ctx.fillStyle = isDark ? '#8888aa' : '#888';
          ctx.fillText('Space / Tap to Restart', W / 2, H / 2 + 8);
        }

        ctx.fillStyle = isDark ? '#7070a0' : '#aaa';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`HI ${String(Math.floor(s.hi / 6)).padStart(5, '0')}`, W - 8, 18);
        return;
      }

      /* ── physics ── */
      s.score++;
      s.speed = Math.min(MAX_SPEED, BASE_SPEED + s.score * SPEED_INC);
      if (s.score > s.hi) s.hi = s.score;
      if (s.score % 600 === 0) playSound('milestone'); // every 100 displayed points

      const d = s.dino;
      const wasAirborne = !d.onGround;
      // holding ↓ in the air pulls the character down much faster
      d.vy += wasAirborne && s.downHeld ? GRAVITY * FAST_FALL_GRAVITY : GRAVITY;
      d.y  += d.vy;
      if (d.y >= GROUND_Y - SPRITE_H + FOOT_OFFSET) {
        d.y = GROUND_Y - SPRITE_H + FOOT_OFFSET;
        d.vy = 0;
        d.onGround = true;
        // landed while ↓ is still held -> go straight into the duck
        if (wasAirborne && s.downHeld) { d.ducking = true; d.frame = 2; d.frameTick = 0; }
      }

      /* advance run / fall frame */
      d.frameTick++;
      const tickRate = d.ducking ? 14 : 6;
      if (d.frameTick >= tickRate) {
        // stop advancing once the hold frame is reached so pose freezes
        if (!d.ducking || d.frame < 3) { d.frame++; }
        d.frameTick = 0;
      }

      /* wing flap */
      s.wingTick++;
      if (s.wingTick >= 10) { s.wingFrame++; s.wingTick = 0; }

      /* spawn obstacles — difficulty (0..1) follows how close we are to top speed */
      s.nextObs--;
      if (s.nextObs <= 0) {
        const diff = (s.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
        let extraFrames = 0;
        const bird = s.score > 250 && Math.random() < 0.15 + 0.25 * diff;
        if (bird) {
          // low plane sits at head height: it hits a standing runner (head at y≈150)
          // but passes over a ducking one (crouched head at y≈162)
          const by = Math.random() < 0.5 ? GROUND_Y - 50.6 : GROUND_Y - 90;
          // same size / hitbox either way — the spaceship is just a different skin for the flying obstacle
          s.obstacles.push({ x: W + 10, y: by, w: 57, h: 30, kind: 'bird', art: Math.random() < 0.5 ? 'ufo' : 'plane' });
        } else {
          const h = 50 + Math.floor(Math.random() * 2) * 16;
          s.obstacles.push({ x: W + 10, y: GROUND_Y - h, w: 28, h, kind: 'cactus' });
          // later on, some buildings come in pairs — the pair is still cleared by a single jump
          if (diff > 0.2 && Math.random() < 0.15 + 0.3 * diff) {
            const h2 = 50 + Math.floor(Math.random() * 2) * 16;
            s.obstacles.push({ x: W + 10 + 28 + PAIR_GAP, y: GROUND_Y - h2, w: 28, h: h2, kind: 'cactus' });
            extraFrames = Math.ceil((28 + PAIR_GAP) / s.speed);
          }
        }
        // The time between obstacles never drops below MIN_GAP_FRAMES (jump airtime ≈ 43 frames + landing/reaction),
        // so every obstacle stays dodgeable however fast it gets — only the random extra shrinks.
        s.nextObs = MIN_GAP_FRAMES + extraFrames + Math.floor(Math.random() * (70 - 40 * diff));
      }

      /* dust kicked up while sliding (ducking on the ground) — chunky square pixels like the sprite art */
      if (d.ducking && d.onGround) {
        s.smokeTick++;
        if (s.smokeTick % 2 === 0) {
          s.smoke.push({
            x: DINO_X + 14 + Math.random() * 14, y: GROUND_Y - 2 - Math.random() * 4,
            vx: -(0.4 + Math.random() * 0.9), vy: -(0.1 + Math.random() * 0.35),
            life: 0, max: 20 + Math.floor(Math.random() * 12),
          });
        }
      }
      ctx.fillStyle = isDark ? '#c8c8e8' : '#8c8c8c';
      for (let i = s.smoke.length - 1; i >= 0; i--) {
        const p = s.smoke[i];
        p.life++;
        p.x += p.vx - s.speed;      // drifts back with the scrolling ground
        p.y += p.vy;
        if (p.life >= p.max || p.x < -8) { s.smoke.splice(i, 1); continue; }
        const t = p.life / p.max;
        const size = t > 0.4 ? SMOKE_PX * 2 : SMOKE_PX;       // puffs grow a pixel step as they age
        ctx.globalAlpha = t > 0.66 ? 0.22 : t > 0.33 ? 0.45 : 0.75; // …and fade in steps
        ctx.fillRect(Math.round(p.x / SMOKE_PX) * SMOKE_PX, Math.round(p.y / SMOKE_PX) * SMOKE_PX - size, size, size);
      }
      ctx.globalAlpha = 1;

      /* draw & check obstacles */
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const o = s.obstacles[i];
        o.x -= s.speed;
        if (o.x + o.w < 0) { s.obstacles.splice(i, 1); continue; }

        if (o.kind === 'cactus') drawBuilding(ctx, o);
        else if (o.art === 'ufo') {
          // pixel-art spaceship: drawn crisp in its original orientation, centred on the plane-sized hitbox
          const ufo = imgs.current!.ufo;
          if (ufo.complete && ufo.naturalWidth > 0) {
            const uw = 64, uh = Math.round((64 * ufo.naturalHeight) / ufo.naturalWidth);
            const bob = Math.round(Math.sin((s.wingFrame + s.wingTick / 10) * 0.8) * 2); // slight hover, visual only
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.translate(o.x + o.w / 2, o.y + o.h / 2 + bob);
            ctx.drawImage(ufo, -uw / 2, -uh / 2, uw, uh);
            ctx.restore();
          }
        }
        else drawPlane(ctx, o);

        /* collision — tight hitbox */
        const mx = 10, my = 8;
        const dw = SPRITE_W - 14;
        // Visible pixels of the sprite, measured from d.y (72px sprite, 1.125x scale):
        //   standing / running: y 16 → 50     ducking (crouch): y 28 → 53
        // so a ducking character's head is ~12px lower and clears a low plane.
        const hbTop    = d.y + (d.ducking ? 28 : 16) + 3;
        const hbBottom = d.y + (d.ducking ? 53 : 50) - 3;
        if (
          DINO_X + mx     < o.x + o.w - mx &&
          DINO_X + dw - mx > o.x + mx      &&
          hbTop           < o.y + o.h - my &&
          hbBottom        > o.y + my
        ) {
          if (s.state !== 'dead') { // only the first hit of a frame triggers the crash
            s.state = 'dead';
            // impact burst at the middle of the overlap between the character and the obstacle
            const ix = (Math.max(DINO_X + mx, o.x + mx) + Math.min(DINO_X + dw - mx, o.x + o.w - mx)) / 2;
            const iy = (Math.max(hbTop, o.y + my) + Math.min(hbBottom, o.y + o.h - my)) / 2;
            spawnImpact(s.impact, ix, iy, o.kind);
            s.shake = 14;
            playSound('die');
          }
        }
      }

      /* draw character */
      drawCharacter(ctx, d, s.state);
      drawImpact(ctx, s.impact);

      /* HUD */
      ctx.fillStyle = isDark ? '#c8c8e8' : '#535353';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      const sc = String(Math.floor(s.score / 6)).padStart(5, '0');
      const hi = String(Math.floor(s.hi   / 6)).padStart(5, '0');
      ctx.fillText(`HI ${hi}  ${sc}`, W - 8, 18);
    }

    g.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(g.current.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* sounds only while the game is actually on screen — never from the background */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(([entry]) => { gameOnScreen = entry.isIntersecting; }, { threshold: 0.3 });
    io.observe(canvas);
    return () => { io.disconnect(); gameOnScreen = false; };
  }, []);

  /* expanded view: mirror the live canvas every frame, and close on Esc */
  useEffect(() => {
    if (!expanded) return;
    let raf = 0;
    const mirror = () => {
      const src = canvasRef.current;
      const ctx = bigRef.current?.getContext('2d');
      if (src && ctx) ctx.drawImage(src, 0, 0);
      raf = requestAnimationFrame(mirror);
    };
    raf = requestAnimationFrame(mirror);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  }, [expanded]);

  /* ── keyboard ── */
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
      if (e.code === 'ArrowDown') { e.preventDefault(); setDuck(true); }
    };
    const ku = (e: KeyboardEvent) => { if (e.code === 'ArrowDown') setDuck(false); };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [jump, setDuck]);

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 16 }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="0" y="0" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
            <rect x="7" y="0" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
            <rect x="0" y="7" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
            <rect x="7" y="7" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>app-backend</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--color-purple-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="animate-blink">↻</span> Playing
          </span>
          <button
            type="button" onClick={(e) => { e.currentTarget.blur(); setExpanded(true); }} aria-label="Expand game" title="Expand"
            style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-gray-500)' }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M7 1h4v4M5 11H1V7M11 1L7 5M1 11l4-4" />
            </svg>
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={jump}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          cursor: 'pointer',
          touchAction: 'manipulation',

          border: '1px solid var(--color-border)',
          background: '#f7f7f7',
        }}
      />
      <div style={{ fontSize: 10, color: 'var(--color-gray-500)', textAlign: 'center', letterSpacing: '.06em', marginTop: 8 }}>
        SPACE / ↑ = JUMP &nbsp;·&nbsp; ↓ = DUCK &nbsp;·&nbsp; TAP = JUMP
      </div>

      {/* Semi full-screen view — same overlay style as the lyrics / typing test. Mirrors the live game canvas. */}
      {expanded && createPortal(
        <div
          role="dialog" aria-modal="true" aria-label="Endless runner"
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px 6.25%', overflowY: 'auto',
            background: 'color-mix(in srgb, var(--color-background) 80%, transparent)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <button
            type="button" onClick={() => setExpanded(false)} aria-label="Close game" className="btn-render-secondary"
            style={{ position: 'absolute', top: 20, right: '6.25%', height: 36, padding: '0 14px', fontSize: 13 }}
          >
            <span>Close</span>
          </button>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 24 }}>
            Endless runner
          </p>
          <canvas
            ref={bigRef} width={W} height={H} onClick={jump}
            style={{
              width: '100%', maxWidth: 'min(1100px, calc((100vh - 220px) * 560 / 230))', height: 'auto', display: 'block',
              imageRendering: 'pixelated', cursor: 'pointer', touchAction: 'manipulation', border: '1px solid var(--color-border)',
            }}
          />
          <div style={{ marginTop: 28, fontSize: 12, color: 'var(--color-gray-500)', letterSpacing: '.04em' }}>
            <span style={{ fontSize: 11, padding: '2px 6px', border: '1px solid var(--color-border)', marginRight: 6 }}>space</span>jump
            <span style={{ fontSize: 11, padding: '2px 6px', border: '1px solid var(--color-border)', margin: '0 6px 0 20px' }}>↓</span>duck
            <span style={{ fontSize: 11, padding: '2px 6px', border: '1px solid var(--color-border)', margin: '0 6px 0 20px' }}>esc</span>close
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
