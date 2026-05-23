import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-24 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-accent animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-secondary animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 pool-gradient rounded-xl flex items-center justify-center">
                  <Icon name="Users" size={24} color="white" />
                </div>
                <span className="text-accent font-inter font-semibold text-lg">About Poolcrest</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-inter font-bold text-text-primary leading-tight">
                Your Trusted
                <span className="text-gradient-primary block">Pool Care Partners</span>
              </h1>
              
              <p className="text-xl text-text-secondary font-inter leading-relaxed">
                More than just pool maintenance – we're your neighbors who happen to be pool experts, 
                combining technical excellence with genuine care for your family's safety and enjoyment.
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-inter font-bold text-primary">15+</div>
                <div className="text-sm text-text-secondary font-inter">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-inter font-bold text-primary">2,500+</div>
                <div className="text-sm text-text-secondary font-inter">Happy Families</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-inter font-bold text-primary">24/7</div>
                <div className="text-sm text-text-secondary font-inter">Emergency Support</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                iconName="Calendar"
                iconPosition="left"
                className="font-inter font-semibold"
              >
                Schedule Consultation
              </Button>
              <Button
                variant="outline"
                size="lg"
                iconName="Phone"
                iconPosition="left"
                className="font-inter font-semibold"
              >
                Call Us Today
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Professional pool technician working on pool maintenance"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-xl"
              />
              
              {/* Floating Trust Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-border-light">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <Icon name="Shield" size={24} color="var(--color-success)" />
                  </div>
                  <div>
                    <div className="font-inter font-semibold text-text-primary">Fully Licensed</div>
                    <div className="text-sm text-text-secondary">& Insured</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;