'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const CREDLY_PROFILE = 'https://www.credly.com/users/john-emman-lanusga.db00f833';
const LINKEDIN_CERTS = 'https://www.linkedin.com/in/jelanusga/details/certifications/';

interface Category { id: string; label: string }
interface Badge { id: string; title: string; issuer: string; date: string; category: string; url?: string }

const CATEGORIES: Category[] = [
  { id: 'genai',      label: 'Generative & Agentic AI' },
  { id: 'automation', label: 'Automation & Process' },
  { id: 'data-ml',    label: 'Data & Machine Learning' },
  { id: 'finance',    label: 'Finance & O2C' },
  { id: 'programming', label: 'Programming' },
  { id: 'cloud-sec',  label: 'Cloud & Security' },
  { id: 'skills',     label: 'Professional Skills' },
];

/* Source: public Credly profile plus LinkedIn Learning / Cognitive Class certificates — newest first.
   `id` is the Credly badge id (used for the credential link) unless `url` is given. */
const LI = 'https://www.linkedin.com/learning/certificates/';
const BADGES: Badge[] = [
  { id: '50e15890-ca3d-4f48-8805-14d459843a34', title: '2026 IBMer watsonx Challenge', issuer: 'IBM', date: '2026-07-28', category: 'genai' },
  { id: 'eba95ae7-2f4f-4b8d-a875-9b2c6bf8ecdc', title: 'Process Delivery - Foundational', issuer: 'IBM', date: '2026-07-27', category: 'automation' },
  { id: 'c8e0357d-dcd5-4f52-a64d-4344c9425e56', title: 'IBM Bob Intermediate', issuer: 'IBM', date: '2026-07-27', category: 'genai' },
  { id: '6576a14b-f35f-4487-ad3f-9838f1d83196', title: 'IBM Generative & Agentic AI Foundation', issuer: 'IBM', date: '2026-07-26', category: 'genai' },
  { id: '8aaf9636-724e-4afa-bdc6-c6688f0c1003', title: 'Data Analytics for Machine Learning', issuer: 'IBM SkillsBuild', date: '2026-07-24', category: 'data-ml' },
  { id: '8b2a5b8f-beda-4171-8f72-504c7f1352e3', title: 'Career Management Essentials', issuer: 'IBM SkillsBuild', date: '2026-07-24', category: 'skills' },
  { id: '72c7a795-1cf7-43b5-b34a-bf62309ec99f', title: 'AI Literacy', issuer: 'IBM SkillsBuild', date: '2026-07-24', category: 'genai' },
  { id: '8f7186d0-ccdb-43f4-80b7-b3aad3ec7da5', title: 'Getting Started with Threat Intelligence and Hunting', issuer: 'IBM SkillsBuild', date: '2026-07-23', category: 'cloud-sec' },
  { id: '0e80f814-ff4e-405d-b77d-131e6b818aea', title: 'IBM Automation Practitioner', issuer: 'IBM', date: '2026-07-23', category: 'automation' },
  { id: '47b73087-dc27-48ff-b6ab-af355a5f1315', title: 'Machine Learning Methods and Tools', issuer: 'IBM SkillsBuild', date: '2026-07-23', category: 'data-ml' },
  { id: '3020725d-ff83-42a4-9f05-9221b311b83c', title: 'Finance & Accounting: Order to Cash Delivery and Improvement', issuer: 'IBM', date: '2026-07-23', category: 'finance' },
  { id: 'b283e2ac-7a47-49fc-8385-eeb481449dd3', title: 'AI Automation Explorer', issuer: 'Make', date: '2026-07-23', category: 'automation' },
  { id: '9152c0a6-4ff9-4e1e-9d65-6c8899290b6c', title: 'AI+ Content Creator with watsonx Workshop Foundational', issuer: 'IBM', date: '2026-07-23', category: 'genai' },
  { id: 'b85eb3dc-630c-4b5a-a924-6bb529b5312e', title: 'Explorations into Mindfulness', issuer: 'IBM SkillsBuild', date: '2026-07-23', category: 'skills' },
  { id: '2f1b4fc6-95c1-476d-8b31-3e7e587e0d6a', title: 'IBM Growth Behaviors', issuer: 'IBM', date: '2026-02-01', category: 'skills' },
  { id: 'ebfd62c2-b01d-4583-b52a-ef604b511706', title: 'Machine Learning with R - Level 1', issuer: 'IBM', date: '2025-12-02', category: 'data-ml' },
  { id: 'b13840fe-549d-47aa-8b8e-ae277c46bac8', title: 'R for Data Science', issuer: 'IBM', date: '2025-11-28', category: 'data-ml' },
  { id: '974f8dd8-a5f6-4c9e-905b-6d51bf8305f3', title: 'Enterprise Design Thinking Practitioner', issuer: 'IBM SkillsBuild', date: '2025-11-28', category: 'skills' },
  { id: '517256f4-a1cd-4fc5-b4cf-17c6ec63bca6', title: 'IBM Cloud Advocate Essentials', issuer: 'IBM', date: '2025-09-04', category: 'cloud-sec' },
  { id: 'li-career-essentials-da', title: 'Career Essentials in Data Analysis by Microsoft and LinkedIn', issuer: 'Microsoft & LinkedIn Learning', date: '2025-09-04', category: 'data-ml', url: `${LI}0d2dd43cf65396ee4a37cc2b46c6174eb2a548a0a7a8d4eb7e4eb7fee90feeb6` },
  { id: 'li-data-analytics-part-2', title: 'Learning Data Analytics Part 2: Extending and Applying Core Knowledge', issuer: 'LinkedIn Learning', date: '2025-09-04', category: 'data-ml', url: `${LI}33c59422fca173364001542487ad54b0f9b8ef31932b08c18efc60eac94237f4` },
  { id: 'li-programming-beyond', title: 'Programming Foundations: Beyond the Fundamentals', issuer: 'LinkedIn Learning', date: '2025-09-04', category: 'programming', url: `${LI}d9da6c410326ce771e72a693f975bcbe6c5a506280d62fe1400b8b539140b2ab` },
  { id: 'li-programming-fundamentals', title: 'Programming Foundations: Fundamentals', issuer: 'LinkedIn Learning', date: '2025-09-04', category: 'programming', url: `${LI}ce3ea8a3665e8199cd86f002a8654f2bfa02961a98b2843a3798dbcea6f47723` },
  { id: 'cc-python-101', title: 'Python 101 for Data Science', issuer: 'IBM Cognitive Class', date: '2025-09-04', category: 'data-ml', url: 'https://courses.cognitiveclass.ai/certificates/fbf60cb2f4cb410bac8bf1552b948435' },
  { id: '125c4696-7f94-4bc8-8318-4b38c511d31b', title: 'Finance & Accounting Essentials', issuer: 'IBM', date: '2025-07-24', category: 'finance' },
  { id: '9ed1ade5-7be2-4e9b-b2d9-7ec04cf9030a', title: 'IBM Agile Explorer', issuer: 'IBM', date: '2025-07-18', category: 'skills' },
  { id: 'li-career-skills-da', title: 'Introduction to Career Skills in Data Analytics (2022)', issuer: 'LinkedIn Learning', date: '2024-11-10', category: 'data-ml', url: `${LI}340f86e09e11f4627309b487facce0061934c5b7cc9cb0188067a81605cd8277` },
  { id: 'li-prompt-engineering', title: 'Introduction to Prompt Engineering for Generative AI (2023)', issuer: 'LinkedIn Learning', date: '2024-11-07', category: 'genai', url: `${LI}627f6425b635d9d173fb7ccdb7e19645c952a4580d9a565f2564b95c441e1dc1` },
  { id: 'li-what-is-genai', title: 'What Is Generative AI?', issuer: 'LinkedIn Learning', date: '2024-10-17', category: 'genai', url: `${LI}adae0dbf96a5e51e4e78f42cf002268584b8bb751d34b9178ebdadd4a476ac17` },
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const mono = "'Consolas','Courier New',monospace";
const ACTIVE_BG = '#0b0e0c';
const ACTIVE_FG = '#3dea72';

export default function LearningSection() {
  const [activeId, setActiveId] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const tabs = [{ id: 'all', label: 'All badges' }, ...CATEGORIES];
  const countOf = (id: string) => (id === 'all' ? BADGES.length : BADGES.filter((b) => b.category === id).length);
  const activeLabel = tabs.find((t) => t.id === activeId)?.label ?? 'All badges';
  const rows = activeId === 'all' ? BADGES : BADGES.filter((b) => b.category === activeId);
  const visibleRows = expanded ? rows : rows.slice(0, 5);

  return (
    <section id="learning" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>Credentials</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Learning & <span className="gradient-text-purple">Certifications</span>
          </h2>
        </motion.div>

        <motion.div
          className="rg-learn-grid"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 40, alignItems: 'start' }}
        >
          {/* Categories */}
          <div className="rg-learn-tabs" role="tablist" aria-label="Learning categories" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tabs.map((t) => {
              const isActive = t.id === activeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveId(t.id);
                    setExpanded(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 14,
                    borderRadius: 4,
                    border: '1px solid var(--color-text-primary)',
                    background: isActive ? ACTIVE_BG : 'transparent',
                    color: isActive ? ACTIVE_FG : 'var(--color-text-primary)',
                    transition: 'background .15s, color .15s',
                  }}
                >
                  <span>{t.label}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, opacity: 0.7 }}>{countOf(t.id)}</span>
                </button>
              );
            })}
          </div>

          {/* Entries */}
          <div role="tabpanel" style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', paddingBottom: 28, borderBottom: '1px solid var(--color-text-primary)' }}>
              {activeLabel}
            </h3>

            <ul key={activeId} style={{ listStyle: 'none' }}>
              {visibleRows.map((b) => (
                <li
                  key={b.id}
                  className="rg-learn-row"
                  style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24, padding: '18px 0', borderBottom: '1px solid var(--color-border)' }}
                >
                  <span style={{ minWidth: 0 }}>
                    <a
                      href={b.url ?? `https://www.credly.com/badges/${b.id}/public_url`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={b.url ? 'View certificate' : 'View credential on Credly'}
                      style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'var(--color-text-primary)', textDecoration: 'none' }}
                    >
                      {b.title}
                    </a>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--color-text-faint)', marginTop: 4 }}>{b.issuer}</span>
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: '.04em', color: 'var(--color-gray-500)', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(b.date)}</span>
                </li>
              ))}
            </ul>

            {rows.length > 5 && (
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

            <p style={{ fontFamily: mono, fontSize: 12, color: 'var(--color-gray-500)', marginTop: 24 }}>
              <a href={CREDLY_PROFILE} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-purple-400)', textDecoration: 'none' }}>All badges on Credly ↗</a>
              {'  ·  '}
              <a href={LINKEDIN_CERTS} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-purple-400)', textDecoration: 'none' }}>LinkedIn certifications ↗</a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
