import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import PlanCard from "./components/PlanCard";
import ServiceCalendar from "./components/ServiceCalendar";
import ROICalculator from "./components/ROICalculator";
import CustomerPortalPreview from "./components/CustomerPortalPreview";
import TestimonialSection from "./components/TestimonialSection";
import PlanComparison from "./components/PlanComparison";

const MaintenancePlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const maintenancePlans = [
    {
      id: "essential",
      name: "Essential Care",
      subtitle: "Perfect for basic pool maintenance",
      price: 89,
      yearlyPrice: 1068,
      visits: 2,
      savings: 300,
      color: "blue",
      icon: "Droplets",
      features: [
        "Bi-weekly pool cleaning service",
        "Chemical testing and balancing",
        "Skimmer and basket cleaning",
        "Basic equipment visual inspection",
        "10% discount on all repairs",
        "Phone support during business hours",
        "Service completion notifications",
      ],
      additionalInfo: "Perfect for pools with light to moderate usage",
    },
    {
      id: "family",
      name: "Family Protection",
      subtitle: "Complete care with safety focus",
      price: 149,
      yearlyPrice: 1788,
      visits: 4,
      savings: 600,
      color: "amber",
      icon: "Shield",
      features: [
        "Weekly comprehensive pool cleaning",
        "Advanced chemical testing & balancing",
        "Complete equipment inspection & testing",
        "Child safety inspections included",
        "Filter cleaning and maintenance",
        "Customer portal access with reports",
        "15% discount on repairs and equipment",
        "Priority scheduling for services",
      ],
      additionalInfo: "Recommended for families with children",
    },
    {
      id: "lifestyle",
      name: "Lifestyle Premium",
      subtitle: "Ultimate pool luxury experience",
      price: 229,
      yearlyPrice: 2748,
      visits: "4+",
      savings: 900,
      color: "success",
      icon: "Crown",
      features: [
        "Weekly premium cleaning service",
        "Comprehensive water chemistry management",
        "Full equipment performance optimization",
        "Priority emergency service response",
        "Seasonal pool opening/closing included",
        "Equipment warranty extensions",
        "24/7 expert hotline support",
        "Complimentary pool party preparation",
        "Annual equipment tune-up service",
        "Concierge pool services available",
      ],
      additionalInfo: "For the ultimate pool ownership experience",
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    // Scroll to plan builder or redirect to booking
    const element = document.getElementById("plan-builder");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setShowPlanBuilder(true);
    }
  };

  const safetyFeatures = [
    {
      icon: "Shield",
      title: "Child Safety Inspections",
      description:
        "Regular safety checks for pool barriers, gates, and equipment to protect your family",
    },
    {
      icon: "AlertTriangle",
      title: "Equipment Safety Monitoring",
      description:
        "Continuous monitoring of electrical systems and safety equipment functionality",
    },
    {
      icon: "Eye",
      title: "Water Quality Assurance",
      description:
        "Maintaining safe chemical levels and water clarity for healthy swimming",
    },
    {
      icon: "Phone",
      title: "24/7 Emergency Support",
      description:
        "Immediate response for safety concerns and emergency situations",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Pool Maintenance Plans - Poolcrest Pro | Professional Pool Care
          Services
        </title>
        <meta
          name="description"
          content="Choose from our comprehensive pool maintenance plans designed for family safety and peace of mind. Essential Care, Family Protection, and Lifestyle Premium options available."
        />
        <meta
          name="keywords"
          content="pool maintenance plans, pool service subscription, family pool safety, pool care packages, professional pool maintenance"
        />
      </Helmet>

      <div className="min-h-screen bg-surface">
        <Header />

        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Icon name="Calendar" size={48} className="text-accent" />
                <Icon name="Shield" size={48} className="text-white" />
                <Icon name="Users" size={48} className="text-accent" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Maintenance Plans for
                <span className="text-accent block">Family Peace of Mind</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
                Invest in consistent professional care that keeps your pool
                ready for every family moment. From spontaneous weekend swims to
                planned celebrations, we ensure your pool is always perfect.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button
                  variant="warning"
                  size="lg"
                  iconName="Calculator"
                  iconPosition="left"
                  className="font-semibold"
                  onClick={() =>
                    document
                      .getElementById("roi-calculator")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Calculate Your Savings
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  iconName="Play"
                  iconPosition="left"
                  className="text-white border-white hover:bg-white hover:text-primary"
                >
                  Watch How It Works
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full animate-float"></div>
          <div
            className="absolute bottom-20 right-10 w-16 h-16 bg-white/20 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-12 h-12 bg-accent/30 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </section>

        {/* Plan Cards Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Choose Your Perfect Plan
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Every plan is designed with your family's safety and enjoyment
                in mind. From basic care to premium luxury, we have the right
                solution for your lifestyle.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {maintenancePlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isPopular={index === 1}
                  onSelectPlan={handleSelectPlan}
                />
              ))}
            </div>

            {/* Value Proposition */}
            <div className="bg-surface rounded-2xl p-8 border border-border">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  Why Choose a Maintenance Plan?
                </h3>
                <p className="text-text-secondary">
                  More than just savings—it's about family peace of mind
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      name="DollarSign"
                      size={32}
                      className="text-success"
                    />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    Save Money
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Up to 40% savings vs individual services
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Clock" size={32} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    Always Ready
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Pool ready for spontaneous family fun
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Shield" size={32} className="text-accent" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    Family Safety
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Regular safety inspections included
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Wrench" size={32} className="text-success" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    Prevent Problems
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Catch issues before they become expensive
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Calendar */}
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Year-Round Care Calendar
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Our maintenance plans adapt to seasonal needs, ensuring your
                pool receives the right care at the right time throughout the
                year.
              </p>
            </div>

            <ServiceCalendar />
          </div>
        </section>

        {/* Family Safety Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Family Safety First
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Every maintenance plan includes comprehensive safety features
                designed to protect your most precious investment—your family.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {safetyFeatures.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon
                      name={feature.icon}
                      size={36}
                      className="text-primary"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-error/5 rounded-2xl p-8 border border-error/20">
              <div className="flex items-start space-x-4">
                <Icon
                  name="AlertTriangle"
                  size={32}
                  className="text-error mt-1 flex-shrink-0"
                />
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    Emergency Response Guarantee
                  </h3>
                  <p className="text-text-secondary mb-4">
                    All maintenance plan members receive priority emergency
                    service with guaranteed response times. When safety is at
                    stake, we're there within hours, not days.
                  </p>
                  <Button
                    variant="warning"
                    iconName="Phone"
                    iconPosition="left"
                  >
                    Emergency Hotline: (555) 123-POOL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section id="roi-calculator" className="py-16 bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Calculate Your Savings
              </h2>
              <p className="text-xl text-text-secondary">
                See how much you can save with a maintenance plan vs individual
                services
              </p>
            </div>

            <ROICalculator />
          </div>
        </section>

        {/* Plan Comparison */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Detailed Plan Comparison
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Compare all features and benefits to find the perfect
                maintenance plan for your family's needs
              </p>
            </div>

            <PlanComparison />
          </div>
        </section>

        {/* Customer Portal Preview */}
        <section className="py-16 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Your Personal Pool Dashboard
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Every maintenance plan includes access to your personalized
                customer portal for seamless service management and
                communication.
              </p>
            </div>

            <CustomerPortalPreview />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TestimonialSection />
          </div>
        </section>

        {/* Plan Builder CTA */}
        <section id="plan-builder" className="py-16 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Choose your plan and start enjoying worry-free pool ownership
              today. Our team will customize the perfect maintenance schedule
              for your family.
            </p>

            {selectedPlan && (
              <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-glass">
                <h3 className="text-xl font-semibold mb-2">
                  Selected Plan: {selectedPlan.name}
                </h3>
                <p className="text-primary-200 mb-4">{selectedPlan.subtitle}</p>
                <div className="flex items-center justify-center space-x-4 text-lg">
                  <span>${selectedPlan.price}/month</span>
                  <span>•</span>
                  <span>{selectedPlan.visits} visits per month</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/get-quote-book-service">
                <Button
                  variant="warning"
                  size="lg"
                  iconName="Calendar"
                  iconPosition="left"
                  className="font-semibold"
                >
                  Book Your First Service
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                iconName="Phone"
                iconPosition="left"
                className="text-white border-white hover:bg-white hover:text-primary"
                onClick={() => (window.location.href = "tel:+1234567890")}
              >
                Call for Custom Plan
              </Button>
            </div>

            <div className="mt-8 text-sm text-primary-200">
              <p>
                ✓ No long-term contracts ✓ Cancel anytime ✓ 100% satisfaction
                guarantee
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-text-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 pool-gradient rounded-xl flex items-center justify-center">
                    <Icon name="Waves" size={24} color="white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Poolcrest</span>
                    <span className="text-accent block text-sm -mt-1">Pro</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Professional pool care for family memories and peace of mind.
                </p>
                <div className="flex space-x-4">
                  <Icon
                    name="Facebook"
                    size={20}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  />
                  <Icon
                    name="Instagram"
                    size={20}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  />
                  <Icon
                    name="Twitter"
                    size={20}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link to="/services" className="hover:text-white">
                      Pool Maintenance
                    </Link>
                  </li>
                  <li>
                    <Link to="/emergency-repairs" className="hover:text-white">
                      Emergency Repairs
                    </Link>
                  </li>
                  <li>
                    <Link to="/maintenance-plans" className="hover:text-white">
                      Maintenance Plans
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link to="/about-poolcrest" className="hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/homepage" className="hover:text-white">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Emergency Service</h4>
                <p className="text-gray-400 mb-2">24/7 Emergency Hotline</p>
                <p className="text-accent text-xl font-bold">(555) 123-POOL</p>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} Poolcrest Pro. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default MaintenancePlans;
