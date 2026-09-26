'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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

          {/* Left — profile visual */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div style={{ position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--color-purple-900) 0%, transparent 50%)' }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: 'var(--color-purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 16px' }}>JD</div>
                <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 16 }}>John Developer</p>
                <p style={{ color: 'var(--color-purple-400)', fontSize: 13, marginTop: 4 }}>Full Stack Engineer</p>
              </div>
              {/* Scan line animation */}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(138,5,255,0.4), transparent)', animation: 'scan-line 3s linear infinite' }} />
            </div>
            <style>{`@keyframes scan-line { 0%{top:-2px;position:absolute} 100%{top:100%;position:absolute} }`}</style>
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
