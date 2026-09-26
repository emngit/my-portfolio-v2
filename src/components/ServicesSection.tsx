'use client';

import { motion } from 'framer-motion';
import { Globe, Cloud, Brain, BarChart3, Cog, Server } from 'lucide-react';

const services = [
  { icon: <Globe size={20} />, title: 'Web Development', description: 'Full-stack web applications built with modern frameworks. From rapid prototypes to enterprise platforms, crafted for performance and scale.', color: 'var(--color-purple-400)', tags: ['Next.js', 'React', 'TypeScript'] },
  { icon: <Cloud size={20} />, title: 'Cloud Solutions', description: 'Cloud-native architecture design, migration, and optimisation across AWS, Azure, and GCP. Kubernetes orchestration and cost optimisation.', color: '#33acff', tags: ['AWS', 'Azure', 'Kubernetes'] },
  { icon: <Brain size={20} />, title: 'AI Integration', description: 'Embed AI capabilities into your products — NLP pipelines, recommendation engines, predictive models, and LLM-powered workflows.', color: 'var(--color-purple-500)', tags: ['OpenAI', 'Python', 'ML'] },
  { icon: <BarChart3 size={20} />, title: 'Business Dashboards', description: 'Data visualisation platforms and analytics dashboards that turn raw data into actionable insights for decision-makers.', color: 'var(--color-green-400)', tags: ['Grafana', 'D3.js', 'SQL'] },
  { icon: <Cog size={20} />, title: 'Automation Engineering', description: 'Workflow automation, CI/CD pipelines, infrastructure-as-code, and intelligent process automation that saves hours every week.', color: '#ecd60e', tags: ['Terraform', 'Docker', 'GitHub Actions'] },
  { icon: <Server size={20} />, title: 'System Architecture', description: 'Scalable microservices design, API architecture, database modelling, and technical roadmap planning for growth-stage products.', color: '#e23642', tags: ['Microservices', 'APIs', 'PostgreSQL'] },
];

export default function ServicesSection() {
  return (
    <section id="services" className="bg-grid section-border-b" style={{ background: 'var(--color-background)', padding: '96px 0' }}>
      <div style={{ width: '100%', padding: '0 6.25%' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-purple-400)', marginBottom: 12 }}>What I Offer</p>
          <h2 className="text-heading-xl-new" style={{ color: 'var(--color-text-primary)' }}>
            Services & <span className="gradient-text-purple">Expertise</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--color-border)' }}>
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="card-hover"
              style={{ background: 'var(--color-surface-raised)', padding: '32px 28px', cursor: 'default' }}
            >
              {/* Icon */}
              <div style={{ width: 44, height: 44, background: `${svc.color}14`, border: `1px solid ${svc.color}30`, color: svc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {svc.icon}
              </div>
              <h3 className="text-body-sm-new" style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 10 }}>{svc.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-faint)', lineHeight: 1.7, marginBottom: 20 }}>{svc.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {svc.tags.map(t => (
                  <span key={t} style={{ fontSize: 11, padding: '3px 8px', background: `${svc.color}10`, border: `1px solid ${svc.color}25`, color: svc.color }}>{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
