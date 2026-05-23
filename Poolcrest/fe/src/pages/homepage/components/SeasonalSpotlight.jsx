import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const SeasonalSpotlight = () => {
  const [currentSeason, setCurrentSeason] = useState("spring");

  const seasonalContent = {
    spring: {
      title: "Spring Pool Opening",
      subtitle: "Get your pool ready for family fun",
      description:
        "Professional spring opening services to ensure your pool is crystal clear and family-safe for the swimming season ahead.",
      image:
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      icon: "Sun",
      color: "success",
      features: [
        "Complete system startup and inspection",
        "Water chemistry balancing and testing",
        "Equipment maintenance and calibration",
        "Safety equipment check and installation",
      ],
      cta: "Schedule Spring Opening",
      price: "Starting at $299",
    },
    summer: {
      title: "Summer Maintenance",
      subtitle: "Keep your pool perfect all season long",
      description:
        "Regular maintenance services that ensure your pool stays clean, safe, and ready for spontaneous family gatherings.",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      icon: "Waves",
      color: "primary",
      features: [
        "Weekly cleaning and skimming service",
        "Chemical balancing and water testing",
        "Filter cleaning and equipment checks",
        "Algae prevention and treatment",
      ],
      cta: "View Maintenance Plans",
      price: "Starting at $149/month",
    },
    fall: {
      title: "Winterization Service",
      subtitle: "Protect your investment through winter",
      description:
        "Professional winterization services that safeguard your pool equipment and ensure easy spring startup.",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      icon: "Snowflake",
      color: "warning",
      features: [
        "Complete system drainage and winterization",
        "Equipment protection and storage",
        "Pool cover installation and securing",
        "Spring opening preparation checklist",
      ],
      cta: "Schedule Winterization",
      price: "Starting at $399",
    },
  };

  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason("spring");
    else if (month >= 5 && month <= 8) setCurrentSeason("summer");
    else setCurrentSeason("fall");
  }, []);

  const content = seasonalContent[currentSeason];

  return (
    <section className="py-16 lg:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
            <Icon name="Calendar" size={20} className="text-primary" />
            <span className="text-sm font-inter font-semibold text-text-primary">
              Seasonal Service Spotlight
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            {content.title}
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={content.image}
                alt={`${content.title} - Professional pool service`}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Price Badge */}
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-glass rounded-xl px-4 py-2 shadow-lg">
              <div className="text-sm font-inter font-medium text-text-secondary">
                Starting at
              </div>
              <div className="text-lg font-inter font-bold text-primary">
                {content.price}
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 bg-${content.color} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <Icon name={content.icon} size={32} color="white" />
              </div>
              <div>
                <h3 className="text-2xl font-inter font-bold text-text-primary">
                  {content.title}
                </h3>
                <p className="text-text-secondary font-inter">
                  Professional seasonal care
                </p>
              </div>
            </div>

            <p className="text-lg text-text-secondary leading-relaxed">
              {content.description}
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={16} className="text-success" />
                  </div>
                  <span className="text-text-primary font-inter">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/get-quote-book-service">
                <Button
                  variant={content.color}
                  size="lg"
                  iconName="Calendar"
                  iconPosition="left"
                  className="font-inter font-semibold w-full sm:w-auto"
                >
                  {content.cta}
                </Button>
              </Link>
              <Link to="/services">
                <Button
                  variant="outline"
                  size="lg"
                  iconName="ArrowRight"
                  iconPosition="right"
                  className="font-inter font-semibold w-full sm:w-auto"
                >
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Season Selector */}
        <div className="mt-16 flex justify-center">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {Object.entries(seasonalContent).map(([season, data]) => (
                <button
                  key={season}
                  onClick={() => setCurrentSeason(season)}
                  className={`px-6 py-3 rounded-xl font-inter font-medium transition-smooth ${
                    currentSeason === season
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-text-secondary hover:text-primary hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name={data.icon} size={20} />
                    <span className="capitalize">{season}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonalSpotlight;
