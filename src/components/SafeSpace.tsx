'use client';

import { useEffect } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import ParticlesRaw from './Particles';

// Particles.jsx is plain JS, so TS infers every defaulted prop as required - declare the ones we use.
const Particles = ParticlesRaw as ComponentType<{
  particleColors?: string[]; particleCount?: number; particleSpread?: number; speed?: number;
  particleBaseSize?: number; glow?: number; twinkle?: number; moveParticlesOnHover?: boolean;
  hoverEffect?: string; sizeRandomness?: number; shape?: string; depthOfField?: number;
  connections?: boolean; connectionDistance?: number; particleHoverFactor?: number; hoverRadius?: number;
  drift?: string; driftSpeed?: number; alphaParticles?: boolean; disableRotation?: boolean;
  cameraDistance?: number; variation?: number; opacity?: number; clickBurst?: boolean;
  intro?: boolean; lightMode?: boolean; style?: CSSProperties;
}>;

/* Schrödinger's cats drifting through space. Deterministic (seeded) so server and client render the same layout.
   A jittered 6x4 grid keeps them evenly spread without overlapping; a few edge cats are pushed off-screen so they get cropped. */
const CAT_SRC = ['/schrodinger-s-cat-1.png', '/schrodinger-s-cat-2.png'];
const COLS = 6, ROWS = 4;
const CATS = (() => {
  let seed = 11;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    let left = ((col + 0.5 + (rand() - 0.5) * 0.6) / COLS) * 100;
    let top = 7 + ((row + 0.5 + (rand() - 0.5) * 0.6) / ROWS) * 96; // starts below the navbar
    if (col === 0 && rand() < 0.5) left -= 4;
    if (col === COLS - 1 && rand() < 0.5) left += 4;
    if (row === ROWS - 1 && rand() < 0.5) top += 5;
    return {
      src: CAT_SRC[Math.floor(rand() * CAT_SRC.length)],
      left, top,
      size: 70 + rand() * 120,                      // px at 1920 wide
      rot: rand() * 360,                            // any orientation, like the reference
      spin: (rand() < 0.5 ? -1 : 1) * (10 + rand() * 30),
      dx: (rand() - 0.5) * 70,
      dy: (rand() - 0.5) * 70,
      dur: 28 + rand() * 32,
      delay: -rand() * 30,
    };
  });
})();
type Cat = (typeof CATS)[number];

function FloatingCat({ c, mx, my }: { c: Cat; mx: MotionValue<number>; my: MotionValue<number> }) {
  // Bigger cats read as closer, so they shift more - same opposite-to-cursor parallax as the particles.
  const amp = 10 + c.size * 0.2;
  const px = useTransform(mx, (v) => -v * amp);
  const py = useTransform(my, (v) => -v * amp);

  return (
    <div
      style={{
        position: 'absolute', left: `${c.left}%`, top: `${c.top}%`, transform: 'translate(-50%, -50%)',
        width: `clamp(${Math.round(c.size * 0.45)}px, ${(c.size / 19.2).toFixed(2)}vw, ${Math.round(c.size)}px)`,
        aspectRatio: '1 / 1',
      }}
    >
      <motion.div style={{ position: 'absolute', inset: 0, x: px, y: py }}>
        <motion.div
          initial={{ x: 0, y: 0, rotate: c.rot }}
          animate={{ x: [0, c.dx, 0], y: [0, c.dy, 0], rotate: [c.rot, c.rot + c.spin, c.rot] }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Image src={c.src} alt="" fill sizes="200px" draggable={false} style={{ objectFit: 'contain' }} />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Easter-egg page reached through the Rick & Morty portal. Blank for now: deep space with floating cats. */
export default function SafeSpace() {
  // Normalised cursor position (-1..1), smoothed, shared by every cat.
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const mx = useSpring(nx, { stiffness: 50, damping: 18, mass: 0.8 });
  const my = useSpring(ny, { stiffness: 50, damping: 18, mass: 0.8 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      nx.set((e.clientX / window.innerWidth) * 2 - 1);
      ny.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => { nx.set(0); ny.set(0); };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [nx, ny]);

  return (
    <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', color: '#fff' }}>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, background: '#05040a' }}>
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={450}
          particleSpread={12}
          speed={0.1}
          particleBaseSize={100}
          glow={0.1}
          twinkle={0.3}
          moveParticlesOnHover
          hoverEffect="parallax"
          sizeRandomness={1}
          shape="circle"
          depthOfField={0}
          connections={false}
          connectionDistance={110}
          particleHoverFactor={1}
          hoverRadius={140}
          drift="none"
          driftSpeed={1}
          alphaParticles={false}
          disableRotation={false}
          cameraDistance={20}
          variation={0}
          opacity={1}
          clickBurst
          intro
          lightMode={false}
        />

        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {CATS.map((c, i) => <FloatingCat key={i} c={c} mx={mx} my={my} />)}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          Safe Space
        </h1>
      </motion.div>
    </main>
  );
}
