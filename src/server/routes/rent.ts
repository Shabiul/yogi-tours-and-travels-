import { Router } from "express";
import {
  PSEO_VEHICLES,
  PSEO_ORIGINS,
  PSEO_DESTINATIONS,
  findPseoVehicle,
  findPseoOrigin,
  findPseoDestination,
  parseRouteSlug,
  resolvePseoRoute,
  generatePseoFaqs,
  calculateRouteMetrics,
  type PseoVehicle,
  type PseoOrigin,
  type PseoDestination,
  type ResolvedPseoRoute
} from "../config/pseoData.js";
import { findVehicleBySlugOrAlias, vehicleGallery } from "../db/content.js";
import { dutyTariff } from "../db/pricing.js";
import {
  breadcrumbSchema,
  touristTripSchema,
  faqSchema,
  speakableSchema,
  imageObjectSchema
} from "../utils/schema.js";

export const rentRouter = Router();

// General hub FAQs for the /rent directory
const HUB_FAQS = [
  {
    question: "How does doorstep pickup work for outstation trips in Bangalore?",
    answer:
      "Yogi Tours & Travels provides 100% confirmed doorstep pickup from any apartment, gated community, tech park, or hotel across Bangalore — including Whitefield, Electronic City, Koramangala, Indiranagar, Hebbal, and Kempegowda Airport (BLR). Your assigned vehicle and chauffeur arrive at your preferred departure time."
  },
  {
    question: "What vehicles are available for outstation rental?",
    answer:
      "Our fleet includes sedans (Swift Dzire), family MUVs & SUVs (Maruti Ertiga, Toyota Innova, Innova Crysta, Innova Hycross, Fortuner), premium group vans (Force Urbania, Urbania 12-Seater Maharaja, 9/12/17-Seater Tempo Travellers), and heavy coaches (21/25-Seater Mini Buses, 40/55-Seater Tourist Coaches)."
  },
  {
    question: "Are toll charges, state permits, and driver Bata included in the tariff?",
    answer:
      "We provide completely transparent itemized billing. The base per-km rate and driver Bata are fixed up front. Interstate permit charges (for Tamil Nadu, Kerala, Andhra Pradesh, Goa) and highway tolls can either be all-inclusive or charged as actuals, documented clearly in your quotation with GST invoice."
  },
  {
    question: "Can I book a one-way outstation drop from Bangalore?",
    answer:
      "Yes, we operate one-way drops as well as round trips and multi-day holiday circuits from Bangalore to Coorg, Mysore, Ooty, Wayanad, Tirupati, Chennai, Pondicherry, and all major cities."
  }
];

// Top 24 high-intent combinations featured on the directory hub
function getFeaturedCombinations() {
  const topCombos = [
    { v: "innova-crysta", o: "whitefield", d: "coorg" },
    { v: "force-urbania", o: "koramangala", d: "ooty" },
    { v: "urbania-12-seater-maharaja", o: "indiranagar", d: "wayanad" },
    { v: "12-seater-tempo", o: "electronic-city", d: "mysore" },
    { v: "swift-dzire", o: "bangalore-city", d: "tirupati" },
    { v: "ertiga", o: "hebbal", d: "chikmagalur" },
    { v: "innova-hycross", o: "kempegowda-airport", d: "coorg" },
    { v: "fortuner", o: "jayanagar", d: "sakleshpur" },
    { v: "17-seater-tempo", o: "whitefield", d: "pondicherry" },
    { v: "25-seater-mini-bus", o: "electronic-city", d: "goa" },
    { v: "40-seater-tourist-bus", o: "bangalore-city", d: "hampi" },
    { v: "9-seater-tempo", o: "marathahalli", d: "kabini" },
    { v: "innova-crysta", o: "yelahanka", d: "lepakshi" },
    { v: "force-urbania", o: "electronic-city", d: "coorg" },
    { v: "swift-dzire", o: "hebbal", d: "nandi-hills" },
    { v: "12-seater-tempo", o: "whitefield", d: "tirupati" },
    { v: "innova-crysta", o: "koramangala", d: "gokarna" },
    { v: "urbania-12-seater-maharaja", o: "bangalore-city", d: "mysore" },
    { v: "ertiga", o: "indiranagar", d: "br-hills" },
    { v: "17-seater-tempo", o: "hebbal", d: "ooty" },
    { v: "21-seater-mini-bus", o: "whitefield", d: "chikmagalur" },
    { v: "innova-hycross", o: "koramangala", d: "chennai" },
    { v: "swift-dzire", o: "electronic-city", d: "shivanasamudra" },
    { v: "55-seater-tourist-bus", o: "bangalore-city", d: "tirupati" }
  ];

  return topCombos
    .map((c) => resolvePseoRoute(c.v, c.o, c.d))
    .filter((r): r is ResolvedPseoRoute => r !== null);
}

/**
 * GET /rent — Master Directory Hub
 */
rentRouter.get("/", (req, res) => {
  const featured = getFeaturedCombinations();
  const canonicalPath = "/rent";

  res.render("pages/rent-hub", {
    title: "Outstation Vehicle Rentals from Bangalore | Cabs, Tempo Travellers & Luxury Buses",
    metaDescription:
      "Book outstation cabs, Force Urbania, Maharaja Tempo Travellers and luxury coaches from all Bangalore localities to Coorg, Mysore, Ooty, Wayanad, Tirupati & 50+ destinations.",
    canonicalPath,
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Outstation Rentals", url: canonicalPath }
    ],
    vehicles: PSEO_VEHICLES,
    origins: PSEO_ORIGINS,
    destinations: PSEO_DESTINATIONS,
    featuredRoutes: featured,
    activeVehicle: null,
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Outstation Rentals", url: canonicalPath }
      ]),
      touristTripSchema({
        name: "Outstation Vehicle Rental Service from Bangalore",
        description:
          "Point-to-point and round-trip vehicle hire from all Bangalore localities to Karnataka, Tamil Nadu, Kerala, Andhra Pradesh & Goa destinations.",
        url: canonicalPath,
        duration: "Flexible day & multi-day tours"
      }),
      faqSchema(HUB_FAQS)
    ]
  });
});

/**
 * GET /rent/:vehicleSlug — Dedicated vehicle hub (e.g. /rent/force-urbania)
 */
rentRouter.get("/:vehicleSlug", (req, res, next) => {
  const vehicle = findPseoVehicle(req.params.vehicleSlug);
  if (!vehicle) {
    // Might be something else or 404
    next();
    return;
  }

  // Pre-calculate top 12 popular outstation destinations for this vehicle
  const topDests = ["coorg", "mysore", "ooty", "wayanad", "tirupati", "chikmagalur", "goa", "pondicherry", "kabini", "sakleshpur", "hampi", "gokarna"];
  const defaultOrigin = PSEO_ORIGINS[0]!; // Bangalore City Central

  const vehicleRoutes = topDests
    .map((dSlug) => resolvePseoRoute(vehicle.slug, defaultOrigin.slug, dSlug))
    .filter((r): r is ResolvedPseoRoute => r !== null);

  const canonicalPath = `/rent/${vehicle.slug}`;

  res.render("pages/rent-hub", {
    title: `${vehicle.name} Rental from Bangalore | Outstation Hire | Yogi Tours`,
    metaDescription: `Rent ${vehicle.name} in Bangalore for outstation trips to Coorg, Mysore, Ooty, Wayanad & more. Transparent ₹${vehicle.ratePerKm || 18}/km pricing with verified chauffeurs.`,
    canonicalPath,
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Outstation Rentals", url: "/rent" },
      { name: `${vehicle.name} Rental`, url: canonicalPath }
    ],
    vehicles: PSEO_VEHICLES,
    origins: PSEO_ORIGINS,
    destinations: PSEO_DESTINATIONS,
    featuredRoutes: vehicleRoutes,
    activeVehicle: vehicle,
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Outstation Rentals", url: "/rent" },
        { name: `${vehicle.name} Rental`, url: canonicalPath }
      ]),
      touristTripSchema({
        name: `${vehicle.name} Outstation Rental Bangalore`,
        description: vehicle.highlight,
        url: canonicalPath,
        duration: "Outstation and day-trip options"
      }),
      faqSchema(HUB_FAQS)
    ]
  });
});

/**
 * GET /rent/:vehicleSlug/:routeSlug — Individual Zero-Cannibalization pSEO Landing Page
 * E.g. /rent/force-urbania/whitefield-to-coorg
 */
rentRouter.get("/:vehicleSlug/:routeSlug", async (req, res, next) => {
  try {
    const { vehicleSlug, routeSlug } = req.params;
    const parsed = parseRouteSlug(routeSlug);
    if (!parsed) {
      next();
      return;
    }

    const resolved = resolvePseoRoute(vehicleSlug, parsed.originSlug, parsed.destinationSlug);
    if (!resolved) {
      next();
      return;
    }

    // Try finding matching database vehicle for authentic uploaded photos and dynamic rates
    const dbVehicle = await findVehicleBySlugOrAlias(resolved.vehicle.dbSlug);
    const galleryPhotos = dbVehicle ? vehicleGallery(dbVehicle) : [];
    const tariff = dutyTariff(dbVehicle?.slug || resolved.vehicle.dbSlug);

    // Dynamic contextual FAQs
    const faqs = generatePseoFaqs(resolved);

    // Mesh links (Anti-cannibalization network):
    // 1. Same vehicle to 4 other popular destinations from this same origin
    const otherDestinations = PSEO_DESTINATIONS.filter((d) => d.slug !== resolved.destination.slug)
      .slice(0, 4)
      .map((d) => resolvePseoRoute(resolved.vehicle.slug, resolved.origin.slug, d.slug))
      .filter((r): r is ResolvedPseoRoute => r !== null);

    // 2. 4 Alternative vehicles for this exact route
    const altVehicles = PSEO_VEHICLES.filter((v) => v.slug !== resolved.vehicle.slug)
      .slice(0, 4)
      .map((v) => resolvePseoRoute(v.slug, resolved.origin.slug, resolved.destination.slug))
      .filter((r): r is ResolvedPseoRoute => r !== null);

    // 3. 4 Other popular destinations departing from this origin locality
    const otherLocalRoutes = PSEO_DESTINATIONS.filter(
      (d) => d.slug !== resolved.destination.slug && !otherDestinations.some((od) => od.destination.slug === d.slug)
    )
      .slice(0, 4)
      .map((d) => resolvePseoRoute("innova-crysta", resolved.origin.slug, d.slug))
      .filter((r): r is ResolvedPseoRoute => r !== null);

    // Compile structured schemas
    const schemas: Array<Record<string, unknown>> = [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Outstation Rentals", url: "/rent" },
        { name: `${resolved.vehicle.name} Rental`, url: `/rent/${resolved.vehicle.slug}` },
        { name: `${resolved.origin.name} to ${resolved.destination.name}`, url: resolved.canonicalPath }
      ]),
      touristTripSchema({
        name: resolved.primaryKeyword,
        description: resolved.uniqueRouteHook,
        url: resolved.canonicalPath,
        duration: resolved.driveTimeHours
      }),
      faqSchema(faqs),
      speakableSchema(resolved.canonicalPath, ["#route-hook", "#faq", "#pickup-logistics"])
    ];

    const displayPhoto = dbVehicle?.imageKey || resolved.vehicle.imageKey;
    if (displayPhoto) {
      schemas.push(
        imageObjectSchema({
          url: displayPhoto,
          caption: `${resolved.vehicle.name} for hire from ${resolved.origin.name} to ${resolved.destination.name}`,
          name: `${resolved.vehicle.name} Rental Bangalore`
        })
      );
    }

    res.render("pages/rent-detail", {
      title: resolved.metaTitle,
      metaDescription: resolved.metaDescription,
      canonicalPath: resolved.canonicalPath,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Outstation Rentals", url: "/rent" },
        { name: `${resolved.vehicle.name} Rental`, url: `/rent/${resolved.vehicle.slug}` },
        { name: `${resolved.origin.name} to ${resolved.destination.name}`, url: resolved.canonicalPath }
      ],
      resolved,
      dbVehicle,
      galleryPhotos,
      tariff,
      faqs,
      otherDestinations,
      altVehicles,
      otherLocalRoutes,
      schemas
    });
  } catch (err) {
    next(err);
  }
});
