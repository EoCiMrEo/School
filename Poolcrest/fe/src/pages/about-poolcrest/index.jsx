import React from 'react';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import CompanyStory from './components/CompanyStory';
import TeamSection from './components/TeamSection';
import LicensingSection from './components/LicensingSection';
import CommunitySection from './components/CommunitySection';
import EnvironmentalSection from './components/EnvironmentalSection';
import ContactSection from './components/ContactSection';

const AboutPoolcrest = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CompanyStory />
        <TeamSection />
        <LicensingSection />
        <CommunitySection />
        <EnvironmentalSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default AboutPoolcrest;