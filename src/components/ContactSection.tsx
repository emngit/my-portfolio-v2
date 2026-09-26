'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Clock } from 'lucide-react';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>Get In Touch</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Let&rsquo;s Build Something <span className="gradient-text-purple">Amazing</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 48, alignItems: 'start' }}>

          {/* Left info */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Availability */}
            <div style={{ background: 'rgba(0,219,124,0.06)', border: '1px solid rgba(0,219,124,0.18)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="animate-pulse-green" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-green-400)', display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-green-400)' }}>Currently Available</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>Open to freelance contracts, full-time roles, and exciting consulting projects.</p>
            </div>

            {/* Contact info */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: <Mail size={14} />, label: 'Email', value: 'john@example.com' },
                { icon: <MapPin size={14} />, label: 'Location', value: 'New York, NY' },
                { icon: <Clock size={14} />, label: 'Timezone', value: 'EST / UTC-5' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(138,5,255,0.1)', border: '1px solid rgba(138,5,255,0.2)', color: 'var(--color-purple-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '20px 24px' }}>
              <p style={{ fontSize: 11, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14, fontWeight: 600 }}>Connect</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { icon: <GithubIcon />, label: 'GitHub', href: '#' },
                  { icon: <LinkedInIcon />, label: 'LinkedIn', href: '#' },
                  { icon: <Mail size={15} />, label: 'Email', href: 'mailto:john@example.com' },
                ].map(s => (
                  <a key={s.label} href={s.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-faint)', textDecoration: 'none' }}>
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '40px 44px', position: 'relative' }}>
              {/* Purple top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--color-purple-600)' }} />

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, fontWeight: 600 }}>Name</label>
                    <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, fontWeight: 600 }}>Email</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="input-field" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, fontWeight: 600 }}>Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell me about your project..." className="input-field" style={{ resize: 'none' }} />
                </div>
                <motion.button type="submit" whileTap={{ scale: 0.97 }} className="btn-render-primary" style={{ width: '100%', height: 48, justifyContent: 'center', fontSize: 14 }}>
                  <span>{sent ? '✓ Message Sent!' : 'Send Message'}</span>
                  {!sent && <Send size={14} />}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
