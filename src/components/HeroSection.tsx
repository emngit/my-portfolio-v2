'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/* Render-style pixel-arrow SVG (copied from actual Render source) */
function PixelArrow({ size = 10 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size * 2} viewBox="0 0 10 20" fill="currentColor">
      <rect x="6" y="9" width="2" height="2" />
      <rect x="4" y="7" width="2" height="2" />
      <rect x="2" y="5" width="2" height="2" />
      <rect x="4" y="11" width="2" height="2" />
      <rect x="2" y="13" width="2" height="2" />
      <rect x="0" y="15" width="2" height="2" />
      <rect x="0" y="3"  width="2" height="2" />
    </svg>
  );
}

/* Animated sparkline bars */
function SparkBars({ n = 10, accent = false }: { n?: number; accent?: boolean }) {
  const [heights] = useState(() =>
    Array.from({ length: n }, () => 20 + Math.random() * 65)
  );
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36, width: '100%' }}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 3 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.5 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
          style={{
            flex: 1, borderRadius: 1,
            background: i >= n - 3
              ? (accent ? 'var(--color-purple-400)' : 'var(--color-green-400)')
              : (accent ? 'rgba(170,119,253,0.3)' : 'rgba(0,219,124,0.2)'),
          }}
        />
      ))}
    </div>
  );
}

/* Service card exactly like Render's production dashboard */
function ServiceCard({
  name, status, deploying = false, children,
}: {
  name: string;
  status?: string;
  deploying?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 16 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Render uses a small grid icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="0" y="0" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
            <rect x="7" y="0" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
            <rect x="0" y="7" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
            <rect x="7" y="7" width="5" height="5" rx="1" fill="var(--color-gray-500)" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{name}</span>
        </div>
        {deploying ? (
          <span style={{ fontSize: 11, color: 'var(--color-purple-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="animate-blink">↻</span> Deploying
          </span>
        ) : status ? (
          <span style={{ fontSize: 11, color: 'var(--color-green-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ✓ {status}
          </span>
        ) : null}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

/* Single metric cell */
function MetricCell({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', padding: '10px 12px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--color-gray-500)', marginBottom: 8, textTransform: 'uppercase' }}>
        {label}
      </div>
      <SparkBars n={8} accent={accent} />
    </div>
  );
}

/* count-up */
function useCountUp(target: number, delayMs = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const step = target / 30;
      const id = setInterval(() => {
        c += step;
        if (c >= target) { setN(target); clearInterval(id); }
        else setN(Math.floor(c));
      }, 40);
    }, delayMs);
    return () => clearTimeout(t);
  }, [target, delayMs]);
  return n;
}

export default function HeroSection() {
  const [phrase, setPhrase] = useState(0);
  const phrases = ['Ensuring quality.', 'Building confidence.', 'Improving experiences.'];

  useEffect(() => {
    const id = setInterval(() => setPhrase(p => (p + 1) % phrases.length), 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proj = useCountUp(3, 600);
  const yrs  = useCountUp(5,  800);
  const tech = useCountUp(25, 1000);

  return (
    <section
      id="home"
      className="bg-grid section-border-b"
      style={{
        background: 'var(--hero-gradient)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 'var(--nav-height)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', padding: '0 6.25%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'center', minHeight: 'calc(100vh - var(--nav-height))' }}>

        {/* ── LEFT ── */}
        <div style={{ padding: '80px 48px 80px 0', display: 'flex', flexDirection: 'column', gap: 28 }}>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Headline — exact Render weight/size */}
            <h1 className="text-heading-lg-new" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              Lanusga, <br /> John Emman
            </h1>
            {/* Rotating phrase — smaller than the name */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'clamp(22px, 2.8vw, 40px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              <span className="gradient-text">
                <motion.span
                  key={phrase}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {phrases[phrase]}
                </motion.span>
              </span>
              {/* blinking cursor */}
              <span
                className="animate-blink"
                style={{ display: 'inline-block', width: '0.45ch', height: '0.85em', background: 'linear-gradient(180deg, rgba(55,49,69,0.16), rgba(55,49,69,0.47))', verticalAlign: 'middle' }}
              />
            </div>

            {/* Body copy */}
            <p className="text-body-xl-new" style={{ color: 'var(--color-text-faint)', maxWidth: 480 }}>
              Full Stack Developer specialising in modern web applications,
              AI‑powered solutions, cloud systems, and enterprise‑grade platforms.
            </p>
          </motion.div>

          {/* Buttons — exact Render style */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
          >
            <button
              className="btn-render-primary"
              onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>View Projects</span>
              <PixelArrow />
            </button>
            <button
              className="btn-render-secondary"
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Contact Me</span>
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 40, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}
          >
            {[
              { val: `${proj}+`, label: 'Projects' },
              { val: `${yrs}+`,  label: 'Years experience' },
              { val: `${tech}+`, label: 'Technologies' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-faint)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT — Render-style production dashboard ── */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ position: 'relative', padding: '40px 0 40px 40px' }}
          className="hidden lg:block"
        >
          {/* Render uses a grid of column borders as decoration */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.5 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 25}%`, width: 1, background: 'var(--color-border)' }} />
            ))}
          </div>

          {/* git push terminal card */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, left: '30%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'monospace', fontSize: 14, zIndex: 10,
            }}
          >
            <span style={{ color: 'var(--color-gray-500)' }}>$</span>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, letterSpacing: '.02em' }}>git push</span>
          </motion.div>

          {/* Connector line */}
          <div style={{
            position: 'absolute', top: 44, left: 'calc(30% + 44px)',
            width: 1, height: 40, zIndex: 5,
            background: 'linear-gradient(180deg, var(--color-purple-500) 0%, transparent 100%)',
          }} />

          {/* Production panel */}
          <div style={{ marginTop: 80, background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}>
            {/* Panel header */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>PRODUCTION</span>
              <span style={{ fontSize: 11, color: 'var(--color-green-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="animate-pulse-green" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-green-400)', display: 'inline-block' }} />
                LIVE
              </span>
            </div>

            {/* Service cards */}
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ServiceCard name="app-backend" deploying>
                <MetricCell label="MEMORY" accent />
                <MetricCell label="CPU" accent />
                <MetricCell label="INSTANCES" />
                <MetricCell label="REQUESTS" />
              </ServiceCard>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ServiceCard name="app-database" status="Available">
                  <MetricCell label="MEMORY" />
                  <MetricCell label="CPU" />
                  <MetricCell label="STORAGE" />
                  <MetricCell label="CONNECTIONS" />
                </ServiceCard>
                <ServiceCard name="app-frontend" status="Available">
                  <MetricCell label="MEMORY" accent />
                  <MetricCell label="CPU" accent />
                  <MetricCell label="BANDWIDTH" />
                </ServiceCard>
              </div>
            </div>
          </div>

          {/* Purple color block — Render has a bold purple rectangle in the lower right */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            style={{
              position: 'absolute', bottom: 10, right: -20, zIndex: 10,
              width: 100, height: 100,
              background: 'var(--color-purple-600)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10,
            }}
          >
            {[60, 40, 80].map((w, i) => (
              <div key={i} style={{ height: 4, width: `${w}%`, background: 'rgba(255,255,255,0.5)', marginBottom: i < 2 ? 4 : 0 }} />
            ))}
          </motion.div>

          {/* Open to work chip */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            style={{
              position: 'absolute', bottom: 60, left: -10, zIndex: 10,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-green-400)',
            }}
          >
            <span className="animate-pulse-green" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-green-400)', display: 'inline-block' }} />
            Open to Work
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <span style={{ fontSize: 11, color: 'var(--color-gray-500)', letterSpacing: '.08em', textTransform: 'uppercase' }}>scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 16, height: 26, border: '1px solid var(--color-gray-700)', borderRadius: 8, display: 'flex', justifyContent: 'center', paddingTop: 6 }}
        >
          <div style={{ width: 3, height: 6, borderRadius: 2, background: 'var(--color-purple-400)' }} />
        </motion.div>
      </motion.div>

    </section>
  );
}
