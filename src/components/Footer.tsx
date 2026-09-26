'use client';

import { Mail, ArrowUp } from 'lucide-react';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const pages = [
  { label: 'About',      href: '#about' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Contact',    href: '#contact' },
];

export default function Footer() {
  const go = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="section-border-t" style={{ background: 'var(--color-background)', padding: '60px 0 32px' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: 'var(--color-purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>JD</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>JohnDev<span style={{ color: 'var(--color-purple-400)' }}>.</span></span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-faint)', lineHeight: 1.7, maxWidth: 320 }}>
              Full Stack Engineer building enterprise-grade products that scale. Open to exciting opportunities worldwide.
            </p>
            {/* Availability chip */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, fontSize: 12, color: 'var(--color-green-400)', background: 'rgba(0,219,124,0.07)', border: '1px solid rgba(0,219,124,0.18)', padding: '4px 12px' }}>
              <span className="animate-pulse-green" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-green-400)', display: 'inline-block' }} />
              Open to work
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-gray-500)', marginBottom: 16 }}>Navigation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pages.map(p => (
                <button key={p.label} onClick={() => go(p.href)} style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-faint)' }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-gray-500)', marginBottom: 16 }}>Connect</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { icon: <GithubIcon />, label: 'GitHub',   href: '#' },
                { icon: <LinkedInIcon />, label: 'LinkedIn', href: '#' },
                { icon: <Mail size={15} />, label: 'Email',  href: 'mailto:john@example.com' },
              ].map(s => (
                <a key={s.label} href={s.href} title={s.label} style={{ width: 34, height: 34, background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)', textDecoration: 'none' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 24, borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>
            © {new Date().getFullYear()} JohnDev. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-gray-700)' }}>
            Built with Next.js 15 · TypeScript · Tailwind · Framer Motion
          </p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ width: 32, height: 32, background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Back to top">
            <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}
