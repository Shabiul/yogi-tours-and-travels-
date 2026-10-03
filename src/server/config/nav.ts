import type { NavLink } from "../types/models.js";

export const mainNav: NavLink[] = [
  { label: "Home", href: "/", match: "/" },
  { label: "About", href: "/about", match: "/about" },
  { label: "Fleet", href: "/fleet", match: "/fleet" },
  { label: "Tours & Packages", href: "/tour-packages", match: "/tour-packages" },
  { label: "Services", href: "/services", match: "/services" },
  { label: "Gallery", href: "/gallery", match: "/gallery" },
  { label: "Blog", href: "/blog", match: "/blog" },
  { label: "Contact", href: "/contact", match: "/contact" }
];

export const footerServiceLinks: NavLink[] = [
  { label: "Car Rental", href: "/fleet/car", match: "/fleet/car" },
  { label: "Tempo Traveller", href: "/fleet/tempo-traveller", match: "/fleet/tempo-traveller" },
  { label: "Force Urbania Hire", href: "/rent/force-urbania", match: "/rent/force-urbania" },
  { label: "Mini Bus Rental", href: "/fleet/mini-bus", match: "/fleet/mini-bus" },
  { label: "Tourist Bus Hire", href: "/fleet/tourist-bus", match: "/fleet/tourist-bus" },
  { label: "Airport Transfers", href: "/services/airport-transfer", match: "/services/airport-transfer" },
  { label: "Outstation Vehicle Rentals", href: "/rent", match: "/rent" }
];

export const footerToursLinks: NavLink[] = [
  { label: "Karnataka Tour Packages", href: "/tour-packages?region=karnataka", match: "/tour-packages" },
  { label: "South India Packages", href: "/tour-packages?region=south-india", match: "/tour-packages" },
  { label: "Corporate Travel", href: "/services/corporate-travel", match: "/services/corporate-travel" },
  { label: "Wedding Transportation", href: "/services/wedding-transportation", match: "/services/wedding-transportation" },
  { label: "Bangalore to Mysore Cab", href: "/routes/bangalore-to-mysore-cab", match: "/routes" },
  { label: "Bangalore to Coorg Cab", href: "/routes/bangalore-to-coorg-cab", match: "/routes" },
  { label: "All Outstation Routes", href: "/routes", match: "/routes" }
];

export const footerCompanyLinks: NavLink[] = [
  { label: "About Us", href: "/about", match: "/about" },
  { label: "Contact", href: "/contact", match: "/contact" },
  { label: "Gallery", href: "/gallery", match: "/gallery" },
  { label: "Reviews", href: "/about#testimonials", match: "/about" },
  { label: "Blog", href: "/blog", match: "/blog" }
];

export const legalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy", match: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions", match: "/terms-and-conditions" },
  { label: "Cancellation Policy", href: "/cancellation-policy", match: "/cancellation-policy" },
  { label: "Photo Credits", href: "/photo-credits", match: "/photo-credits" },
  { label: "Sitemap", href: "/sitemap.xml", match: "/sitemap.xml" }
];
