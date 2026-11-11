'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const SAFE_SPACE_PATH = '/safe-space';

const NAVIGATE_AT_MS = 1500; // liquid fully covers the page by now
const MIN_COVER_MS = 2400;   // minimum time before the hole starts opening on the other side
const EXIT_MS = 1500;
const SAFETY_MS = 6000;      // never leave the overlay up if navigation stalls

type Phase = 'idle' | 'enter' | 'exit';
interface Origin { x: number; y: number }
interface Clock { current: number }

const Ctx = createContext<{ enterPortal: (x: number, y: number) => void } | null>(null);

export function usePortalTransition() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePortalTransition must be used inside <PortalTransitionProvider>');
  return ctx;
}

/* ─────────────────────────────────────────────────────────────
   Liquid portal shader
   - flat, cel-shaded greens like Rick's portal (light / mid / dark)
   - a tunnel mapped in (angle, log radius) so noise "flows" outward = flying through
   - domain-warped noise makes the swirls blobby / liquid
   - the edge is a noisy, wobbling circle with a bright rim, white flecks and a glow
   uMode 0: liquid grows out of the portal   uMode 1: a liquid-edged hole opens, revealing the page
   ───────────────────────────────────────────────────────────── */
const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uCenter;
uniform float uMode;
uniform float uRadius;
uniform float uFlow;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 p = frag - uCenter;
  float scale = length(uRes);
  float len = max(length(p), 0.0001);
  float r = len / scale;
  vec2 dir = p / len;
  float ang = atan(p.y, p.x);

  // wobbling, ragged liquid edge
  float edgeA = fbm(vec3(dir * 1.7, uTime * 0.8)) - 0.5;
  float edgeB = noise(vec3(dir * 6.0, uTime * 1.9)) - 0.5;
  float edge = uRadius * (1.0 + edgeA * 0.45 + edgeB * 0.12);

  // s > 0 where there is liquid
  float s = (uMode < 0.5) ? (edge - r) : (r - edge);
  float cover = smoothstep(0.0, 0.004, s);

  // spiral tunnel, flowing outward as uFlow grows
  float lr = log(max(r, 0.002));
  float a = ang + lr * 1.7 + uTime * 0.45;
  vec3 q = vec3(cos(a) * 1.25, sin(a) * 1.25, lr * 1.35 - uFlow);
  vec3 w = vec3(
    fbm(q * 1.2 + vec3(0.0, 0.0, uTime * 0.35)),
    fbm(q * 1.2 + vec3(5.2, 1.3, uTime * 0.35)),
    0.0);
  float n = fbm(q * 1.5 + w * 1.7);

  vec3 cDark  = vec3(0.137, 0.549, 0.278); // #238c47
  vec3 cMid   = vec3(0.373, 0.682, 0.290); // #5fae4a
  vec3 cLight = vec3(0.651, 0.796, 0.333); // #a6cb55
  vec3 col = cDark;
  col = mix(col, cMid,   smoothstep(0.380, 0.395, n));
  col = mix(col, cLight, smoothstep(0.520, 0.535, n));
  col *= 0.5 + 0.5 * smoothstep(0.0, 0.14, r); // deeper toward the vanishing point

  // bright rim hugging the edge
  float rim = smoothstep(0.045, 0.0, s);
  col = mix(col, vec3(0.78, 0.92, 0.42), rim);

  // white flecks speckled around the rim, like the holes in the artwork
  float f = noise(vec3(p / scale * 60.0, uTime * 0.5));
  float zone = smoothstep(0.10, 0.04, s) * step(0.0, s);
  col = mix(col, vec3(0.97, 1.0, 0.90), smoothstep(0.78, 0.81, f) * zone);

  // soft green glow just outside the liquid
  float glowA = exp(min(s, 0.0) * 36.0) * 0.55 * (1.0 - cover);
  glowA *= smoothstep(0.0, 0.02, uRadius) * (1.0 - smoothstep(1.0, 1.25, uRadius));

  vec3 rgb = col * cover + vec3(0.55, 1.0, 0.5) * glowA;
  gl_FragColor = vec4(rgb, cover + glowA);
}
`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Portal shader error:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function PortalCanvas({ origin, phaseRef, enterStartRef, exitStartRef }: {
  origin: Origin; phaseRef: { current: Phase }; enterStartRef: Clock; exitStartRef: Clock;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!canvas) return;
    if (!gl) { canvas.style.background = '#238c47'; return; } // no WebGL: plain green cover

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.style.background = '#238c47'; return; }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u('uRes'), uTime = u('uTime'), uCenter = u('uCenter'), uMode = u('uMode'), uRadius = u('uRadius'), uFlow = u('uFlow');

    let raf = 0;
    let flow = 0;
    let last = performance.now();

    const frame = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);

      const exiting = phaseRef.current === 'exit';
      const t = (now - enterStartRef.current) / 1000;
      const te = (now - exitStartRef.current) / 1000;

      let radius: number, speed: number;
      let cx = origin.x, cy = origin.y;
      if (!exiting) {
        // pop open at the portal, then rush outward to swallow the screen
        radius = 0.08 * easeOut(t / 0.3) + 1.42 * Math.pow(clamp01((t - 0.25) / 1.1), 2.2);
        const k = smooth(0.3, 1.4, t);
        cx = origin.x + (w / 2 - origin.x) * k;
        cy = origin.y + (h / 2 - origin.y) * k;
        speed = 0.25 + 3.2 * smooth(0.2, 1.6, t);
      } else {
        // a liquid-edged hole opens in the middle, revealing the new page
        radius = 1.2 * Math.pow(clamp01(te / (EXIT_MS / 1000)), 1.7);
        cx = w / 2; cy = h / 2;
        speed = 3.4 - 2.9 * smooth(0, EXIT_MS / 1000, te);
      }
      flow += speed * dt;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uCenter, cx, cy);
      gl.uniform1f(uMode, exiting ? 1 : 0);
      gl.uniform1f(uRadius, radius);
      gl.uniform1f(uFlow, flow);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [origin, phaseRef, enterStartRef, exitStartRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}

/**
 * Full-screen "fly through the portal" transition. Sits under the navbar (z 50) and music player (z 70)
 * so both stay usable, and lives in the root layout so it survives the route change.
 */
export function PortalTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0 });
  const phaseRef = useRef<Phase>('idle');
  const enterStartRef = useRef(0);
  const exitStartRef = useRef(0);
  const mainAnimRef = useRef<Animation | null>(null);

  const enterPortal = useCallback((x: number, y: number) => {
    if (phase !== 'idle' || pathname === SAFE_SPACE_PATH) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(SAFE_SPACE_PATH);
      return;
    }

    enterStartRef.current = performance.now();
    setOrigin({ x, y });
    setPhase('enter');

    // The page itself gets sucked in towards the portal.
    const main = document.querySelector('main');
    if (main) {
      main.style.transformOrigin = `${x}px ${y + window.scrollY}px`;
      mainAnimRef.current = main.animate(
        [
          { transform: 'scale(1) rotate(0deg)', filter: 'blur(0px) brightness(1)' },
          { transform: 'scale(2.2) rotate(14deg)', filter: 'blur(10px) brightness(1.4)' },
        ],
        { duration: 1200, easing: 'cubic-bezier(.5,0,.9,.4)', fill: 'forwards' },
      );
    }

    window.setTimeout(() => router.push(SAFE_SPACE_PATH), NAVIGATE_AT_MS);
  }, [phase, pathname, router]);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === 'exit') exitStartRef.current = performance.now();

    if (phase === 'enter') {
      const arrived = pathname === SAFE_SPACE_PATH;
      const wait = arrived ? Math.max(0, MIN_COVER_MS - (performance.now() - enterStartRef.current)) : SAFETY_MS;
      const t = window.setTimeout(() => setPhase('exit'), wait);
      return () => window.clearTimeout(t);
    }
    if (phase === 'exit') {
      const t = window.setTimeout(() => setPhase('idle'), EXIT_MS);
      return () => window.clearTimeout(t);
    }
    mainAnimRef.current?.cancel();
    mainAnimRef.current = null;
  }, [phase, pathname]);

  return (
    <Ctx.Provider value={{ enterPortal }}>
      {children}

      {phase !== 'idle' && (
        <div
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, zIndex: 45, overflow: 'hidden', pointerEvents: phase === 'enter' ? 'auto' : 'none' }}
        >
          <PortalCanvas origin={origin} phaseRef={phaseRef} enterStartRef={enterStartRef} exitStartRef={exitStartRef} />
        </div>
      )}
    </Ctx.Provider>
  );
}
