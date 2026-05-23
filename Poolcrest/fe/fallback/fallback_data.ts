// Fallback typed data for public /services page
// Mirrors the shape expected by ServiceCard/ServiceCategory

export type ServiceItem = {
  id: number | string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: "hour" | "service" | "week" | "project";
  features: string[];
  rating?: number;
  reviewCount?: number;
  urgency: "emergency" | "routine" | "seasonal";
  category:
    | "emergency"
    | "maintenance"
    | "cleaning"
    | "repair"
    | "renovation"
    | "seasonal";
  bookingPath: string;
  isPopular?: boolean;
};

export const allServicesFallback: ServiceItem[] = [
  {
    id: 1,
    title: "24/7 Emergency Pool Repair",
    description:
      "Immediate response for equipment failures, leaks, and safety hazards. Our certified technicians are available around the clock to restore your pool's safety and functionality.",
    image: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
    price: 150,
    duration: "hour",
    features: [
      "2-hour response guarantee",
      "Emergency equipment replacement",
      "Safety hazard resolution",
      "24/7 availability",
      "Licensed technicians",
      "Insurance coverage",
    ],
    rating: 4.9,
    reviewCount: 247,
    urgency: "emergency",
    category: "emergency",
    bookingPath: "/emergency-repairs",
    isPopular: true,
  },
  {
    id: 2,
    title: "Weekly Pool Maintenance",
    description:
      "Comprehensive weekly service including chemical balancing, skimming, vacuuming, and equipment inspection. Keep your pool crystal clear and family-ready year-round.",
    image: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
    price: 120,
    duration: "week",
    features: [
      "Chemical testing & balancing",
      "Surface skimming",
      "Vacuum cleaning",
      "Filter maintenance",
      "Equipment inspection",
      "Water level adjustment",
    ],
    rating: 4.8,
    reviewCount: 189,
    urgency: "routine",
    category: "maintenance",
    bookingPath: "/maintenance-plans",
    isPopular: true,
  },
  {
    id: 3,
    title: "Deep Pool Cleaning Service",
    description:
      "Intensive cleaning for neglected pools, algae removal, and restoration to pristine condition. Perfect for seasonal openings or problem pool recovery.",
    image: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
    price: 350,
    duration: "service",
    features: [
      "Algae treatment & removal",
      "Deep vacuum cleaning",
      "Tile & wall scrubbing",
      "Filter deep cleaning",
      "Chemical shock treatment",
      "Water clarity restoration",
    ],
    rating: 4.9,
    reviewCount: 156,
    urgency: "seasonal",
    category: "cleaning",
    bookingPath: "/get-quote-book-service",
  },
  {
    id: 4,
    title: "Pool Equipment Repair",
    description:
      "Expert repair and replacement of pumps, filters, heaters, and automation systems. Restore your pool's functionality with professional-grade service.",
    image: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
    price: 200,
    duration: "service",
    features: [
      "Pump repair & replacement",
      "Filter system service",
      "Heater maintenance",
      "Automation system repair",
      "Warranty coverage",
      "Energy efficiency optimization",
    ],
    rating: 4.7,
    reviewCount: 203,
    urgency: "routine",
    category: "repair",
    bookingPath: "/get-quote-book-service",
  },
  {
    id: 5,
    title: "Pool Renovation & Upgrades",
    description:
      "Transform your pool with tile replacement, lighting upgrades, equipment modernization, and aesthetic enhancements for the ultimate backyard experience.",
    image: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
    price: 2500,
    duration: "project",
    features: [
      "Tile replacement & repair",
      "LED lighting installation",
      "Equipment upgrades",
      "Deck refinishing",
      "Water feature installation",
      "Smart automation systems",
    ],
    rating: 4.9,
    reviewCount: 89,
    urgency: "seasonal",
    category: "renovation",
    bookingPath: "/get-quote-book-service",
  },
  {
    id: 6,
    title: "Seasonal Pool Opening",
    description:
      "Professional spring opening service to prepare your pool for the swimming season. Complete startup process ensuring safe, clean water from day one.",
    image: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
    price: 425,
    duration: "service",
    features: [
      "Cover removal & cleaning",
      "Equipment startup",
      "Chemical balancing",
      "System inspection",
      "Leak detection",
      "Safety equipment check",
    ],
    rating: 4.8,
    reviewCount: 167,
    urgency: "seasonal",
    category: "seasonal",
    bookingPath: "/get-quote-book-service",
  },
  {
    id: 7,
    title: "Pool Winterization Service",
    description:
      "Protect your investment with professional winterization. Prevent freeze damage and ensure easy spring startup with our comprehensive closing service.",
    image: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
    price: 375,
    duration: "service",
    features: [
      "Water level adjustment",
      "Pipe winterization",
      "Equipment protection",
      "Chemical treatment",
      "Cover installation",
      "Spring startup preparation",
    ],
    rating: 4.8,
    reviewCount: 142,
    urgency: "seasonal",
    category: "seasonal",
    bookingPath: "/get-quote-book-service",
  },
  {
    id: 8,
    title: "Pool Safety Inspection",
    description:
      "Comprehensive safety audit including barrier compliance, equipment safety, and child protection measures. Ensure your pool meets all safety standards.",
    image: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
    price: 125,
    duration: "service",
    features: [
      "Barrier compliance check",
      "Equipment safety audit",
      "Chemical storage inspection",
      "Emergency equipment review",
      "Safety certification",
      "Compliance documentation",
    ],
    rating: 4.9,
    reviewCount: 98,
    urgency: "routine",
    category: "maintenance",
    bookingPath: "/get-quote-book-service",
  },
];
