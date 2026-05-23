import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 -mt-16 lg:-mt-20 pt-16 lg:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://1westend.com/wp-content/uploads/2021/08/2-2.jpg"
          alt="Beautiful family pool with crystal clear water and happy family enjoying poolside activities"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/70 via-primary-800/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-glass rounded-full px-4 py-2 shadow-lg">
              <Icon name="Shield" size={20} className="text-success" />
              <span className="text-sm font-inter font-semibold text-text-primary">
                Licensed & Insured • BBB A+ Rating
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-inter font-bold text-white leading-tight">
                Your pool, our expertise,{" "}
                <span className="text-gradient-accent">your peace of mind</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 font-inter leading-relaxed max-w-2xl">
                Professional pool care that keeps your family's favorite
                gathering place always ready for life's best moments.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/emergency-repairs">
                <Button
                  variant="danger"
                  size="xl"
                  iconName="Phone"
                  iconPosition="left"
                  className="emergency-glow font-inter font-bold text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Get Emergency Service
                </Button>
              </Link>
              <Link to="/maintenance-plans">
                <Button
                  variant="primary"
                  size="xl"
                  iconName="Calendar"
                  iconPosition="left"
                  className="font-inter font-bold text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Schedule Maintenance
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-inter font-bold text-white">
                  15+
                </div>
                <div className="text-sm text-white/80 font-inter">
                  Years Experience
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-inter font-bold text-white">
                  2.5K+
                </div>
                <div className="text-sm text-white/80 font-inter">
                  Happy Families
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-inter font-bold text-white">
                  24/7
                </div>
                <div className="text-sm text-white/80 font-inter">
                  Emergency Service
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Service Preview Cards */}
          <div className="hidden lg:block space-y-6">
            <div className="glass-effect rounded-2xl p-6 hover-lift">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Icon name="Wrench" size={24} color="white" />
                </div>
                <div>
                  <h3 className="font-inter font-semibold text-text-primary">
                    Emergency Repairs
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Same-day service available
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">
                Equipment failures, leaks, and urgent pool issues resolved
                quickly by certified technicians.
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-6 hover-lift">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Icon name="Calendar" size={24} color="white" />
                </div>
                <div>
                  <h3 className="font-inter font-semibold text-text-primary">
                    Maintenance Plans
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Starting at $149/month
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">
                Regular cleaning, chemical balancing, and equipment maintenance
                to keep your pool perfect.
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-6 hover-lift">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Icon name="Snowflake" size={24} color="white" />
                </div>
                <div>
                  <h3 className="font-inter font-semibold text-text-primary">
                    Seasonal Services
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Opening & closing
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">
                Professional winterization and spring opening services to
                protect your investment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <Icon name="ChevronDown" size={32} className="text-white/70" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
