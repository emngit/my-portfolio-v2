'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: '50+', label: 'Projects Completed' },
  { value: '30+', label: 'Clients Supported' },
  { value: '5+',  label: 'Years Experience' },
  { value: '25+', label: 'Technologies' },
];

const highlights = [
  'Modern full-stack frameworks',
  'Cloud-native & DevOps practices',
  'AI/ML integration specialist',
  'Scalable microservices architecture',
  'Performance optimization & SEO',
  'Agile cross-functional leadership',
];

/* ── Windows CMD terminal ── */

// ASCII-art banner for "JEMman" (figlet "big" font approximation)
const WHOAMI_ASCII = [
"       __  ______",                              
"      / / / ____/___ ___  ____ ___  ____ _____", 
" __  / / / __/ / __ `__ \\/ __ `__ \\/ __ `/ __ \\",
"/ /_/ / / /___/ / / / / / / / / / / /_/ / / / /",
"\\____(_)_____/_/ /_/ /_/_/ /_/ /_/\\__,_/_/ /_/", 
                                               
"    __",                                      
"   / /   ____ _____  __  ___________ _____ _",
"  / /   / __ `/ __ \\/ / / / ___/ __ `/ __ `/",
" / /___/ /_/ / / / / /_/ (__  ) /_/ / /_/ /", 
"/_____/\\__,_/_/ /_/\\__,_/____/\\__, /\\__,_/",  
"                             /____/",         
];

type TermLine =
  | { kind: 'prompt'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'ascii' };

const LINES: TermLine[] = [
  { kind: 'prompt', text: 'whoami' },
  { kind: 'ascii' },
  { kind: 'prompt', text: 'cat role.txt' },
  { kind: 'output', text: 'Automation Analyst @ IBM' },
  { kind: 'prompt', text: 'cat stack.txt' },
  { kind: 'output', text: 'React · Node · Salesforce · Laravel' },
  { kind: 'prompt', text: 'echo "Open to opportunities"' },
  { kind: 'output', text: '"Open to opportunities"' },
  { kind: 'prompt', text: '' },   // blinking cursor line
];

function TerminalWindow() {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let i = 0;
          const tick = () => {
            i += 1;
            setVisibleCount(i);
            if (i < LINES.length) setTimeout(tick, i % 2 === 0 ? 420 : 260);
          };
          setTimeout(tick, 400);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ fontFamily: "'Consolas','Courier New',monospace", borderRadius: 6, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.55)', border: '1px solid #3a3a3a' }}>

      {/* Title bar */}
      <div style={{ background: '#1a1a1a', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #333' }}>
        {/* Traffic-light dots */}
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        {/* Tab */}
        <div style={{ marginLeft: 8, background: '#2a2a2a', border: '1px solid #444', borderRadius: 3, padding: '2px 12px', fontSize: 11, color: '#ccc', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10 }}>⬛</span> C:\WINDOWS\system32\cmd.exe
          <span style={{ marginLeft: 6, color: '#777', cursor: 'pointer' }}>✕</span>
        </div>
        {/* Window controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
          <span>＋</span><span>□</span>
        </div>
      </div>

      {/* Terminal body */}
      <div style={{ background: '#0c0c0c', padding: '16px 20px', minHeight: 340, color: '#39ff14', fontSize: 13, lineHeight: 1.7 }}>

        {/* Boot lines */}
        {visibleCount >= 1 && (
          <div style={{ color: '#c0c0c0', marginBottom: 8 }}>
            <div>Microsoft Windows [Version 10.0.26200.9448]</div>
            <div>(c) Microsoft Corporation. All rights reserved.</div>
          </div>
        )}

        {/* Dynamic lines */}
        {LINES.slice(0, visibleCount).map((line, i) => {
          if (line.kind === 'ascii') {
            return (
              <pre key={i} style={{ margin: '4px 0 8px', padding: 0, color: '#39ff14', fontSize: 9, lineHeight: 1.25, fontFamily: 'inherit', whiteSpace: 'pre' }}>
                {WHOAMI_ASCII.join('\n')}
              </pre>
            );
          }
          const isPrompt = line.kind === 'prompt';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
              {isPrompt && (
                <span style={{ color: '#c0c0c0' }}>
                  C:\Users\JohnEmmanLanusga&gt;
                </span>
              )}
              <span style={{ color: '#39ff14', fontWeight: isPrompt ? 400 : 300 }}>
                {line.text}
              </span>
              {/* Blinking cursor on last visible prompt line with no text yet */}
              {i === visibleCount - 1 && isPrompt && (
                <span style={{ display: 'inline-block', width: 8, height: 14, background: '#39ff14', marginLeft: 1, animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>About Me</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Detail-oriented. Systematic. <span className="gradient-text-purple">Creative.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'start' }}>

          {/* Left — CMD terminal window */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <TerminalWindow />
          </motion.div>

          {/* Right — content */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-body-xl-new" style={{ color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              I&apos;m <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>John Emman Lanusga</strong>, a graduate of Ateneo de Naga University with a Bachelor of Science in Information Technology. I am a Philippine-based <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Developer</strong> with a passion for building reliable software. In my role, I bridge the gap between technical execution and business value, helping ensure that every release is delivered with confidence and quality.
            </p>
            <p className="text-body-lg-new" style={{ color: 'var(--color-text-faint)', marginBottom: 32, lineHeight: 1.7 }}>
              Outside of IDE, I recharge through physical activities and travel, which help me refresh my mind and gain new perspectives. 
              I also enjoy graphic design, drawing, and brainstorming ideas for potential projects. These creative pursuits allow me to continuously learn, explore, and bring fresh ideas into both my professional and personal life.
            </p>

            {/* Highlight list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 40 }}>
              {highlights.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-faint)' }}>
                  <Check size={13} color="var(--color-purple-400)" strokeWidth={2.5} />
                  {h}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--color-border)' }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: 'var(--color-surface)', padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-faint)', lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
