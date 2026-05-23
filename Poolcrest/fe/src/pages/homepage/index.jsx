import React from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/ui/Header";
import HeroSection from "./components/HeroSection";
import SeasonalSpotlight from "./components/SeasonalSpotlight";
import TrustBar from "./components/TrustBar";
import ServicesOverview from "./components/ServicesOverview";
import CustomerTestimonials from "./components/CustomerTestimonials";
import PoolCareCalendar from "./components/PoolCareCalendar";
import RecentServiceCompletions from "./components/RecentServiceCompletions";

const Homepage = () => {
  return (
    <>
      <Helmet>
        <title>
          Poolcrest - Professional Pool Service & Maintenance | Your Pool, Our
          Expertise, Your Peace of Mind
        </title>
        <meta
          name="description"
          content="Professional pool service and maintenance for families who value safety and quality. Licensed, insured, and trusted by 2,500+ local homeowners. Emergency service available 24/7."
        />
        <meta
          name="keywords"
          content="pool service, pool maintenance, pool cleaning, pool repair, emergency pool service, pool care, swimming pool maintenance, pool chemicals, pool equipment repair"
        />
        <meta
          property="og:title"
          content="Poolcrest - Pool Service & Maintenance"
        />
        <meta
          property="og:description"
          content="Your pool, our expertise, your peace of mind. Professional pool care that keeps your family's favorite gathering place always ready."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://poolcrestpro.com/homepage" />
        <link rel="canonical" href="https://poolcrestpro.com/homepage" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-16 lg:pt-20">
          {/* Hero Section */}
          <HeroSection />

          {/* Trust Bar */}
          <TrustBar />

          {/* Seasonal Spotlight */}
          <SeasonalSpotlight />

          {/* Services Overview */}
          <ServicesOverview />

          {/* Customer Testimonials */}
          <CustomerTestimonials />

          {/* Pool Care Calendar */}
          <PoolCareCalendar />

          {/* Recent Service Completions */}
          <RecentServiceCompletions />
        </main>

        {/* Footer */}
        <footer className="bg-primary-900 text-primary-foreground py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 pool-gradient rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-inter font-bold">
                      Poolcrest
                    </div>
                    <div className="text-sm text-accent -mt-1">Pro</div>
                  </div>
                </div>
                <p className="text-primary-200 text-sm leading-relaxed">
                  Professional pool care that keeps your family's favorite
                  gathering place always ready for life's best moments.
                </p>
                <div className="flex gap-3 pt-1">
                  <button className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-smooth" aria-label="Facebook">
                    <span className="text-[11px] font-bold">f</span>
                  </button>
                  <button className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-smooth" aria-label="Instagram">
                    <span className="text-[11px] font-bold">ig</span>
                  </button>
                  <button className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-smooth" aria-label="Twitter">
                    <span className="text-[11px] font-bold">tw</span>
                  </button>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-inter font-semibold text-white">Services</h4>
                <ul className="space-y-2 text-sm text-primary-200">
                  {/* <li>
                    <a
                      href="/maintenance-plans"
                      className="hover:text-white transition-smooth"
                    >
                      Maintenance Plans
                    </a>
                  </li> */}
                  <li>
                    <a
                      href="/emergency-repairs"
                      className="hover:text-white transition-smooth"
                    >
                      Emergency Repairs
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services"
                      className="hover:text-white transition-smooth"
                    >
                      Seasonal Services
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services"
                      className="hover:text-white transition-smooth"
                    >
                      Pool Cleaning
                    </a>
                  </li>
                  <li>
                    <a
                      href="/services"
                      className="hover:text-white transition-smooth"
                    >
                      Equipment Repair
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-inter font-semibold text-white">Company</h4>
                <ul className="space-y-2 text-sm text-primary-200">
                  <li>
                    <a
                      href="/about-poolcrest"
                      className="hover:text-white transition-smooth"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about-poolcrest"
                      className="hover:text-white transition-smooth"
                    >
                      Our Team
                    </a>
                  </li>
                  {/* <li>
                    <a href="#" className="hover:text-white transition-smooth">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-smooth">
                      Reviews
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-smooth">
                      Service Areas
                    </a>
                  </li> */}
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-inter font-semibold text-white">Contact</h4>
                <div className="space-y-2.5 text-sm text-primary-200">
                  <div className="flex items-center space-x-2">
                    <span>📞</span>
                    <span>(555) 123-POOL</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✉️</span>
                    <span>hello@poolcrestpro.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📍</span>
                    <span className="truncate">Serving Greater Metro Area</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🕒</span>
                    <span>24/7 Emergency Service</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-800 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-xs sm:text-sm text-primary-200 text-center md:text-left">
                © {new Date().getFullYear()} Poolcrest LLC. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-xs sm:text-sm text-primary-200 mt-1 md:mt-0">
                <a href="#" className="hover:text-white transition-smooth">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-smooth">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-white transition-smooth">
                  License #PC-2024-001
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Homepage;
