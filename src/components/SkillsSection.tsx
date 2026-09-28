'use client';

import { motion } from 'framer-motion';

const groups = [
  { category: 'Frontend',   color: 'var(--color-purple-400)', skills: [{ name: 'React', pct: 90 }, { name: 'Vue.js', pct: 78 }, { name: 'HTML / CSS', pct: 95 }, { name: 'JavaScript', pct: 88 }] },
  { category: 'Backend',    color: 'var(--color-green-400)',  skills: [{ name: 'Node.js', pct: 82 }, { name: 'Python', pct: 80 }, { name: 'Java', pct: 75 }, { name: 'PHP', pct: 72 }] },
  { category: 'Languages',  color: '#33acff',                 skills: [{ name: 'C++', pct: 70 }, { name: 'C#', pct: 68 }, { name: 'JavaScript', pct: 88 }, { name: 'Python', pct: 80 }] },
  { category: 'Databases',  color: '#ecd60e',                 skills: [{ name: 'MySQL / SQL', pct: 85 }, { name: 'PostgreSQL', pct: 82 }, { name: 'SQLite', pct: 75 }, { name: 'ER Modeling', pct: 78 }] },
];

/* ── thesvg.org CDN — default variant for every icon ── */
const T = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons';

const ROW1: { name: string; url: string }[] = [
  { name: 'JavaScript',        url: `${T}/javascript/default.svg` },
  { name: 'Python',            url: `${T}/python/default.svg` },
  { name: 'Java',              url: `${T}/java/default.svg` },
  { name: 'HTML',              url: `${T}/html5/default.svg` },
  { name: 'CSS',               url: `${T}/css/default.svg` },
  { name: 'PHP',               url: `${T}/php/default.svg` },
  { name: 'Node.js',           url: `${T}/nodejs/default.svg` },
  { name: 'C++',               url: `${T}/cplusplus/default.svg` },
  { name: 'C#',                url: `${T}/csharp/default.svg` },
  { name: 'React',             url: `${T}/react/default.svg` },
  { name: 'Vue.js',            url: `${T}/vue/default.svg` },
  { name: 'Unity',             url: `${T}/unity/default.svg` },
  { name: 'Salesforce',        url: `${T}/salesforce/default.svg` },
];

const ROW2: { name: string; url: string }[] = [
  { name: 'Jira',              url: `${T}/jira/default.svg` },
  { name: 'Git',               url: `${T}/git/default.svg` },
  { name: 'Unity',             url: `${T}/unity/default.svg` },
  { name: 'CodeIgniter',       url: `${T}/codeigniter/default.svg` },
  { name: 'Figma',             url: `${T}/figma/default.svg` },
  { name: 'Adobe Illustrator', url: `${T}/illustrator/default.svg` },
  { name: 'Adobe Photoshop',   url: `${T}/photoshop/default.svg` },
  { name: 'Adobe Premiere',    url: `${T}/premiere/default.svg` },
  { name: 'MySQL',             url: `${T}/mysql/default.svg` },
  { name: 'PostgreSQL',        url: `${T}/postgresql/default.svg` },
  { name: 'SQLite',            url: `${T}/sqlite/default.svg` },
  { name: 'JavaScript',        url: `${T}/javascript/default.svg` },
  { name: 'React',             url: `${T}/react/default.svg` },
  { name: 'Git',               url: `${T}/git/default.svg` },
];

/* Icon tile — img with white filter */
function IconTile({ name, url }: { name: string; url: string }) {
  return (
    <div
      title={name}
      style={{
        width: 72, height: 72, flexShrink: 0, borderRadius: 4,
        background: 'rgba(255,255,255,0.12)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 5,
        transition: 'background .2s', cursor: 'default',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.26)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.12)')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name}
        width={36}
        height={36}
        style={{ width: 36, height: 36, objectFit: 'contain' }}
        loading="lazy"
      />
    </div>
  );
}

/*
 * Infinite marquee — works by:
 *   1. Tripling the item list so there is always content off-screen
 *   2. Animating translateX from 0 → -33.333% (one "copy" width)
 *   3. The animation loops seamlessly because copies 2 and 3 look identical to copies 1 and 2
 */
function MarqueeRow({ items, reverse = false }: { items: typeof ROW1; reverse?: boolean }) {
  // Triple for a seamless loop at any viewport width
  const tripled = [...items, ...items, ...items];
  const pct = -(100 / 3); // move left by exactly one copy

  return (
    <div style={{ overflow: 'hidden', width: '100%', padding: '8px 0' }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          width: 'max-content',
          willChange: 'transform',
          animation: `${reverse ? 'marqueeRev' : 'marquee'} 40s linear infinite`,
        }}
      >
        {tripled.map((item, i) => (
          <IconTile key={i} name={item.name} url={item.url} />
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(${pct.toFixed(4)}%); }
        }
        @keyframes marqueeRev {
          0%   { transform: translateX(${pct.toFixed(4)}%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default function SkillsSection() {
  return (
    <section id="skills" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>

      <div style={{ width: '100%', padding: '0 6.25%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ marginBottom: 56 }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>
            Tech Stack
          </p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Skills & <span className="gradient-text-purple">Technologies</span>
          </h2>
        </motion.div>

        {/* Progress bar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--color-border)', marginBottom: 48 }}>
          {groups.map((g, gi) => (
            <motion.div
              key={g.category}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45, delay: gi * 0.08 }}
              style={{ background: 'var(--color-surface-raised)', padding: '32px 28px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <div style={{ width: 8, height: 8, background: g.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '.02em' }}>{g.category}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {g.skills.map((sk, si) => (
                  <div key={sk.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      <span>{sk.name}</span>
                      <span style={{ color: 'var(--color-gray-500)', fontVariantNumeric: 'tabular-nums' }}>{sk.pct}%</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--color-border)' }}>
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: `${sk.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: gi * 0.08 + si * 0.08, ease: 'easeOut' }}
                        style={{ height: '100%', background: g.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Render-style full-width purple infinite marquee with left label ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          width: '100%',
          background: 'var(--color-purple-700)',
          padding: '56px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left label panel — face logo top, wordmark logo bottom */}
        <div
          style={{
            flexShrink: 0,
            width: 'clamp(200px, 22vw, 320px)',
            padding: '0 0 0 6.25vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            zIndex: 2,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mylogo-face-default.png"
            alt="JEL face logo"
            style={{ width: 'clamp(110px, 13vw, 180px)', height: 'auto', objectFit: 'contain' }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/JEL-logo-v1-light.png"
            alt="JEL wordmark"
            style={{ width: 'clamp(100px, 13vw, 180px)', height: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Scrolling rows — fade-in from left edge, matching Render */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            overflow: 'hidden',
            position: 'relative',
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%)',
          }}
        >
          <MarqueeRow items={ROW1} />
          <MarqueeRow items={ROW2} reverse />
        </div>
      </motion.div>
    </section>
  );
}
