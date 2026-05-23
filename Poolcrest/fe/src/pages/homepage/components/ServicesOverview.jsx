import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const ServicesOverview = () => {
  const services = [
    {
      id: 1,
      title: "Maintenance Plans",
      subtitle: "Worry-free pool ownership",
      description:
        "Regular cleaning, chemical balancing, and equipment maintenance to keep your pool crystal clear and family-safe year-round.",
      image:
        "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800",
      icon: "Calendar",
      color: "primary",
      features: [
        "Weekly cleaning service",
        "Chemical balancing",
        "Equipment maintenance",
        "Priority emergency service",
      ],
      pricing: "Starting at $149/month",
      cta: "View Plans",
      link: "/maintenance-plans",
      badge: "Most Popular",
    },
    {
      id: 2,
      title: "Emergency Repairs",
      subtitle: "Same-day service available",
      description:
        "Equipment failures, leaks, and urgent pool issues resolved quickly by certified technicians with guaranteed response times.",
      image:
        "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800",
      icon: "Wrench",
      color: "danger",
      features: [
        "24/7 emergency response",
        "Same-day service",
        "Certified technicians",
        "Equipment replacement",
      ],
      pricing: "Service call $89",
      cta: "Get Emergency Help",
      link: "/emergency-repairs",
      badge: "24/7 Available",
    },
    {
      id: 3,
      title: "Seasonal Services",
      subtitle: "Opening & closing specialists",
      description:
        "Professional spring opening and winterization services to protect your investment and ensure smooth seasonal transitions.",
      image:
        "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=800",
      icon: "Snowflake",
      color: "warning",
      features: [
        "Spring pool opening",
        "Winterization service",
        "Equipment inspection",
        "System startup",
      ],
      pricing: "Starting at $299",
      cta: "Schedule Service",
      link: "/services",
      badge: "Seasonal",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-surface rounded-full px-4 py-2 shadow-sm mb-4">
            <Icon name="Wrench" size={20} className="text-primary" />
            <span className="text-sm font-inter font-semibold text-text-primary">
              Complete Pool Care Solutions
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Professional Services for Every Pool Need
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            From routine maintenance to emergency repairs, we provide
            comprehensive pool care services that keep your family's favorite
            gathering place perfect year-round.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group relative">
              {/* Service Card */}
              <div className="card h-full hover-lift transition-smooth overflow-hidden">
                {/* Badge */}
                {service.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-inter font-semibold ${
                        service.color === "primary"
                          ? "bg-primary text-primary-foreground"
                          : service.color === "danger"
                          ? "bg-error text-error-foreground"
                          : "bg-warning text-warning-foreground"
                      }`}
                    >
                      {service.badge}
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={`${service.title} - Professional pool service`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Icon Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        service.color === "primary"
                          ? "bg-primary"
                          : service.color === "danger"
                          ? "bg-error"
                          : "bg-warning"
                      }`}
                    >
                      <Icon name={service.icon} size={24} color="white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-inter font-bold text-text-primary mb-1">
                      {service.title}
                    </h3>
                    <p className="text-sm text-text-secondary font-inter font-medium">
                      {service.subtitle}
                    </p>
                  </div>

                  <p className="text-text-secondary leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Icon
                          name="Check"
                          size={16}
                          className="text-success flex-shrink-0"
                        />
                        <span className="text-sm text-text-secondary">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="pt-4 border-t border-border-light">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-inter font-bold text-text-primary">
                        {service.pricing}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Transparent pricing
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link to={service.link}>
                      <Button
                        variant={service.color}
                        size="md"
                        iconName="ArrowRight"
                        iconPosition="right"
                        fullWidth
                        className="font-inter font-semibold"
                      >
                        {service.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-surface rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-inter font-bold text-text-primary mb-4">
              Not sure which service you need?
            </h3>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Our pool care experts will assess your specific needs and
              recommend the perfect service plan for your family's pool.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-quote-book-service">
                <Button
                  variant="primary"
                  size="lg"
                  iconName="MessageCircle"
                  iconPosition="left"
                  className="font-inter font-semibold w-full sm:w-auto"
                >
                  Get Free Consultation
                </Button>
              </Link>
              <Link to="/services">
                <Button
                  variant="outline"
                  size="lg"
                  iconName="Eye"
                  iconPosition="left"
                  className="font-inter font-semibold w-full sm:w-auto"
                >
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
