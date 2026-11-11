'use client';

import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import MusicSection from '@/components/MusicSection';
import SkillsSection from '@/components/SkillsSection';
import ProjectsSection from '@/components/ProjectsSection';
import ExperienceSection from '@/components/ExperienceSection';
import LearningSection from '@/components/LearningSection';
import ResourcesSection from '@/components/ResourcesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import AuroraBackground from '@/components/AuroraBackground';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      {/* Layout */}
      <HeroSection />
      <AboutSection />
      <MusicSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <LearningSection />
      <ResourcesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
