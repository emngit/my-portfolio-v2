'use client';

import { useEffect, useRef, useCallback } from 'react';

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
const BASE_SPEED = 4.5;
const SPEED_INC = 0.0005;

interface DinoState {
  y: number; vy: number; onGround: boolean;
  frame: number; frameTick: number; ducking: boolean;
  deathFrame: number; deathTick: number;
}
interface Obstacle { x: number; y: number; w: number; h: number; kind: 'cactus' | 'bird'; }
interface Cloud     { x: number; y: number; }

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

/* ── component ── */
export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* preload all sprites once into a stable ref */
  const imgs = useRef<{
    run:   HTMLImageElement[];
    fall:  HTMLImageElement[];
    death: HTMLImageElement[];
    duck:  HTMLImageElement[];
    idle:  HTMLImageElement;
  } | null>(null);

  if (!imgs.current && typeof window !== 'undefined') {
    imgs.current = {
      run:   Array.from({ length: RUN_FRAMES },   (_, i) => loadImage(runSrc(i))),
      fall:  Array.from({ length: FALL_FRAMES },  (_, i) => loadImage(fallSrc(i))),
      death: Array.from({ length: DEATH_FRAMES }, (_, i) => loadImage(deathSrc(i))),
      duck:  Array.from({ length: DUCK_FRAMES },  (_, i) => loadImage(duckSrc(i))),
      idle:  loadImage(idleSrc),
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
  });

  const startOrRestart = useCallback(() => {
    const s = g.current;
    s.dino = {
      y: GROUND_Y - SPRITE_H + FOOT_OFFSET, vy: 0, onGround: true,
      frame: 0, frameTick: 0, ducking: false,
      deathFrame: 0, deathTick: 0,
    };
    s.obstacles = [];
    s.score = 0;
    s.speed = BASE_SPEED;
    s.nextObs = 70;
    s.state = 'running';
  }, []);

  const jump = useCallback(() => {
    const s = g.current;
    if (s.state === 'idle' || s.state === 'dead') { startOrRestart(); return; }
    if (s.dino.onGround) {
      s.dino.vy = JUMP_V;
      s.dino.onGround = false;
      s.dino.ducking = false;
    }
  }, [startOrRestart]);

  const setDuck = useCallback((on: boolean) => {
    const s = g.current;
    if (s.state !== 'running') return;
    if (s.dino.onGround) {
      // start at pickup_ground_3 (index 2) immediately on press — no tick delay
      if (on && !s.dino.ducking) { s.dino.frame = 2; s.dino.frameTick = 0; }
      // on release, reset so run cycle resumes cleanly
      if (!on && s.dino.ducking) { s.dino.frame = 0; s.dino.frameTick = 0; }
      s.dino.ducking = on;
    }
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
      ctx.drawImage(img, DINO_X, d.y, SPRITE_W, SPRITE_H);
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
      ctx.fillRect(0, 0, W, GROUND_Y);

      /* ── ground strip ── */
      ctx.fillStyle = isDark ? '#1a1a2e' : '#c8b89a';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      /* ── sun / moon ── */
      if (isDark) {
        // moon — white circle with a grey crater circle offset
        ctx.fillStyle = '#e8e8d0';
        ctx.beginPath(); ctx.arc(W - 60, 38, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c8c8a8';
        ctx.beginPath(); ctx.arc(W - 54, 32, 6, 0, Math.PI * 2); ctx.fill();
        // stars — fixed positions via seeded pattern
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        [[40,15],[120,8],[200,20],[300,6],[420,18],[500,10],[80,30],[350,25],[460,35]].forEach(([sx,sy]) => {
          ctx.fillRect(sx, sy, 2, 2);
        });
      } else {
        // sun — yellow circle with rays
        ctx.fillStyle = '#ffe566';
        ctx.beginPath(); ctx.arc(W - 60, 38, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(W - 60, 38, 14, 0, Math.PI * 2); ctx.fill();
        // rays
        ctx.strokeStyle = '#ffe566';
        ctx.lineWidth = 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(W - 60 + Math.cos(a) * 20, 38 + Math.sin(a) * 20);
          ctx.lineTo(W - 60 + Math.cos(a) * 28, 38 + Math.sin(a) * 28);
          ctx.stroke();
        }
      }

      /* ground line */
      ctx.strokeStyle = isDark ? '#3a3a5a' : '#888';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 2); ctx.lineTo(W, GROUND_Y + 2); ctx.stroke();

      /* ground pebbles — only scroll when not dead */
      ctx.fillStyle = isDark ? '#2a2a4a' : '#aaa';
      if (s.state !== 'dead') s.pebbleOff = (Date.now() / 6) % 55;
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
          s.dino.deathTick++;
          if (s.dino.deathTick >= 7) {
            s.dino.deathTick = 0;
            if (s.dino.deathFrame < DEATH_FRAMES - 1) s.dino.deathFrame++;
          }
        }

        drawCharacter(ctx, s.dino, s.state);

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
      s.speed = BASE_SPEED + s.score * SPEED_INC;
      if (s.score > s.hi) s.hi = s.score;

      const d = s.dino;
      d.vy += GRAVITY;
      d.y  += d.vy;
      if (d.y >= GROUND_Y - SPRITE_H + FOOT_OFFSET) {
        d.y = GROUND_Y - SPRITE_H + FOOT_OFFSET;
        d.vy = 0;
        d.onGround = true;
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

      /* spawn obstacles */
      s.nextObs--;
      if (s.nextObs <= 0) {
        const bird = s.score > 250 && Math.random() < 0.3;
        if (bird) {
          // low bird raised so a ducking character (≈40px tall) fits under it
          const by = Math.random() < 0.5 ? GROUND_Y - 75 : GROUND_Y - 120;
          s.obstacles.push({ x: W + 10, y: by, w: 57, h: 30, kind: 'bird' });
        } else {
          const h = 50 + Math.floor(Math.random() * 2) * 16;
          s.obstacles.push({ x: W + 10, y: GROUND_Y - h, w: 28, h, kind: 'cactus' });
        }
        s.nextObs = 55 + Math.floor(Math.random() * 65);
      }

      /* draw & check obstacles */
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const o = s.obstacles[i];
        o.x -= s.speed;
        if (o.x + o.w < 0) { s.obstacles.splice(i, 1); continue; }

        if (o.kind === 'cactus') drawBuilding(ctx, o);
        else drawPlane(ctx, o);

        /* collision — tight hitbox */
        const mx = 10, my = 8;
        const dw = SPRITE_W - 14;
        // ducking character is about 40px tall (sprite sits higher with transparent bottom)
        const dh = d.ducking ? 40 : SPRITE_H - 8;
        if (
          DINO_X + mx     < o.x + o.w - mx &&
          DINO_X + dw - mx > o.x + mx      &&
          d.y    + my     < o.y + o.h - my &&
          d.y    + dh - my > o.y + my
        ) {
          s.state = 'dead';
        }
      }

      /* draw character */
      drawCharacter(ctx, d, s.state);

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
        <span style={{ fontSize: 11, color: 'var(--color-purple-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="animate-blink">↻</span> Playing
        </span>
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
          border: '1px solid var(--color-border)',
          background: '#f7f7f7',
        }}
      />
      <div style={{ fontSize: 10, color: 'var(--color-gray-500)', textAlign: 'center', letterSpacing: '.06em', marginTop: 8 }}>
        SPACE / ↑ = JUMP &nbsp;·&nbsp; ↓ = DUCK &nbsp;·&nbsp; TAP = JUMP
      </div>
    </div>
  );
}
