import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import Button from "../../../components/ui/Button";

const ServiceCard = ({ service, featured = false }) => {
  const {
    id,
    title,
    description,
    image,
    price,
    duration,
    features,
    rating,
    reviewCount,
    urgency,
    category,
    bookingPath,
    isPopular,
    available_24_7,
  } = service;

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "emergency":
        return "text-error bg-error-50 border-error-200";
      case "seasonal":
        return "text-warning bg-warning-50 border-warning-200";
      case "routine":
        return "text-success bg-success-50 border-success-200";
      default:
        return "text-text-secondary bg-surface border-border";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "emergency":
        return "AlertTriangle";
      case "maintenance":
        return "Wrench";
      case "cleaning":
        return "Droplets";
      case "repair":
        return "Settings";
      case "renovation":
        return "Hammer";
      case "seasonal":
        return "Calendar";
      default:
        return "Pool";
    }
  };

  const is247 = Boolean(available_24_7) || urgency === "emergency";

  return (
    <div
      className={`card relative overflow-hidden transition-smooth hover-lift ${
        featured ? "ring-2 ring-primary-300 shadow-lg" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
            Most Popular
          </span>
        </div>
      )}

      {is247 && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-error text-error-foreground px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            24/7 Available
          </span>
        </div>
      )}

      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-smooth hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div
              className={`px-3 py-1 rounded-full border text-xs font-medium ${getUrgencyColor(
                urgency
              )}`}
            >
              <Icon
                name={getCategoryIcon(category)}
                size={12}
                className="inline mr-1"
              />
              {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
            </div>

            {rating && (
              <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                <Icon
                  name="Star"
                  size={12}
                  className="text-accent fill-current"
                />
                <span className="text-xs font-medium text-text-primary">
                  {rating}
                </span>
                <span className="text-xs text-text-secondary">
                  ({reviewCount})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-text-primary font-inter">
            {title}
          </h3>
          {price && (
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">${price}</span>
              {duration && (
                <span className="text-sm text-text-secondary block">
                  /{duration}
                </span>
              )}
            </div>
          )}
        </div>

        <p className="text-text-secondary mb-4 line-clamp-3">{description}</p>

        {features && features.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-text-primary mb-2">
              What's Included:
            </h4>
            <ul className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-text-secondary"
                >
                  <Icon
                    name="Check"
                    size={14}
                    className="text-success mr-2 flex-shrink-0"
                  />
                  {feature}
                </li>
              ))}
              {features.length > 3 && (
                <li className="text-sm text-primary font-medium">
                  +{features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant={urgency === "emergency" ? "warning" : "primary"}
            iconName={urgency === "emergency" ? "Phone" : "Calendar"}
            iconPosition="left"
            className="flex-1"
          >
            <Link to={bookingPath} className="text-current">
              {urgency === "emergency" ? "Call Now" : "Book Service"}
            </Link>
          </Button>

          <Button
            variant="outline"
            iconName="Info"
            iconPosition="left"
            className="flex-1 sm:flex-none"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
