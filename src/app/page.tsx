'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import SkillsSection from '@/components/SkillsSection';
import ProjectsSection from '@/components/ProjectsSection';
import ExperienceSection from '@/components/ExperienceSection';
import ServicesSection from '@/components/ServicesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

// Client-only canvas/cursor components
const CursorGlow = dynamic(() => import('@/components/CursorGlow'), { ssr: false });
const ParticlesBackground = dynamic(() => import('@/components/ParticlesBackground'), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Global effects */}
      <CursorGlow />
      <ParticlesBackground />

      {/* Layout */}
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
