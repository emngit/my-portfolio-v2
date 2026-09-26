'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';

const experiences = [
  {
    role: 'Automation Analyst',
    company: 'IBM',
    location: 'Naga, Bicol Region, Philippines',
    duration: 'Aug 2026 – Present · 2 mos',
    type: 'Full-time',
    color: 'var(--color-purple-400)',
    achievements: [
      'Identifies automation opportunities through workflow analysis and develops manual-to-digital transition strategies',
      'Collaborates with cross-functional teams to align automation deliverables with business and client objectives',
    ],
    tech: ['Workflow Automation', 'Process Automation'],
  },
  {
    role: 'Process Delivery Specialist – Order To Cash',
    company: 'IBM',
    location: 'Naga, Bicol Region, Philippines · On-site',
    duration: 'Jul 2025 – Aug 2026 · 1 yr 2 mos',
    type: 'Full-time',
    color: 'var(--color-purple-500)',
    achievements: [
      'Responsible for executing daily process transactions such as contract management, new item/cost change setup and operational improvements that meet both client and IBM requirements',
    ],
    tech: ['Order To Cash (OTC)', 'Contract Management', 'Process Delivery'],
  },
  {
    role: 'Advisor 1',
    company: 'Concentrix',
    location: 'Naga, Bicol Region, Philippines · On-site',
    duration: 'Nov 2024 – Aug 2025 · 10 mos',
    type: 'Full-time',
    color: 'var(--color-green-400)',
    achievements: [
      'Responsible for managing insurance policies, claims, benefits, and customer service through the Salesforce platform',
    ],
    tech: ['Salesforce', 'Multitasking', 'Time Management'],
  },
  {
    role: 'Associate Software Engineer',
    company: 'Accenture',
    location: 'Philippines',
    duration: 'Jun 2022 – Jul 2024 · 2 yrs 2 mos',
    type: 'Full-time',
    color: '#33acff',
    achievements: [
      'In charge of maintaining and enhancing client Salesforce applications through Salesforce Configuration & Setup, Object Manager, and Lightning App Builder',
      'Executed manual test cases to validate software functionality and ensure quality across releases',
      'Collaborated with cross-functional teams on defect tracking, reporting, and resolution workflows',
    ],
    tech: ['Salesforce', 'Manual Test Execution', 'Manual Testing', 'Lightning App Builder', 'Object Manager'],
  },
  {
    role: 'Digital Marketing Administrator',
    company: 'Hyundai Alabang',
    location: 'Philippines',
    duration: 'Dec 2021 – Apr 2022 · 5 mos',
    type: 'Full-time',
    color: '#f97316',
    achievements: [
      'Handled digital marketing and advertising using Adobe Illustrator, Photoshop, and Premiere',
      'In charge of sales marketing and promoting various products, services, units, and limited-time offers',
      'Coordinated with the sales team to align digital content with monthly targets and brand promotion goals',
    ],
    tech: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere', 'Multitasking'],
  },
  {
    role: 'Junior Web Developer',
    company: '3GX Computers & IT Solutions',
    location: 'Naga, Bicol Region, Philippines',
    duration: 'Jan 2020 – Mar 2020 · 3 mos',
    type: 'Internship',
    color: '#ecd60e',
    achievements: [
      'Maintained, documented, and resolved issues within the BullGuardPH application, the Philippines\' official antivirus distributor',
      'Utilized Laravel Framework with AJAX, plugins, and Git for web application maintenance and bug tracking',
    ],
    tech: ['Web Development', 'Laravel', 'AJAX', 'Git', 'PHP'],
  },
];

export default function ExperienceSection() {
  return (
    <section id="experience" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>Career</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Work <span className="gradient-text-purple">Experience</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative', maxWidth: 900 }}>
          {/* Vertical line */}
          <div className="tl-line" style={{ position: 'absolute', left: 19, top: 0, width: 1, height: '100%' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {experiences.map((exp, i) => (
              <motion.div key={exp.company} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} style={{ position: 'relative', paddingLeft: 56 }}>

                {/* Dot */}
                <div style={{ position: 'absolute', left: 12, top: 20, width: 14, height: 14, borderRadius: '50%', background: exp.color, border: '2px solid var(--color-background)', boxShadow: `0 0 0 3px ${exp.color}40` }} />

                {/* Card */}
                <div className="card-hover" style={{ background: 'var(--color-surface-raised)', padding: '24px 28px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <h3 className="text-body-sm-new" style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 4 }}>{exp.role}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: exp.color }}>{exp.company}</span>
                        <span style={{ fontSize: 11, padding: '2px 7px', background: `${exp.color}15`, color: exp.color, border: `1px solid ${exp.color}30` }}>{exp.type}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 4, justifyContent: 'flex-end' }}>
                        <Calendar size={11} /> {exp.duration}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-gray-600)', justifyContent: 'flex-end' }}>
                        <MapPin size={11} /> {exp.location}
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <ul style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {exp.achievements.map(a => (
                      <li key={a} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--color-text-faint)' }}>
                        <span style={{ marginTop: 6, width: 5, height: 5, borderRadius: '50%', background: exp.color, flexShrink: 0, display: 'inline-block' }} />
                        {a}
                      </li>
                    ))}
                  </ul>

                  {/* Tech tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {exp.tech.map(t => (
                      <span key={t} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
