'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Image from 'next/image';

const NAV = [
  { label: 'Home',       href: '#home' },
  { label: 'About',      href: '#about' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Contact',    href: '#contact' },
];

function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark / light mode"
      style={{
        position: 'relative',
        width: 52, height: 28,
        borderRadius: 999,
        background: dark ? '#1a1a2e' : '#e0e7ff',
        border: `1px solid ${dark ? 'rgba(170,119,253,0.35)' : '#c7d2fe'}`,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background .3s, border-color .3s',
        display: 'flex', alignItems: 'center',
        padding: '0 4px',
      }}
    >
      {/* sliding knob */}
      <motion.span
        animate={{ x: dark ? 0 : 22 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{
          width: 20, height: 20, borderRadius: '50%',
          background: dark ? 'var(--color-purple-500)' : '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: dark
            ? '0 0 8px rgba(155,82,251,0.7)'
            : '0 0 8px rgba(99,102,241,0.5)',
        }}
      >
        {dark
          ? <Moon size={11} color="#fff" strokeWidth={2} />
          : <Sun  size={11} color="#fff" strokeWidth={2} />}
      </motion.span>
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -66, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          position: 'fixed', inset: '0 0 auto 0', zIndex: 50,
          height: 'var(--nav-height)',
          background: scrolled ? 'var(--nav-scrolled-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          transition: 'background .3s, border-color .3s',
        }}
      >
        <div style={{ width: '100%', padding: '0 6.25%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <button onClick={() => go('#home')} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Image
              src="/jemman-logo-dark.svg"
              alt="J.EMMAN"
              width={140}
              height={40}
              priority
              style={{ height: 40, width: 'auto', display: 'block' }}
            />
          </button>

          {/* Center links */}
          <div className="hidden md:flex" style={{ gap: 0 }}>
            {NAV.map(n => (
              <button
                key={n.label}
                onClick={() => go(n.href)}
                className="group relative"
                style={{
                  padding: '0 20px',
                  height: 'var(--nav-height)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, fontWeight: 500,
                  color: 'var(--color-text-faint)',
                  transition: 'color .2s',
                  letterSpacing: '.005em',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-faint)')}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>{n.label}</span>
                {/* Render-style bottom underline indicator */}
                <span style={{
                  position: 'absolute', bottom: 0, left: 0,
                  width: '100%', height: 2,
                  background: 'var(--color-text-primary)',
                  transform: 'scaleY(0)',
                  transformOrigin: 'bottom',
                  transition: 'transform .3s var(--global-ease)',
                }} className="group-hover:[transform:scaleY(1)]" />
              </button>
            ))}
          </div>

          {/* Right CTA */}
          <div className="hidden md:flex" style={{ gap: 12, alignItems: 'center' }}>
            <ThemeToggle />
            <button className="btn-render-secondary" style={{ height: 42, fontSize: 15, padding: '0 22px' }}>
              <span>Resume</span>
            </button>
            <button className="btn-render-primary" onClick={() => go('#contact')} style={{ height: 42, fontSize: 15, padding: '0 22px' }}>
              <span>Hire Me</span>
            </button>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden"
            onClick={() => setOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', inset: 'var(--nav-height) 0 auto 0', zIndex: 40,
              background: 'var(--nav-scrolled-bg)',
              borderBottom: '1px solid var(--color-border)',
              backdropFilter: 'blur(12px)',
            }}
            className="md:hidden"
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV.map(n => (
                <button
                  key={n.label}
                  onClick={() => go(n.href)}
                  style={{
                    textAlign: 'left', padding: '12px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, color: 'var(--color-text-faint)',
                  }}
                >
                  {n.label}
                </button>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                <button className="btn-render-secondary" style={{ flex: 1, height: 40, fontSize: 13, justifyContent: 'center' }}>
                  <span>Resume</span>
                </button>
                <button className="btn-render-primary" style={{ flex: 1, height: 40, fontSize: 13, justifyContent: 'center' }}>
                  <span>Hire Me</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
