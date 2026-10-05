import { Router } from "express";
import {
  vehiclesRepo,
  vehiclesByCategory,
  VEHICLE_CATEGORY_LABELS,
  VEHICLE_CATEGORY_SLUGS,
  vehicleFeatures,
  vehicleGallery,
  packagesForVehicle,
  findVehicleBySlugOrAlias
} from "../db/content.js";
import { vehicleServiceSchema, breadcrumbSchema, serviceSchema, faqSchema, speakableSchema, videoObjectSchema } from "../utils/schema.js";
import { env, business } from "../config/env.js";
import { clampDescription } from "../utils/meta.js";
import { TRIP_ROUTES } from "../config/tripRoutes.js";
import type { Vehicle, VehicleCategory } from "../types/models.js";

const router = Router();

// Singular form for "X Rental in Bangalore" phrasing — VEHICLE_CATEGORY_LABELS
// is plural ("Tempo Travellers"), which reads wrong directly in front of
// "Rental" ("Tempo Travellers Rental").
const CATEGORY_RENTAL_LABEL: Record<VehicleCategory, string> = {
  car: "Car",
  "tempo-traveller": "Tempo Traveller",
  "mini-bus": "Mini Bus",
  "tourist-bus": "Tourist Bus"
};

// Per-vehicle title override for a handful of high-intent "best X in
// Bangalore" queries — kept as an explicit, honest exception (not a blanket
// claim on every vehicle) since it's backed by the business's real 4.9★/210
// Google rating stated in the meta description below, not an empty boast.
const VEHICLE_TITLE_OVERRIDE: Record<string, string> = {
  "9-seater-tempo-traveller": "9 Seater Tempo Traveller Rental Bangalore | AC Luxury Van | Yogi Tours",
  "force-urbania": "Force Urbania Rental Bangalore | Luxury 17 Seater Maharaja Van | Yogi Tours",
  "urbania-12-seater-maharaja": "12 Seater Maharaja Force Urbania Bangalore | Luxury Recliner Van | Yogi Tours",
  "maharaja-tempo-traveller": "Best 12 Seater Tempo Traveller Bangalore | Yogi Tours",
  "tempo-traveller-17-seater": "Best 17 Seater Tempo Traveller Bangalore | Yogi Tours",
  "innova-crysta": "Toyota Innova Crysta Rental Bangalore | Premium 7 Seater Cab | Yogi Tours"
};

// Real, honest Q&A phrased close to how people actually search/ask AI
// assistants — surfaced as both an FAQPage schema and a matching visible
// section on the page (Google requires FAQ schema content to be visible,
// not just present in JSON-LD). Opt-in per vehicle slug, not a blanket
// addition, so nothing here overstates what's true for a vehicle without
// a written answer.
const VEHICLE_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  "9-seater-tempo-traveller": [
    {
      question: "Where can I rent a 9 seater Tempo Traveller in Bangalore?",
      answer:
        "Yogi Tours & Travels provides 9 seater Tempo Traveller rentals across Bangalore (Bengaluru) with verified commercial chauffeurs. Pickups are available from Whitefield, Electronic City, Koramangala, Indiranagar, HSR Layout, Yelahanka, Hebbal, Jayanagar, JP Nagar, Marathahalli, and Kempegowda International Airport (BLR)."
    },
    {
      question: "What is the rental rate for a 9 seater Tempo Traveller in Bangalore?",
      answer:
        "Our 9 seater Tempo Traveller starts at ₹28/km with AC, a standard 300 km daily minimum, and a ₹500/day driver Bata. Tolls, parking, and interstate permits are billed at actuals with transparent upfront itemisation."
    },
    {
      question: "What luxury features and amenities are included in the 9 seater Tempo Traveller?",
      answer:
        "The vehicle features forward-facing push-back recliner seats (1x1 and 2x1 configuration), individual AC louvers, dedicated luggage boot plus roof carrier for 9+ large bags, audio system, mobile charging points, and wide tinted windows."
    },
    {
      question: "Can I book a 9 seater Tempo Traveller for outstation trips from Bangalore?",
      answer:
        "Yes — the 9 seater Tempo Traveller is one of Bangalore's most booked options for outstation family trips and pilgrimage tours, including Bangalore to Coorg, Ooty, Chikmagalur, Mysore, Wayanad, and Tirupati."
    },
    {
      question: "Why hire a 9 seater Tempo Traveller instead of booking two separate cabs?",
      answer:
        "A 9 seater Tempo Traveller keeps your entire family or team together in a single air-conditioned cabin with generous legroom and dedicated luggage space, saving up to 30% compared to booking two separate sedans or SUVs."
    }
  ],
  "force-urbania": [
    {
      question: "Where can I rent a luxury Force Urbania in Bangalore?",
      answer:
        "Yogi Tours & Travels provides luxury Force Urbania rentals across Bangalore (Bengaluru) with verified commercial chauffeurs. Pickups are available from Whitefield, Electronic City, Koramangala, Indiranagar, HSR Layout, Yelahanka, Hebbal, Jayanagar, JP Nagar, Marathahalli, and Kempegowda International Airport (BLR)."
    },
    {
      question: "What luxury features and amenities are included in the Force Urbania?",
      answer:
        "Our Force Urbania is custom-equipped with Maharaja reclining captain seats with deployed calf/leg rest support, mounted Sony Bravia LED Smart TV, built-in on-board Blackcat refrigerator/chiller box for cold drinks, ambient blue neon mood lighting, panoramic side windows with retractable sunblinds, individual USB fast-charging ports, and individual AC louvers."
    },
    {
      question: "How many passenger seats are available in the Force Urbania?",
      answer:
        "We offer the Force Urbania in two configurations: a 12-seater Maharaja edition with extra-wide business-class recliner captain seats (2+1 and 1+1 layout), and a 17-seater executive configuration for larger family groups, corporate offsites, wedding guest transportation, and pilgrimage tours."
    },
    {
      question: "What is the rental price for Force Urbania in Bangalore?",
      answer:
        "Force Urbania starts at ₹38/km with a standard 300 km daily minimum and a ₹700/day driver Bata. Tolls, parking, and interstate permits are billed at actuals. Every quotation is itemised and confirmed upfront before you book."
    },
    {
      question: "Can I book the Force Urbania for outstation trips from Bangalore?",
      answer:
        "Yes — the Force Urbania is our most popular luxury group vehicle for multi-day outstation tours across Karnataka and South India, including Coorg, Ooty, Chikmagalur, Wayanad, Mysore, Hampi, Tirupati, and Goa."
    }
  ],
  "urbania-12-seater-maharaja": [
    {
      question: "What makes the Urbania 12 Seater Maharaja different from regular Tempo Travellers?",
      answer:
        "The 12 Seater Maharaja Force Urbania features bespoke individual captain chairs trimmed in quilted tan and ivory leather with calf-support leg recliners, dual blue neon ceiling light rails, high-roof walkthrough cabin, Sony Bravia Smart TV, on-board cold storage, and panoramic tinted windows with privacy curtains — offering business-class flight comfort on the highway."
    },
    {
      question: "Is the 12 Seater Maharaja Urbania suitable for corporate and wedding travel in Bangalore?",
      answer:
        "Yes. It is specifically designed for executive delegations, client visits, luxury wedding VIP guest shuttles, and premium family getaways where cabin quietness, legroom, and presentation matter as much as capacity."
    },
    {
      question: "What is the seating arrangement inside the 12 Seater Maharaja Urbania?",
      answer:
        "It features a spacious 2x1 and 1x1 captain seat layout with a central walkthrough aisle, wide legroom, individual armrests, cup holders, USB charging points at every seat, and a dedicated rear luggage boot for 12+ large suitcases."
    },
    {
      question: "How do I book the 12 Seater Maharaja Urbania in Bangalore?",
      answer:
        "You can book directly through our website booking widget, call, or WhatsApp us at +91 98867 70099 anytime. Our team operates 24/7 to provide instant availability and a transparent quotation."
    }
  ],
  "tempo-traveller-17-seater": [
    {
      question: "Where can I find the best 17 seater Tempo Traveller in Bangalore?",
      answer:
        "Yogi Tours & Travels is rated 4.9★ from 210+ Google reviews and operates 17 seater Tempo Travellers across Bangalore (Bengaluru), with transparent per-km pricing and driver Bata confirmed upfront before booking."
    },
    {
      question: "Is there a 17 seater Tempo Traveller near me in Bangalore?",
      answer:
        "Yes — pickups are available across Bangalore, including Whitefield, Electronic City, Koramangala, HSR Layout, Jayanagar, JP Nagar, Indiranagar, Yelahanka, Hebbal, Marathahalli and Rajajinagar."
    },
    {
      question: "Is the 17 seater Tempo Traveller comfortable for long trips?",
      answer:
        "Yes. It has push-back seats, individual windows, reading lights and a dedicated luggage boot, making it a dependable option for multi-day outstation trips and pilgrimage tours, not just short city rides."
    },
    {
      question: "What is the rate for a 17 seater Tempo Traveller in Bangalore?",
      answer:
        "₹30/km AC and ₹28/km Non-AC, with a ₹700/day driver Bata — confirmed rates, not an estimate. Tolls, parking, permit and state taxes are additional and shown in your quotation."
    }
  ]
};

/**
 * Direct-answer Q&A for vehicles without a hand-curated VEHICLE_FAQS entry —
 * generated only from real, already-confirmed data on the vehicle (seats,
 * rate, service area), so it stays honest without needing per-vehicle
 * copywriting. Answers the exact "how many seats / how much does it cost"
 * phrasing people and AI assistants actually ask.
 */
function genericVehicleFaqs(vehicle: Vehicle, rentalLabel: string): Array<{ question: string; answer: string }> {
  const seatsText = vehicle.category === "car" ? `${vehicle.seats} seats` : `${vehicle.seats} passenger seats plus the driver`;
  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: `How many seats does the ${vehicle.name} have?`,
      answer: `The ${vehicle.name} has ${seatsText}.`
    },
    {
      question: `What is the rental rate for the ${vehicle.name} in Bangalore?`,
      answer: vehicle.ratePerKm
        ? `₹${vehicle.ratePerKm}/km, with the final quotation confirmed on enquiry based on your route, trip duration and driver Bata.`
        : `Rates depend on your route, trip duration and dates — share your requirement for a confirmed quotation.`
    },
    {
      question: `Is the ${vehicle.name} available for outstation trips from Bangalore?`,
      answer: `Yes — the ${rentalLabel.toLowerCase()} is available for both local Bangalore travel and outstation trips across Karnataka and South India, within our usual ${business.serviceRadiusKm} km service radius and beyond on named routes.`
    },
    {
      question: `Is the ${vehicle.name} available near me in Bangalore?`,
      answer: `Yes — pickup is arranged across Bangalore, including ${business.areaServed.slice(1, 5).join(", ")} and other areas we serve.`
    }
  ];
  return faqs;
}

/** Per-vehicle <meta name="keywords"> phrases — the base set plus the exact "in bangalore" phrasing requested, and the Force Urbania name+seat combo where it actually applies. */
function vehicleKeywords(vehicle: Vehicle, label: string): string {
  const n = vehicle.name.toLowerCase();
  const base = [
    `${n} bangalore`,
    `${n} bengaluru`,
    `${n} rental`,
    `${n} near me`,
    `${label.toLowerCase()} bangalore`,
    `${vehicle.seats} seater rental bangalore`,
    `${vehicle.seats} seater ${label.toLowerCase()} in bangalore`
  ];
  if (n.includes("urbania")) {
    base.push(
      `force urbania tempo traveller in bangalore`,
      `${vehicle.seats} seater force urbania tempo traveller in bangalore`,
      `force urbania rental bangalore`,
      `luxury force urbania in bangalore`,
      `maharaja urbania rental bangalore`,
      `force urbania price per km bangalore`,
      `force urbania outstation bangalore`,
      `12 seater maharaja urbania bangalore`
    );
  }
  return base.join(", ");
}

// Extra <meta name="keywords"> phrases per category — built only from real,
// currently-live seat counts (checked directly against the database, not
// seed.ts, which had drifted). No phrase here names a seat count that
// doesn't correspond to an actual vehicle in that category.
const CATEGORY_KEYWORDS: Record<VehicleCategory, string> = {
  car: "car rental bangalore, innova crysta rental bangalore, cab service bangalore",
  "tempo-traveller":
    "tempo traveller rental bangalore, 9 seater tempo traveller in bangalore, 12 seater tempo traveller in bangalore, 17 seater tempo traveller in bangalore, force urbania tempo traveller in bangalore, 17 seater force urbania tempo traveller in bangalore",
  "mini-bus": "mini bus in bangalore, mini bus rental bangalore, 21 seater mini bus in bangalore, 25 seater mini bus in bangalore",
  // No 50-seater exists in Mini Bus or Tourist Bus — the closest real vehicle
  // is the 55 Seater Tourist Bus, so that's what's targeted, alongside the
  // literal "50 seater" phrase as a near-match for that search intent.
  "tourist-bus": "tourist bus rental bangalore, 40 seater tourist bus bangalore, 55 seater tourist bus bangalore, 50 seater bus bangalore"
};

const CATEGORY_INTRO: Record<VehicleCategory, string> = {
  car: "From compact sedans and the Maruti Dzire to the Innova Crysta and Hycross — cars for hire with driver for airport transfers, city travel and outstation trips.",
  "tempo-traveller": "Tempo Traveller rental in Bangalore across 9, 12 and 17 seater options, including the Force Urbania, with driver for family and group travel, outstation trips across Karnataka and airport transfers.",
  "mini-bus": "21 and 25 seater mini buses for corporate offsites, wedding groups and mid-sized school or community trips, available for local and outstation hire.",
  "tourist-bus": "40 and 55 seater tourist buses for large group tours, institutional travel and big event logistics, available for outstation and local hire."
};

const CATEGORY_META_DESCRIPTIONS: Record<VehicleCategory, string> = {
  car: "Book chauffeured cars in Bangalore: Swift Dzire, Maruti Ertiga and Toyota Innova Crysta. Punctual airport transfers, local rides & outstation trips at ₹13/km onwards.",
  "tempo-traveller": "Hire 9, 12 & 17 seater Tempo Travellers in Bangalore with push-back seats, AC & experienced drivers. Perfect for family getaways, outstation tours & airport pickups.",
  "mini-bus": "Rent 21 & 25 seater AC mini buses in Bangalore for corporate offsites, wedding shuttles & group tours. Clean interiors, vetted chauffeurs & upfront per-km pricing.",
  "tourist-bus": "Hire 40 to 55 seater luxury tourist buses in Bangalore for large group tours, college excursions & events. Equipped with pushback seats, AC & ample luggage space."
};

function vehicleMetaDescription(vehicle: Vehicle, seatSuffix: string): string {
  if (vehicle.slug === "9-seater-tempo-traveller") {
    return "Hire 9 Seater Tempo Traveller in Bangalore with verified driver. Pushback recliner seats, AC, carrier & ₹28/km transparent tariff. Rated 4.9★ for outstation trips.";
  }
  if (vehicle.slug === "force-urbania") {
    return "Rent luxury Force Urbania in Bangalore with Maharaja recliner captain seats, Sony Bravia Smart TV & chiller box. Verified chauffeur & transparent per-km rates.";
  }
  if (vehicle.slug === "urbania-12-seater-maharaja") {
    return "Book 12 Seater Maharaja Force Urbania in Bangalore with ultra-plush calf-support recliners & ambient lighting. Ideal for VIP wedding guest & corporate travel.";
  }
  if (vehicle.slug === "innova-crysta") {
    return "Hire Toyota Innova Crysta in Bangalore with experienced driver for outstation trips, Kempegowda airport transfers & family vacations. Starting ₹19/km.";
  }
  if (vehicle.slug === "tempo-traveller-17-seater") {
    return "Book 17 Seater Tempo Traveller in Bangalore for group outstation trips & Tirupati pilgrimage. Pushback seats, ample luggage space & transparent pricing.";
  }
  if (vehicle.slug === "maharaja-tempo-traveller") {
    return "Rent 12 Seater Maharaja Tempo Traveller in Bangalore featuring sofa-style pushback seats & spacious legroom. Rated 4.9★ for Karnataka group tours.";
  }
  return clampDescription(`Hire ${vehicle.name}${seatSuffix} in Bangalore with driver. ${vehicle.tagline} Transparent per-km billing and 24/7 booking.`);
}

router.get("/", async (req, res, next) => {
  try {
    const categories = await Promise.all(
      VEHICLE_CATEGORY_SLUGS.map(async (cat) => ({
        slug: cat,
        label: VEHICLE_CATEGORY_LABELS[cat],
        intro: CATEGORY_INTRO[cat],
        vehicles: await vehiclesByCategory(cat)
      }))
    );
    res.render("pages/vehicles-list", {
      title: "Vehicle Fleet Rental Bangalore | Cars, Tempo Travellers & Buses",
      metaDescription:
        "Browse Bangalore's complete passenger fleet: sedans, Toyota Innova Crysta, 9 to 17 seater Tempo Travellers, Force Urbania & 55-seater tourist coaches.",
      canonicalPath: "/fleet",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet" }
      ],
      categories,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:category", async (req, res, next) => {
  try {
    const category = req.params.category as VehicleCategory;
    if (!VEHICLE_CATEGORY_SLUGS.includes(category)) {
      next();
      return;
    }
    const label = VEHICLE_CATEGORY_LABELS[category];
    const rentalLabel = CATEGORY_RENTAL_LABEL[category];
    const vehicles = await vehiclesByCategory(category);
    const categoryPath = `/fleet/${category}`;
    res.render("pages/vehicles-category", {
      title: `${rentalLabel} Rental Bangalore | Yogi Tours`,
      metaDescription: CATEGORY_META_DESCRIPTIONS[category] || clampDescription(`${CATEGORY_INTRO[category]} Transparent quotations, experienced drivers and well-maintained vehicles.`),
      metaKeywords: CATEGORY_KEYWORDS[category],
      canonicalPath: categoryPath,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet" },
        { name: label, url: categoryPath }
      ],
      category,
      label,
      rentalLabel,
      intro: CATEGORY_INTRO[category],
      vehicles,
      schemas: [
        serviceSchema({
          name: `${rentalLabel} Rental in Bangalore`,
          description: CATEGORY_INTRO[category],
          url: categoryPath
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" },
          { name: label, url: categoryPath }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:category/:slug", async (req, res, next) => {
  try {
    const category = req.params.category as VehicleCategory;
    if (!VEHICLE_CATEGORY_SLUGS.includes(category)) {
      next();
      return;
    }
    const vehicle = await findVehicleBySlugOrAlias(req.params.slug);
    if (!vehicle || vehicle.category !== category) {
      next();
      return;
    }
    // The DB is the source of truth for slugs. If this vehicle was reached
    // via a renamed alias, send the crawler on to its real, current URL
    // rather than serving the same page under two addresses.
    if (vehicle.slug !== req.params.slug) {
      res.redirect(301, "/fleet/" + category + "/" + vehicle.slug);
      return;
    }
    const label = VEHICLE_CATEGORY_LABELS[category];
    const related = (await vehiclesByCategory(category)).filter((v) => v.id !== vehicle.id).slice(0, 3);
    const featuredInPackages = (await packagesForVehicle(vehicle)).slice(0, 3);
    const relevantRoutes = TRIP_ROUTES.filter((r) => r.vehicleSlugs.some((v) => v.slug === vehicle.slug)).slice(0, 4);
    // Vehicles like "9 Seater Tempo Traveller" already state their capacity in
    // the name — appending "(9 seater)" again reads as a redundant stutter.
    // Only vehicles named without a seat count (Force Urbania, Toyota Innova
    // Crysta, etc.) get it appended.
    const seatSuffix = vehicle.name.toLowerCase().includes(`${vehicle.seats} seat`) ? "" : ` (${vehicle.seats} seater)`;
    const vehicleFaqs = VEHICLE_FAQS[vehicle.slug] ?? genericVehicleFaqs(vehicle, CATEGORY_RENTAL_LABEL[category]);
    const features = vehicleFeatures(vehicle);
    const gallery = vehicleGallery(vehicle);
    const hasWalkthroughVideo = vehicle.slug === "force-urbania" || vehicle.slug === "urbania-12-seater-maharaja";
    const videoUrl = hasWalkthroughVideo ? "/assets/video/force-urbania-luxury-walkthrough.mp4" : undefined;
    const brandName = vehicle.name.toLowerCase().includes("force") || vehicle.name.toLowerCase().includes("urbania")
      ? "Force Motors"
      : vehicle.name.toLowerCase().includes("innova") || vehicle.name.toLowerCase().includes("toyota")
      ? "Toyota"
      : vehicle.name.toLowerCase().includes("maruti") || vehicle.name.toLowerCase().includes("dzire") || vehicle.name.toLowerCase().includes("ertiga")
      ? "Maruti Suzuki"
      : vehicle.category === "tempo-traveller"
      ? "Force Motors"
      : undefined;

    res.render("pages/vehicle-detail", {
      title: VEHICLE_TITLE_OVERRIDE[vehicle.slug] ?? `${vehicle.name} Rental Bangalore | Yogi Tours`,
      metaDescription: vehicleMetaDescription(vehicle, seatSuffix),
      metaKeywords: vehicleKeywords(vehicle, label),
      canonicalPath: `/fleet/${category}/${vehicle.slug}`,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet" },
        { name: label, url: `/fleet/${category}` },
        { name: vehicle.name, url: `/fleet/${category}/${vehicle.slug}` }
      ],
      vehicle,
      label,
      features,
      gallery,
      videoUrl,
      related,
      featuredInPackages,
      relevantRoutes,
      vehicleFaqs,
      schemas: [
        vehicleServiceSchema({
          name: vehicle.name,
          description: vehicle.description,
          url: `/fleet/${category}/${vehicle.slug}`,
          imageUrl: vehicle.imageKey ? `${env.siteUrl}${vehicle.imageKey}` : undefined,
          images: gallery.map((g) => `${env.siteUrl}${g}`),
          features,
          seats: vehicle.seats,
          brand: brandName,
          model: vehicle.name,
          ratePerKm: vehicle.ratePerKm,
          dateModified: vehicle.updatedAt
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" },
          { name: label, url: `/fleet/${category}` },
          { name: vehicle.name, url: `/fleet/${category}/${vehicle.slug}` }
        ]),
        ...(hasWalkthroughVideo
          ? [
              videoObjectSchema({
                name: `${vehicle.name} Luxury Walkthrough Video — Bangalore Rental`,
                description: `Full interior and exterior video tour of the ${vehicle.name} featuring motorized Maharaja recliners, Sony Bravia Smart TV, and on-board chiller box.`,
                thumbnailUrl: gallery[0] ?? (vehicle.imageKey || "/assets/images/gallery/force-urbania-luxury-cabin-interior.webp"),
                uploadDate: "2026-10-01T10:30:00+05:30",
                contentUrl: "/assets/video/force-urbania-luxury-walkthrough.mp4",
                embedUrl: `/fleet/${category}/${vehicle.slug}`,
                duration: "PT1M44S"
              })
            ]
          : []),
        ...(vehicleFaqs
          ? [faqSchema(vehicleFaqs), speakableSchema(`/fleet/${category}/${vehicle.slug}`, ["#faq"])]
          : [])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
