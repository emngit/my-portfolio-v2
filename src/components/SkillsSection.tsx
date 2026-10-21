'use client';

import { motion } from 'framer-motion';

const groups = [
  { category: 'Frontend',   color: 'var(--color-purple-400)', skills: [{ name: 'React', pct: 90 }, { name: 'Vue.js', pct: 78 }, { name: 'HTML / CSS', pct: 95 }, { name: 'JavaScript', pct: 88 }] },
  { category: 'Backend',    color: 'var(--color-green-400)',  skills: [{ name: 'Node.js', pct: 82 }, { name: 'Python', pct: 80 }, { name: 'Java', pct: 75 }, { name: 'PHP', pct: 72 }] },
  { category: 'Languages',  color: '#33acff',                 skills: [{ name: 'C++', pct: 70 }, { name: 'C#', pct: 68 }, { name: 'JavaScript', pct: 88 }, { name: 'Python', pct: 80 }] },
  { category: 'Databases',  color: '#ecd60e',                 skills: [{ name: 'MySQL / SQL', pct: 85 }, { name: 'PostgreSQL', pct: 82 }, { name: 'SQLite', pct: 75 }, { name: 'ER Modeling', pct: 78 }] },
];

/* ── Local icons — served from /public/icons/, no CDN dependency ── */
const ROW1: { name: string; url: string }[] = [
  { name: 'JavaScript',        url: '/icons/javascript.svg' },
  { name: 'Python',            url: '/icons/python.svg' },
  { name: 'Java',              url: '/icons/java.svg' },
  { name: 'HTML',              url: '/icons/html5.svg' },
  { name: 'CSS',               url: '/icons/css3.svg' },
  { name: 'PHP',               url: '/icons/php.svg' },
  { name: 'Node.js',           url: '/icons/nodejs.svg' },
  { name: 'C++',               url: '/icons/cplusplus.svg' },
  { name: 'C#',                url: '/icons/csharp.svg' },
  { name: 'React',             url: '/icons/react.svg' },
  { name: 'Vue.js',            url: '/icons/vuejs.svg' },
  { name: 'Unity',             url: '/icons/unity.svg' },
  { name: 'Salesforce',        url: '/icons/salesforce.svg' },
];

const ROW2: { name: string; url: string }[] = [
  { name: 'Jira',              url: '/icons/jira.svg' },
  { name: 'Git',               url: '/icons/git.svg' },
  { name: 'Laravel',           url: '/icons/laravel.svg' },
  { name: 'Figma',             url: '/icons/figma.svg' },
  { name: 'Adobe Illustrator', url: '/icons/illustrator.svg' },
  { name: 'Adobe Photoshop',   url: '/icons/photoshop.svg' },
  { name: 'Adobe Premiere',    url: '/icons/premierepro.svg' },
  { name: 'MySQL',             url: '/icons/mysql.svg' },
  { name: 'PostgreSQL',        url: '/icons/postgresql.svg' },
  { name: 'SQLite',            url: '/icons/sqlite.svg' },
  { name: 'JavaScript',        url: '/icons/javascript.svg' },
  { name: 'React',             url: '/icons/react.svg' },
  { name: 'Git',               url: '/icons/git.svg' },
  { name: 'Salesforce',        url: '/icons/salesforce.svg' },
];

/* Icon tile — img with white filter */
function IconTile({ name, url }: { name: string; url: string }) {
  return (
    <div
      title={name}
      style={{
        width: 72, height: 72, flexShrink: 0, borderRadius: 4,
        background: 'rgba(255,255,255,0.13)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        transition: 'background .2s, transform .15s', cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.28)';
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.13)';
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name}
        width={40}
        height={40}
        style={{
          width: 40, height: 40, objectFit: 'contain',
          filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5)) brightness(1.1) contrast(1.05)',
        }}
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
