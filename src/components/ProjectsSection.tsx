'use client';

import { motion } from 'framer-motion';
import { ExternalLink, GitFork, Zap } from 'lucide-react';

const T = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons';

/* Map every tech tag to an icon URL (empty string = no icon) */
const TECH_ICONS: Record<string, string> = {
  'Vue.js 3':       `${T}/vue/default.svg`,
  'FastAPI':        `${T}/fastapi/default.svg`,
  'PostgreSQL':     `${T}/postgresql/default.svg`,
  'Jira':           `${T}/jira/default.svg`,
  'GitHub Copilot': `${T}/github/default.svg`,
  'HTML5':          `${T}/html5/default.svg`,
  'CSS3':           `${T}/css/default.svg`,
  'C#':             `${T}/csharp/default.svg`,
  'Unity':          `${T}/unity/default.svg`,
  'CodeIgniter':    `${T}/codeigniter/default.svg`,
  'PHP':            `${T}/php/default.svg`,
  'AJAX':           `${T}/javascript/default.svg`,
  'MySQL':          `${T}/mysql/default.svg`,
  'Node.js':        `${T}/nodejs/default.svg`,
};

const projects = [
  {
    name: 'Kairos – Jira Copilot Assistant',
    description: 'AI-powered Jira workflow platform helping IBM OTC teams manage ticket prioritization, compliance workflows, workforce analytics, and RCA / CAPA processes.',
    tech: ['Vue.js 3', 'FastAPI', 'PostgreSQL', 'Jira', 'GitHub Copilot'],
    status: 'ICA',
    statusColor: 'var(--color-purple-400)',
    metric: 'AI-powered',
  },
  {
    name: 'Kada Tipon Game',
    description: 'A 2D runner where students collect coins while dodging expense obstacles — financial literacy through play.',
    tech: ['HTML5', 'CSS3', 'C#', 'Unity'],
    status: 'Academic',
    statusColor: 'var(--color-green-400)',
    metric: 'EdTech Game',
  },
  {
    name: 'SewIt – Tailor Shop Management System',
    description: 'A web-based tailoring shop management system designed to streamline operations and enhance customer experience for tailoring businesses in Naga City.',
    tech: ['CodeIgniter', 'PHP', 'AJAX', 'MySQL', 'Node.js'],
    status: 'Capstone',
    statusColor: '#ecd60e',
    metric: 'Full-stack',
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>Portfolio</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Featured <span className="gradient-text-purple">Projects</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--color-border)' }}>
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="card-hover"
              style={{ background: 'var(--color-surface-raised)', display: 'flex', flexDirection: 'column', cursor: 'default' }}
            >
              {/* Card header */}
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}>
                {/* Background grid */}
                <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>Project</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: p.statusColor }}>
                    <span>●</span> {p.status}
                  </div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={14} color="var(--color-purple-400)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-purple-300)' }}>{p.metric}</span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 className="text-body-sm-new" style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 10 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-faint)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{p.description}</p>

                {/* Tech tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {p.tech.map(t => {
                    const iconUrl = TECH_ICONS[t];
                    return (
                      <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', background: 'rgba(138,5,255,0.08)', border: '1px solid rgba(138,5,255,0.2)', color: 'var(--color-purple-300)' }}>
                        {iconUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={iconUrl} alt={t} width={12} height={12} style={{ objectFit: 'contain', flexShrink: 0 }} />
                        )}
                        {t}
                      </span>
                    );
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-gray-400)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ExternalLink size={12} /> Live Demo
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-gray-400)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                    <GitFork size={12} /> GitHub
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
