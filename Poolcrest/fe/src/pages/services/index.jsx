import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

import ServiceCategory from "./components/ServiceCategory";
import CostCalculator from "./components/CostCalculator";
import TransformationGallery from "./components/TransformationGallery";
import ServiceFilters from "./components/ServiceFilters";
import { servicesService } from "../../utils/djangoServices";
import { allServicesFallback } from "../../../fallback/fallback_data";
import useWebSocket from "../../utils/useWebSocket";

const ServicesOverview = () => {
  const [activeFilters, setActiveFilters] = useState({
    urgency: [],
    category: [],
    priceRange: [],
    duration: [],
  });
  const [filteredServices, setFilteredServices] = useState([]);
  const [currentSeason, setCurrentSeason] = useState("");

  // Local state for services; seed with typed fallback and replace with API if available
  const [allServices, setAllServices] = useState(allServicesFallback);
  const [wsConnected, setWsConnected] = useState(false);

  // Map backend categories/fields to UI categories expected by cards
  const mapBackendToUi = (s) => {
    const urgency = s.urgency || s.response_level || "routine";
    const categoryRaw = (s.category || "").toLowerCase();
    let category = "maintenance";
    // heuristic mapping
    if (
      ["emergency", "urgent"].includes(categoryRaw) ||
      urgency === "emergency"
    )
      category = "emergency";
    else if (["maintenance", "weekly", "bi-weekly"].includes(categoryRaw))
      category = "maintenance";
    else if (
      ["cleaning", "deep cleaning", "tile cleaning"].includes(categoryRaw)
    )
      category = "cleaning";
    else if (["repair", "equipment", "leak"].includes(categoryRaw))
      category = "repair";
    else if (["renovation", "upgrade"].includes(categoryRaw))
      category = "renovation";
    else if (
      ["seasonal", "opening", "closing", "winter"].includes(categoryRaw) ||
      urgency === "seasonal"
    )
      category = "seasonal";

    return {
      id: s.id,
      title: s.name,
      description: s.description,
      image: s.image_url || s.image || "",
      price: Number(s.base_price ?? 0),
      duration: s.price_unit || "service",
      features: Array.isArray(s.features) ? s.features : [],
      rating: s.rating || undefined,
      reviewCount: s.review_count || 0,
      urgency,
      category,
      bookingPath:
        category === "emergency"
          ? "/emergency-repairs"
          : "/get-quote-book-service",
      isPopular: !!s.is_popular,
      available_24_7: !!s.available_24_7,
    };
  };

  // Fetch services from backend on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const res = await servicesService.getServices({
        detailed: 1,
        status: true,
      });
      if (!isMounted || !res.success) return;
      const mapped = (res.data || []).map(mapBackendToUi);
      if (mapped.length) {
        setAllServices(mapped);
        setFilteredServices(mapped);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time updates via WebSocket (proxy to /ws)
  useWebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${
      location.host
    }/ws/services/`,
    {
      onOpen: () => setWsConnected(true),
      onClose: () => setWsConnected(false),
      onMessage: (msg) => {
        if (!msg || !msg.type) return;
        if (
          ["service.updated", "service.created", "service.deleted"].includes(
            msg.type
          )
        ) {
          // Refresh list
          servicesService
            .getServices({ detailed: 1, status: true })
            .then((res) => {
              if (!res.success) return;
              const mapped = (res.data || []).map(mapBackendToUi);
              setAllServices(mapped);
              setFilteredServices((prev) => {
                // Re-apply current filters to new data
                return mapped;
              });
            });
        }
      },
    }
  );

  // Polling fallback when WS is disconnected
  useEffect(() => {
    if (wsConnected) return;
    const id = setInterval(() => {
      servicesService.getServices({ detailed: 1, status: true }).then((res) => {
        if (!res.success) return;
        const mapped = (res.data || []).map(mapBackendToUi);
        setAllServices(mapped);
        setFilteredServices(mapped);
      });
    }, 10000);
    return () => clearInterval(id);
  }, [wsConnected]);

  // Refresh on window focus
  useEffect(() => {
    const onFocus = () => {
      servicesService.getServices({ detailed: 1, status: true }).then((res) => {
        if (!res.success) return;
        const mapped = (res.data || []).map(mapBackendToUi);
        setAllServices(mapped);
        setFilteredServices(mapped);
      });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const serviceCategories = [
    {
      type: "emergency",
      title: "Emergency Services",
      description:
        "Immediate response for urgent pool issues and safety concerns",
    },
    {
      type: "maintenance",
      title: "Regular Maintenance",
      description: "Ongoing care to keep your pool perfect year-round",
    },
    {
      type: "cleaning",
      title: "Deep Cleaning",
      description: "Intensive cleaning and restoration services",
    },
    {
      type: "repair",
      title: "Equipment Repair",
      description: "Professional repair and replacement services",
    },
    {
      type: "renovation",
      title: "Renovation & Upgrades",
      description: "Transform and modernize your pool experience",
    },
    {
      type: "seasonal",
      title: "Seasonal Services",
      description: "Opening, closing, and seasonal preparation services",
    },
  ];

  // Determine current season
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason("spring");
    else if (month >= 5 && month <= 7) setCurrentSeason("summer");
    else if (month >= 8 && month <= 10) setCurrentSeason("fall");
    else setCurrentSeason("winter");
  }, []);

  // Filter services based on active filters
  useEffect(() => {
    let filtered = allServices;

    Object.entries(activeFilters).forEach(([category, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((service) => {
          switch (category) {
            case "urgency":
              return values.includes(service.urgency);
            case "category":
              return values.includes(service.category);
            case "priceRange":
              const price = service.price;
              return values.some((range) => {
                switch (range) {
                  case "budget":
                    return price < 200;
                  case "standard":
                    return price >= 200 && price <= 500;
                  case "premium":
                    return price > 500 && price <= 1000;
                  case "luxury":
                    return price > 1000;
                  default:
                    return true;
                }
              });
            case "duration":
              return values.some((duration) => {
                switch (duration) {
                  case "quick":
                    return service.urgency === "emergency";
                  case "standard":
                    return service.urgency === "routine";
                  case "extended":
                    return service.urgency === "seasonal";
                  default:
                    return true;
                }
              });
            default:
              return true;
          }
        });
      }
    });

    setFilteredServices(filtered);
  }, [activeFilters, allServices]);

  const handleFilterChange = (category, values) => {
    if (category === "clear") {
      setActiveFilters({
        urgency: [],
        category: [],
        priceRange: [],
        duration: [],
      });
    } else {
      setActiveFilters((prev) => ({
        ...prev,
        [category]: values,
      }));
    }
  };

  const getServicesByCategory = (categoryType) => {
    return filteredServices.filter(
      (service) => service.category === categoryType
    );
  };

  const getSeasonalMessage = () => {
    switch (currentSeason) {
      case "spring":
        return {
          title: "Spring Pool Opening Season",
          message:
            "Get your pool ready for summer fun with our professional opening services",
          icon: "Flower",
          color: "text-success",
        };
      case "summer":
        return {
          title: "Peak Swimming Season",
          message:
            "Keep your pool perfect with regular maintenance and emergency support",
          icon: "Sun",
          color: "text-warning",
        };
      case "fall":
        return {
          title: "Winterization Time",
          message:
            "Protect your pool investment with professional closing services",
          icon: "Leaf",
          color: "text-accent",
        };
      case "winter":
        return {
          title: "Winter Pool Care",
          message:
            "Emergency repairs and equipment maintenance continue year-round",
          icon: "Snowflake",
          color: "text-secondary",
        };
      default:
        return {
          title: "Year-Round Pool Care",
          message: "Professional services for every season and situation",
          icon: "Calendar",
          color: "text-primary",
        };
    }
  };

  const seasonalMessage = getSeasonalMessage();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-text-primary font-inter">
                Complete Pool Care
                <span className="text-gradient-primary block">Ecosystem</span>
              </h1>
            </div>

            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              From emergency repairs to luxury renovations, discover our
              comprehensive range of professional pool services designed to keep
              your family's aquatic paradise perfect year-round.
            </p>

            {/* Seasonal Banner */}
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-border-light">
              <Icon
                name={seasonalMessage.icon}
                size={20}
                className={seasonalMessage.color}
              />
              <div className="text-left">
                <div className="font-semibold text-text-primary text-sm">
                  {seasonalMessage.title}
                </div>
                <div className="text-xs text-text-secondary">
                  {seasonalMessage.message}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: "Clock", value: "2 Hour", label: "Emergency Response" },
              { icon: "Users", value: "1000+", label: "Happy Families" },
              { icon: "Award", value: "15 Years", label: "Experience" },
              { icon: "Shield", value: "100%", label: "Insured & Licensed" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-3">
                  <Icon name={stat.icon} size={24} className="text-primary" />
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Emergency CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="warning"
              size="lg"
              iconName="Phone"
              iconPosition="left"
              className="emergency-glow animate-pulse-slow"
            >
              <Link to="/emergency-repairs" className="text-warning-foreground">
                Emergency Service - Call Now
              </Link>
            </Button>
            <Button
              variant="primary"
              size="lg"
              iconName="Calculator"
              iconPosition="left"
            >
              Get Instant Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Service Filters */}
      <section className="py-8 bg-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServiceFilters
            onFilterChange={handleFilterChange}
            activeFilters={activeFilters}
          />
        </div>
      </section>

      {/* Services by Category */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-inter mb-4">
              Professional Pool Services
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Organized by urgency and expertise level to help you find exactly
              what your pool needs
            </p>
          </div>

          {/* Emergency Services First */}
          <ServiceCategory
            category={serviceCategories.find((cat) => cat.type === "emergency")}
            services={getServicesByCategory("emergency")}
            defaultExpanded={true}
          />

          {/* Other Categories */}
          {serviceCategories
            .filter((cat) => cat.type !== "emergency")
            .map((category) => (
              <ServiceCategory
                key={category.type}
                category={category}
                services={getServicesByCategory(category.type)}
                defaultExpanded={false}
              />
            ))}
        </div>
      </section>

      {/* Cost Calculator Section */}
      {/* <section className="py-16 bg-surface-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-inter mb-4">
              Service Cost Calculator
            </h2>
            <p className="text-lg text-text-secondary">
              Get instant estimates for your pool service needs
            </p>
          </div>

          <CostCalculator />
        </div>
      </section> */}

      {/* Transformation Gallery */}
      {/* <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-inter mb-4">
              Real Transformations
            </h2>
            <p className="text-lg text-text-secondary">
              See how we've helped families restore and enhance their pools
            </p>
          </div>

          <TransformationGallery />
        </div>
      </section> */}

      {/* Pool Care Academy Teaser */}
      {/* <section className="py-16 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
            <Icon
              name="GraduationCap"
              size={32}
              className="text-primary-foreground"
            />
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-inter mb-4">
            Pool Care Academy
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Learn from the experts with our comprehensive guides, seasonal tips,
            and troubleshooting resources. Empower yourself with pool care
            knowledge.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: "BookOpen",
                title: "Maintenance Guides",
                description: "Step-by-step care instructions",
              },
              {
                icon: "Calendar",
                title: "Seasonal Checklists",
                description: "Year-round preparation tips",
              },
              {
                icon: "AlertCircle",
                title: "Troubleshooting",
                description: "Common problem solutions",
              },
            ].map((resource, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
                  <Icon
                    name={resource.icon}
                    size={24}
                    className="text-primary"
                  />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {resource.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {resource.description}
                </p>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            iconName="ArrowRight"
            iconPosition="right"
          >
            Explore Academy
          </Button>
        </div>
      </section> */}

      {/* Final CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-inter text-[#e3bb0a]">
            Ready to Experience Poolcrest Care?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join over 1,000 families who trust Poolcrest with their pool care
            needs. Professional service, family-focused care, and peace of mind
            guaranteed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="warning"
              size="lg"
              iconName="Phone"
              iconPosition="left"
              className="emergency-glow"
            >
              <Link to="/emergency-repairs" className="text-warning-foreground">
                Emergency: (555) 123-POOL
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              iconName="Calendar"
              iconPosition="left"
            >
              <Link
                to="/get-quote-book-service"
                className="text-secondary-foreground"
              >
                Schedule Service
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-primary-400">
            <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} />
                <span>24/7 Emergency</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Award" size={16} />
                <span>15+ Years Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-text-primary text-text-inverse py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 pool-gradient rounded-xl flex items-center justify-center">
                  <Icon name="Waves" size={24} color="white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">Poolcrest</span>
                  <span className="text-accent ml-1">LLC</span>
                </div>
              </div>
              <p className="text-text-inverse/80 mb-4 max-w-md">
                Professional pool care services for discerning homeowners. Your
                pool, our expertise, your peace of mind.
              </p>
              <div className="flex space-x-4">
                {["Facebook", "Twitter", "Instagram", "Linkedin"].map(
                  (social) => (
                    <button
                      key={social}
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-smooth"
                    >
                      <Icon name={social} size={20} />
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-text-inverse/80">
                <li>
                  <Link
                    to="/emergency-repairs"
                    className="hover:text-accent transition-smooth"
                  >
                    Emergency Repairs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/maintenance-plans"
                    className="hover:text-accent transition-smooth"
                  >
                    Maintenance Plans
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-accent transition-smooth"
                  >
                    All Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/get-quote-book-service"
                    className="hover:text-accent transition-smooth"
                  >
                    Get Quote
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-text-inverse/80">
                <li className="flex items-center space-x-2">
                  <Icon name="Phone" size={16} />
                  <span>(555) 123-POOL</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Mail" size={16} />
                  <span>info@poolcrest.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="MapPin" size={16} />
                  <span>Serving Greater Metro Area</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-text-inverse/60">
            <p>
              &copy; {new Date().getFullYear()} Poolcrest LLC. All rights
              reserved. Licensed, Bonded & Insured.
            </p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default ServicesOverview;
