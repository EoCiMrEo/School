import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const ContactSection = () => {
  const contactMethods = [
    {
      type: "Emergency Service",
      icon: "Phone",
      title: "24/7 Emergency Line",
      value: "(555) 911-POOL",
      description: "Immediate response for urgent pool issues",
      action: "Call Now",
      urgent: true,
    },
    {
      type: "General Service",
      icon: "Phone",
      title: "Main Office",
      value: "(555) 123-4567",
      description: "Schedule service, ask questions, get quotes",
      action: "Call Us",
    },
    {
      type: "Email",
      icon: "Mail",
      title: "Email Support",
      value: "hello@poolcrest.com",
      description: "Non-urgent inquiries and service requests",
      action: "Send Email",
    },
    {
      type: "Location",
      icon: "MapPin",
      title: "Service Area",
      value: "Greater Metro Area",
      description: "We serve a 25-mile radius from downtown",
      action: "View Coverage",
    },
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "7:00 AM - 7:00 PM" },
    { day: "Saturday", hours: "8:00 AM - 5:00 PM" },
    { day: "Sunday", hours: "Emergency Service Only" },
    { day: "Holidays", hours: "Emergency Service Available" },
  ];

  const quickActions = [
    {
      title: "Schedule Service",
      description: "Book your pool maintenance or repair",
      icon: "Calendar",
      link: "/get-quote-book-service",
      variant: "primary",
    },
    {
      title: "Emergency Repair",
      description: "Get immediate help for urgent issues",
      icon: "AlertTriangle",
      link: "/emergency-repairs",
      variant: "warning",
    },
    {
      title: "View Services",
      description: "Explore our complete service offerings",
      icon: "Wrench",
      link: "/services",
      variant: "secondary",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 pool-gradient rounded-lg flex items-center justify-center">
              <Icon name="MessageCircle" size={20} color="white" />
            </div>
            <span className="text-accent font-inter font-semibold text-lg">
              Get in Touch
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Ready to Experience the Poolcrest Difference?
          </h2>
          <p className="text-xl text-text-secondary font-inter max-w-3xl mx-auto leading-relaxed">
            We're here to help with all your pool care needs. From routine
            maintenance to emergency repairs, our team is ready to provide the
            expert service your family deserves.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 shadow-lg border border-border-light text-center hover:shadow-xl transition-smooth ${
                method.urgent ? "ring-2 ring-warning emergency-glow" : ""
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  method.urgent ? "bg-warning text-white" : "bg-primary-100"
                }`}
              >
                <Icon
                  name={method.icon}
                  size={24}
                  color={method.urgent ? "white" : "var(--color-primary)"}
                />
              </div>
              <div className="space-y-2">
                <span
                  className={`text-xs font-inter font-medium px-2 py-1 rounded-full ${
                    method.urgent
                      ? "bg-warning-100 text-warning"
                      : "bg-primary-100 text-primary"
                  }`}
                >
                  {method.type}
                </span>
                <h3 className="font-inter font-semibold text-text-primary">
                  {method.title}
                </h3>
                <p
                  className={`font-inter font-bold ${
                    method.urgent ? "text-warning text-lg" : "text-primary"
                  }`}
                >
                  {method.value}
                </p>
                <p className="text-sm text-text-secondary font-inter leading-relaxed">
                  {method.description}
                </p>
                <Button
                  variant={method.urgent ? "warning" : "outline"}
                  size="sm"
                  className="font-inter font-medium"
                >
                  {method.action}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Office Hours & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Office Hours */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border-light">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={24} color="var(--color-primary)" />
              </div>
              <h3 className="text-2xl font-inter font-bold text-text-primary">
                Office Hours
              </h3>
            </div>

            <div className="space-y-4">
              {officeHours.map((schedule, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-border-light last:border-b-0"
                >
                  <span className="font-inter font-medium text-text-primary">
                    {schedule.day}
                  </span>
                  <span className="font-inter text-text-secondary">
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-warning-50 rounded-lg border border-warning-200">
              <div className="flex items-center space-x-2 mb-2">
                <Icon
                  name="AlertTriangle"
                  size={16}
                  color="var(--color-warning)"
                />
                <span className="font-inter font-semibold text-warning">
                  Emergency Service
                </span>
              </div>
              <p className="text-sm text-text-secondary font-inter">
                24/7 emergency service available for urgent pool issues.
                Additional charges may apply for after-hours service.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={24} color="var(--color-secondary)" />
              </div>
              <h3 className="text-2xl font-inter font-bold text-text-primary">
                Quick Actions
              </h3>
            </div>

            {quickActions.map((action, index) => (
              <Link key={index} to={action.link} className="block">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-border-light hover:shadow-xl transition-smooth group">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        action.variant === "primary"
                          ? "bg-primary-100"
                          : action.variant === "warning"
                          ? "bg-warning-100"
                          : "bg-secondary-100"
                      }`}
                    >
                      <Icon
                        name={action.icon}
                        size={24}
                        color={
                          action.variant === "primary"
                            ? "var(--color-primary)"
                            : action.variant === "warning"
                            ? "var(--color-warning)"
                            : "var(--color-secondary)"
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-inter font-semibold text-text-primary group-hover:text-primary transition-smooth">
                        {action.title}
                      </h4>
                      <p className="text-sm text-text-secondary font-inter">
                        {action.description}
                      </p>
                    </div>
                    <Icon
                      name="ArrowRight"
                      size={20}
                      color="var(--color-text-secondary)"
                      className="group-hover:text-primary transition-smooth"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-border-light text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 pool-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Users" size={32} color="white" />
            </div>
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              Join the Poolcrest Family
            </h3>
            <p className="text-lg text-text-secondary font-inter leading-relaxed mb-8">
              Experience the peace of mind that comes with professional pool
              care. Let us handle the technical details so you can focus on
              creating memories with your family.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                iconName="Calendar"
                iconPosition="left"
                className="font-inter font-semibold"
              >
                <Link
                  to="/get-quote-book-service"
                  className="text-primary-foreground"
                >
                  Get Your Free Quote
                </Link>
              </Button>
              <Button
                variant="warning"
                size="lg"
                iconName="Phone"
                iconPosition="left"
                className="font-inter font-semibold emergency-glow"
                onClick={() => (window.location.href = "tel:+15559114567")}
              >
                Call Emergency Line
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border-light">
              <p className="text-sm text-text-secondary font-inter">
                Licensed • Insured • Locally Owned • Serving families since 2008
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
