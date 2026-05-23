import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/ui/Header";
import EmergencyHeader from "./components/EmergencyHeader";
import ProblemIdentifier from "./components/ProblemIdentifier";
import EmergencyBookingForm from "./components/EmergencyBookingForm";
import TechnicianAvailability from "./components/TechnicianAvailability";
import ServiceGuarantees from "./components/ServiceGuarantees";
import CostEstimator from "./components/CostEstimator";
import CustomerSuccessStories from "./components/CustomerSuccessStories";
import PreventionEducation from "./components/PreventionEducation";

const EmergencyRepairs = () => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleCallNow = () => {
    window.location.href = "tel:+15559111POOL";
  };

  const handleBookEmergency = () => {
    setShowBookingForm(true);
    // Smooth scroll to booking form
    setTimeout(() => {
      const bookingSection = document.getElementById("booking-form");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Emergency Pool Repairs - 24/7 Response | Poolcrest Pro</title>
        <meta
          name="description"
          content="Pool emergency? Get immediate help from Poolcrest Pro. 24/7 response, licensed technicians, and guaranteed service. Call now for pump failures, green water, leaks, and more."
        />
        <meta
          name="keywords"
          content="pool emergency, pool repair, 24/7 pool service, pool pump repair, green pool, pool leak, emergency pool technician"
        />
        <meta
          property="og:title"
          content="Emergency Pool Repairs - 24/7 Response | Poolcrest Pro"
        />
        <meta
          property="og:description"
          content="Don't let pool emergencies ruin your day. Our certified technicians respond quickly to restore your pool's safety and functionality."
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href="https://poolcrestpro.com/emergency-repairs"
        />
      </Helmet>

      <Header />

      {/* Emergency Header with immediate action buttons */}
      <EmergencyHeader
        onCallNow={handleCallNow}
        onBookEmergency={handleBookEmergency}
      />

      {/* Problem Identifier - Visual problem categorization */}
      <ProblemIdentifier onProblemSelect={handleProblemSelect} />

      {/* Real-time Technician Availability */}
      {/* <TechnicianAvailability /> */}

      {/* Emergency Booking Form */}
      <div id="booking-form">
        <EmergencyBookingForm selectedProblem={selectedProblem} />
      </div>

      {/* Service Guarantees */}
      <ServiceGuarantees />

      {/* Cost Estimator */}
      {/* <CostEstimator /> */}

      {/* Customer Success Stories */}
      {/* <CustomerSuccessStories /> */}

      {/* Prevention Education */}
      <PreventionEducation />

      {/* Emergency Floating Action Button for Mobile */}
      <div className="fixed bottom-6 left-6 z-50 lg:hidden">
        <button
          onClick={handleCallNow}
          className="w-16 h-16 bg-error text-white rounded-full shadow-xl emergency-glow flex items-center justify-center animate-pulse-slow"
          aria-label="Emergency call"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EmergencyRepairs;
