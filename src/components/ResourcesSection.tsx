'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight, Keyboard } from 'lucide-react';
import { CheckiOLogo, CodewarsLogo, CodinGameLogo, JavaScript30Logo, LearnGitBranchingLogo, LeetCodeLogo, SqlIslandLogo, type IconType } from './resourceLogos';

import TypingTest from './TypingTest';

interface Resource { name: string; tag: string; desc: string; href: string; Icon: IconType }

const RESOURCES: Resource[] = [
  { name: 'Codewars', tag: 'Multi-language', Icon: CodewarsLogo, href: 'https://www.codewars.com', desc: 'Practice algorithms, data structures, and problem-solving through coding challenges and coding kata.' },
  { name: 'SQL Island', tag: 'SQL', Icon: SqlIslandLogo, href: 'https://sql-island.informatik.uni-kl.de/', desc: 'Learn SQL by solving interactive database puzzles in a fun, story-driven environment.' },
  { name: 'CodinGame', tag: 'Game-based', Icon: CodinGameLogo, href: 'https://www.codingame.com', desc: 'Improve programming skills through game-based challenges, puzzles, and real coding scenarios.' },
  { name: 'CheckiO', tag: 'Python', Icon: CheckiOLogo, href: 'https://checkio.org', desc: 'Learn Python through interactive missions that focus on problem-solving and practical coding techniques.' },
  { name: 'JavaScript30', tag: 'JavaScript', Icon: JavaScript30Logo, href: 'https://javascript30.com', desc: 'Build 30 projects using vanilla JavaScript without relying on frameworks.' },
  { name: 'Learn Git Branching', tag: 'Git & Version Control', Icon: LearnGitBranchingLogo, href: 'https://learngitbranching.js.org', desc: 'Master Git visually through an interactive branching simulator.' },
  { name: 'LeetCode', tag: 'General Problem Solving', Icon: LeetCodeLogo, href: 'https://leetcode.com', desc: 'Strengthen coding interview skills and algorithmic thinking through structured challenges.' },
];

/* ── Section ── */
const bodyStyle: React.CSSProperties = {
  background: 'var(--color-surface-raised)', display: 'flex', flexDirection: 'column', textAlign: 'left',
  color: 'inherit', textDecoration: 'none', font: 'inherit', cursor: 'pointer', width: '100%', height: '100%', borderRadius: 0,
};

function CardInner({ name, tag, desc, Icon, footer, footerColor }: { name: string; tag: string; desc: string; Icon: IconType; footer: string; footerColor: string }) {
  return (
    <>
      <div className="res-head" style={{ padding: '20px 24px', minHeight: 108, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
        <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, width: '100%' }}>
          <Icon size={44} color="var(--color-purple-400)" />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px', background: 'rgba(138,5,255,0.08)', border: '1px solid rgba(138,5,255,0.2)', color: 'var(--color-purple-300)', textAlign: 'right' }}>
            {tag}
          </span>
        </div>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 className="text-body-sm-new" style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 10 }}>{name}</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-faint)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{desc}</p>
        <div style={{ paddingTop: 12, borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: footerColor }}>
          {footer} <ArrowUpRight size={12} />
        </div>
      </div>
    </>
  );
}

export default function ResourcesSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="resources" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>Curated List</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Recommended Learning <span className="gradient-text-purple">Resources</span>
          </h2>
          <p style={{ maxWidth: 640, marginTop: 16, fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-faint)' }}>
            A hand-picked list of platforms and resources I keep coming back to for learning, practicing, and improving programming skills in a more interactive and enjoyable way.
          </p>
        </motion.div>

        <div className="rg-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, background: 'var(--color-border)' }}>
          {RESOURCES.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.07 }}
              className="card-hover"
              style={{ background: 'var(--color-surface-raised)', display: 'flex' }}
            >
              <a href={r.href} target="_blank" rel="noopener noreferrer" style={bodyStyle}>
                <CardInner name={r.name} tag={r.tag} desc={r.desc} Icon={r.Icon} footer="Visit resource" footerColor="var(--color-gray-400)" />
              </a>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.21 }}
            className="card-hover"
            style={{ background: 'var(--color-surface-raised)', display: 'flex' }}
          >
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-expanded={playing} style={{ ...bodyStyle, border: 'none', padding: 0 }}>
              <CardInner
                name="Typing Speed Test"
                tag="Built-in tool"
                Icon={Keyboard}
                desc="Test and improve your typing speed with programming vocabulary."
                footer={playing ? 'Hide game' : 'Play now'}
                footerColor="var(--color-purple-400)"
              />
            </button>
          </motion.div>
        </div>

        {playing && <TypingTest onClose={() => setPlaying(false)} />}

        <div
          className="panel"
          style={{ marginTop: 40, maxWidth: 720, padding: '18px 24px', borderLeft: '3px solid var(--color-purple-500)', fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-faint)' }}
        >
          These are some of the resources that helped shape my learning journey. I often recommend them to students, aspiring developers, and anyone looking for a more hands-on way to learn programming.
        </div>
      </div>
    </section>
  );
}
