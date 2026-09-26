'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  { name: 'Sarah Chen', role: 'CTO, TechVision Labs', avatar: 'SC', rating: 5, text: "John delivered our AI analytics platform ahead of schedule and exceeded every technical expectation. His ability to translate complex requirements into elegant, scalable solutions is remarkable." },
  { name: 'Marcus Rivera', role: 'VP Engineering, CloudCore Systems', avatar: 'MR', rating: 5, text: "Working with John on our workforce dashboard was a game-changer. He brought technical depth, great communication, and a product mindset that's rare to find in a single engineer." },
  { name: 'Priya Sharma', role: 'Product Director, Nexus Digital', avatar: 'PS', rating: 5, text: "John's architecture decisions have aged exceptionally well. The system he designed three years ago still handles 10× the original load. That kind of foresight is invaluable." },
  { name: 'David Kim', role: 'Founder, StartupHub Inc.', avatar: 'DK', rating: 5, text: "John rebuilt our entire tech stack in 3 months. Not only did he deliver on time, but the codebase quality was so high that our new engineering team onboarded in days." },
  { name: 'Emma Watson', role: 'Engineering Manager, DataFlow', avatar: 'EW', rating: 5, text: "John is the kind of engineer you want on every critical project. His cloud infrastructure work reduced our AWS costs by 35% while improving system reliability to 99.99%." },
];

export default function TestimonialsSection() {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const tid = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (auto) {
      tid.current = setInterval(() => setCur(c => (c + 1) % testimonials.length), 5000);
    }
    return () => clearInterval(tid.current);
  }, [auto]);

  const prev = () => { setAuto(false); setCur(c => (c - 1 + testimonials.length) % testimonials.length); };
  const next = () => { setAuto(false); setCur(c => (c + 1) % testimonials.length); };

  return (
    <section id="testimonials" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>Social Proof</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Client <span className="gradient-text-purple">Testimonials</span>
          </h2>
        </motion.div>

        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Card */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '52px 56px', position: 'relative', minHeight: 260 }}>
            {/* Purple left accent bar */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--color-purple-600)' }} />

            <motion.div
              key={cur}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Quote text */}
              <p className="text-body-xl-new" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 32, fontStyle: 'italic' }}>
                &ldquo;{testimonials[cur].text}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, background: 'var(--color-purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {testimonials[cur].avatar}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{testimonials[cur].name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{testimonials[cur].role}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                  {Array.from({ length: testimonials[cur].rating }).map((_, i) => (
                    <span key={i} style={{ color: '#ecd60e', fontSize: 14 }}>★</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
            <button onClick={prev} style={{ width: 36, height: 36, background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAuto(false); setCur(i); }}
                  style={{ height: 3, borderRadius: 0, background: i === cur ? 'var(--color-purple-500)' : 'var(--color-border)', width: i === cur ? 28 : 12, border: 'none', cursor: 'pointer', transition: 'width .3s, background .3s' }}
                />
              ))}
            </div>
            <button onClick={next} style={{ width: 36, height: 36, background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Company logos */}
        <div style={{ marginTop: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40, opacity: 0.3 }}>
          {['TechVision Labs', 'CloudCore Systems', 'Nexus Digital', 'StartupHub', 'DataFlow'].map(n => (
            <span key={n} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-gray-300)' }}>{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
