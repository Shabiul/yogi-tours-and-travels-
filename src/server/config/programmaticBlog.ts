import {
  PSEO_VEHICLES,
  PSEO_ORIGINS,
  PSEO_DESTINATIONS,
  findPseoVehicle,
  findPseoOrigin,
  findPseoDestination,
  calculateRouteMetrics,
  generatePseoHook,
  type PseoVehicle,
  type PseoOrigin,
  type PseoDestination
} from "./pseoData.js";
import { dutyTariff } from "../db/pricing.js";

export interface ProgrammaticCostPost {
  slug: string;
  vehicle: PseoVehicle;
  origin: PseoOrigin;
  destination: PseoDestination;
  distanceKm: number;
  driveTime: string;
  roundTripKm: number;
  durationDays: number;
  baseFare: number;
  driverBata: number;
  tollEstimate: number;
  statePermitEstimate: number;
  totalCost: number;
  directAnswerAio: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  uniqueRouteHook: string;
  enRouteStops: Array<{ name: string; type: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  moneyPageUrl: string;
}

export interface ProgrammaticComparePost {
  slug: string;
  vehicleA: PseoVehicle;
  vehicleB: PseoVehicle;
  origin: PseoOrigin;
  destination: PseoDestination;
  distanceKm: number;
  driveTime: string;
  fareA: number;
  fareB: number;
  costDifference: number;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  directAnswerAio: string;
  verdict: string;
  comparisonPoints: Array<{
    feature: string;
    vehicleAValue: string;
    vehicleBValue: string;
    winner: "A" | "B" | "Tie";
    rationale: string;
  }>;
  faqs: Array<{ question: string; answer: string }>;
  moneyUrlA: string;
  moneyUrlB: string;
}

export interface ProgrammaticItineraryPost {
  slug: string;
  origin: PseoOrigin;
  destination: PseoDestination;
  vehicle: PseoVehicle;
  distanceKm: number;
  driveTime: string;
  days: number;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  directAnswerAio: string;
  trafficAdvice: string;
  timeline: Array<{ day: number; title: string; activities: string[] }>;
  budgetSummary: {
    vehicleRent: number;
    fuelAndDriver: number;
    tollsAndEntry: number;
    totalPerGroup: number;
  };
  faqs: Array<{ question: string; answer: string }>;
  moneyPageUrl: string;
}

// Toll & state border tax heuristics based on highway & target state
function calculateTollAndPermit(destination: PseoDestination): { toll: number; permit: number } {
  let toll = 450;
  let permit = 0;

  if (destination.state !== "Karnataka") {
    // Interstate commercial permit charge
    if (destination.state === "Tamil Nadu") permit = 1200;
    else if (destination.state === "Kerala") permit = 1600;
    else if (destination.state === "Andhra Pradesh") permit = 1400;
    else if (destination.state === "Goa") permit = 1800;
    else permit = 1500;
  }

  // Major multi-toll expressways
  if (destination.highway.includes("Expressway") || destination.baseDistanceKm > 300) {
    toll = Math.round(destination.baseDistanceKm * 1.8);
  }

  return { toll, permit };
}

// En-route stop curator
function getEnRouteStops(destination: PseoDestination): Array<{ name: string; type: string; description: string }> {
  if (destination.slug === "coorg" || destination.slug === "madikeri") {
    return [
      { name: "Bidadi / Maddur", type: "Breakfast & Refreshment", description: "Famed stop for hot Maddur Vada and Filter Coffee along the expressway." },
      { name: "Bylakuppe Golden Temple (Namdroling)", type: "Sightseeing", description: "Spectacular Tibetan monastery adorned with 40-foot gilded Buddha statues." },
      { name: "Kaveri Nisargadhama", type: "Nature & Bamboo Park", description: "Lush island ecological reserve on the Cauvery River with deer park and hanging bridge." }
    ];
  }
  if (destination.slug === "ooty") {
    return [
      { name: "Channapatna Craft Village", type: "Culture Stop", description: "Historic wooden toy artisan workshops along the Bangalore-Mysore corridor." },
      { name: "Bandipur National Park Corridor", type: "Wildlife Transit", description: "Scenic forest highway pass with high chances of elephant and spotted deer sightings." },
      { name: "Pykara Waterfalls & Lake", type: "Scenic Viewpoint", description: "Pristine Nilgiri lake surrounded by shola pine woods ideal for quick boat safaris." }
    ];
  }
  if (destination.slug === "mysore") {
    return [
      { name: "Ramanagara Silk Cocoon Market", type: "Culture Stop", description: "Asia's largest silk cocoon hub set against the rocky Sholay granite hills." },
      { name: "Srirangapatna Fort & Temple", type: "Heritage", description: "Historic river island fortress of Tipu Sultan and Ranganathaswamy Temple." },
      { name: "Chamundi Hill Viewpoint", type: "Panoramic City View", description: "1,000-meter vantage point overlooking the entire Mysore royal palace basin." }
    ];
  }
  if (destination.slug === "wayanad") {
    return [
      { name: "Gundlupet Sunflower Fields", type: "Photo Stop", description: "Vibrant yellow floral landscapes blooming along the Kerala-Karnataka border." },
      { name: "Muthanga Wildlife Sanctuary", type: "Rainforest Gateway", description: "Dense elephant reserve marking the entry into Kerala's Western Ghats." },
      { name: "Lakkidi View Point", type: "Mountain Vista", description: "High-altitude mountain pass offering misty panoramic views of the Thamarassery Churam ghat." }
    ];
  }
  if (destination.slug === "tirupati") {
    return [
      { name: "Woodcote / Kolar Cafe", type: "Breakfast Stop", description: "Quick highway drive-in known for crisp dosas and fresh South Indian coffee on NH69." },
      { name: "Mulbagal Someshwara Temple", type: "Heritage", description: "Ancient Chola architectural shrine nestled along the highway bypass." },
      { name: "Chandragiri Fort", type: "Historic Fortress", description: "11th-century Vijayanagara royal palace situated just 15 km before Tirupati foothills." }
    ];
  }
  if (destination.slug === "chikmagalur") {
    return [
      { name: "Kunigal Stud Farm", type: "Heritage", description: "Historic thoroughbred horse breeding grounds dating back to Tipu Sultan." },
      { name: "Yagachi Water Sports Hub (Belur)", type: "Adventure", description: "Lake reservoir offering jet skiing, banana boat rides, and kayak tours." },
      { name: "Belur Chennakeshava Temple", type: "UNESCO Candidate", description: "Intricately carved 12th-century Hoysala soapstone temple marvel." }
    ];
  }

  // Default fallback stops based on destination keyStops
  const rawStops = destination.keyStops.split(",");
  return rawStops.slice(0, 3).map((s, i) => ({
    name: s.trim(),
    type: i === 0 ? "Highway Stop" : i === 1 ? "Scenic Attraction" : "Cultural Landmark",
    description: `Popular transit stop along ${destination.highway} before reaching ${destination.name}.`
  }));
}

/**
 * Resolves a programmatic Cost & Budget Breakdown post
 * Slugs match: "bangalore-to-coorg-innova-crysta" or "whitefield-to-coorg-innova-crysta"
 */
export function resolveCostPost(slug: string): ProgrammaticCostPost | null {
  // Pattern: {origin}-to-{destination}-{vehicle} OR {destination}-{vehicle}
  // Try matching all vehicle slugs at end of string
  const sortedVehicles = [...PSEO_VEHICLES].sort((a, b) => b.slug.length - a.slug.length);
  let matchedVehicle: PseoVehicle | undefined;
  let remaining = slug;

  for (const v of sortedVehicles) {
    if (remaining.endsWith(`-${v.slug}`)) {
      matchedVehicle = v;
      remaining = remaining.slice(0, -(v.slug.length + 1));
      break;
    }
  }

  if (!matchedVehicle) return null;

  // Now remaining is either "{origin}-to-{destination}" or "bangalore-to-{destination}" or "{destination}"
  let matchedOrigin: PseoOrigin | undefined;
  let matchedDest: PseoDestination | undefined;

  if (remaining.includes("-to-")) {
    const parts = remaining.split("-to-");
    matchedOrigin = findPseoOrigin(parts[0]!) || PSEO_ORIGINS[0]!;
    matchedDest = findPseoDestination(parts[1]!);
  } else {
    matchedOrigin = PSEO_ORIGINS[0]!; // Default to central Bangalore
    matchedDest = findPseoDestination(remaining);
  }

  if (!matchedDest) return null;

  const metrics = calculateRouteMetrics(matchedOrigin, matchedDest);
  const rate = matchedVehicle.ratePerKm || 18;
  const tariff = dutyTariff(matchedVehicle.dbSlug);
  const minKmPerDay = tariff?.minKmPerDay || 300;
  const bataPerDay = tariff?.driverBata || 400;

  // Approximate trip duration based on distance
  const durationDays = metrics.distanceKm <= 150 ? 1 : metrics.distanceKm <= 350 ? 2 : 3;
  const billedKm = Math.max(metrics.distanceKm * 2, minKmPerDay * durationDays);
  const baseFare = billedKm * rate;
  const totalBata = bataPerDay * durationDays;
  const { toll, permit } = calculateTollAndPermit(matchedDest);
  const totalCost = baseFare + totalBata + toll + permit;

  const roundTripKm = metrics.distanceKm * 2;
  const primaryKeyword = `${matchedVehicle.name} cost from ${matchedOrigin.name} to ${matchedDest.name}`;

  // Direct Answer Block (Google AI Overview / AIO optimized - concise, 45-50 words, numbers-first)
  const directAnswerAio = `The estimated total cost to hire a ${matchedVehicle.name} from ${matchedOrigin.name} to ${matchedDest.name} is approximately ₹${totalCost.toLocaleString("en-IN")} for a ${durationDays}-day round trip (${roundTripKm} km). This includes ₹${baseFare.toLocaleString("en-IN")} base running fare (at ₹${rate}/km), ₹${totalBata.toLocaleString("en-IN")} driver Bata, and estimated toll/state permits.`;

  const h1 = `${matchedVehicle.name} Bangalore to ${matchedDest.name} Fare & Cost Breakdown (2026)`;
  const metaTitle = `${matchedVehicle.name} to ${matchedDest.name} Cost: ₹${totalCost.toLocaleString("en-IN")} | Fare Guide`.slice(0, 60);
  const metaDescription = `Complete cost guide for ${matchedVehicle.name} from Bangalore to ${matchedDest.name}. Base fare: ₹${rate}/km, tolls, driver Bata & total ₹${totalCost.toLocaleString("en-IN")} breakdown.`.slice(0, 155);

  const canonicalPath = `/blog/cost/${slug}`;
  const moneyPageUrl = `/rent/${matchedVehicle.slug}/${matchedOrigin.slug}-to-${matchedDest.slug}`;
  const uniqueRouteHook = generatePseoHook(matchedVehicle, matchedOrigin, matchedDest);
  const enRouteStops = getEnRouteStops(matchedDest);

  const faqs = [
    {
      question: `What is the total estimated fare for a ${matchedVehicle.name} to ${matchedDest.name}?`,
      answer: directAnswerAio
    },
    {
      question: `Are highway toll taxes and driver Bata included in the ₹${rate}/km base rate?`,
      answer: `No, standard Indian transport regulations bill tolls and interstate permits at actuals. Chauffeur Bata is ₹${bataPerDay}/day for local duty (6:00 AM to 10:00 PM). All line items are itemized transparently in your Yogi Tours quotation.`
    },
    {
      question: `How does the ${matchedVehicle.name} perform on the road to ${matchedDest.name}?`,
      answer: uniqueRouteHook
    }
  ];

  return {
    slug,
    vehicle: matchedVehicle,
    origin: matchedOrigin,
    destination: matchedDest,
    distanceKm: metrics.distanceKm,
    driveTime: metrics.driveTimeFormatted,
    roundTripKm,
    durationDays,
    baseFare,
    driverBata: totalBata,
    tollEstimate: toll,
    statePermitEstimate: permit,
    totalCost,
    directAnswerAio,
    h1,
    metaTitle,
    metaDescription,
    canonicalPath,
    uniqueRouteHook,
    enRouteStops,
    faqs,
    moneyPageUrl
  };
}

/**
 * Resolves a programmatic Vehicle Comparison post
 * E.g. "force-urbania-vs-innova-crysta-for-coorg" or "ertiga-vs-innova-crysta-for-ooty"
 */
export function resolveComparePost(slug: string): ProgrammaticComparePost | null {
  // Pattern: {vehicleA}-vs-{vehicleB}-for-{destination}
  const match = slug.match(/^([a-z0-9-]+)-vs-([a-z0-9-]+)-for-([a-z0-9-]+)$/);
  if (!match) return null;

  const [_, slugA, slugB, destSlug] = match;
  const vehicleA = findPseoVehicle(slugA!);
  const vehicleB = findPseoVehicle(slugB!);
  const destination = findPseoDestination(destSlug!);

  if (!vehicleA || !vehicleB || !destination) return null;

  const origin = PSEO_ORIGINS[0]!;
  const metrics = calculateRouteMetrics(origin, destination);
  const rateA = vehicleA.ratePerKm || 18;
  const rateB = vehicleB.ratePerKm || 18;
  const roundTripKm = metrics.distanceKm * 2;
  const fareA = roundTripKm * rateA;
  const fareB = roundTripKm * rateB;
  const costDifference = Math.abs(fareA - fareB);

  const h1 = `${vehicleA.name} vs ${vehicleB.name} for ${destination.name}: Which is Better? (2026 Guide)`;
  const metaTitle = `${vehicleA.name} vs ${vehicleB.name} for ${destination.name} | Comparison`.slice(0, 60);
  const metaDescription = `Comparing ${vehicleA.name} vs ${vehicleB.name} for ${destination.name}. Seating capacity, hill ride comfort, luggage space, and ₹${costDifference.toLocaleString("en-IN")} fare difference.`.slice(0, 155);

  const canonicalPath = `/blog/compare/${slug}`;
  const directAnswerAio = `For travel from Bangalore to ${destination.name} (${metrics.distanceKm} km), choose the ${vehicleA.name} if you have ${vehicleA.seats <= 7 ? "up to " + vehicleA.seats + " passengers seeking agility and lower fuel cost" : "a larger group of up to " + vehicleA.seats + " needing walkthrough space"}. The ${vehicleB.name} provides ${vehicleB.seats} seats with an estimated round-trip base fare of ₹${fareB.toLocaleString("en-IN")} compared to ₹${fareA.toLocaleString("en-IN")} for the ${vehicleA.name}.`;

  const verdict = vehicleA.seats > vehicleB.seats
    ? `If your travelling group has more than ${vehicleB.seats} members, the ${vehicleA.name} is the clear winner for passenger unity and per-person cost efficiency. For smaller VIP groups or couples, the ${vehicleB.name} offers nimbler highway cruising.`
    : `The ${vehicleB.name} is recommended for larger family cohorts, while the ${vehicleA.name} remains the champion of budget-friendly highway economy.`;

  const comparisonPoints = [
    {
      feature: "Seating Capacity",
      vehicleAValue: `${vehicleA.seats} Passengers`,
      vehicleBValue: `${vehicleB.seats} Passengers`,
      winner: (vehicleA.seats > vehicleB.seats ? "A" : "B") as "A" | "B",
      rationale: `${vehicleA.seats > vehicleB.seats ? vehicleA.name : vehicleB.name} accommodates larger families in a single cabin.`
    },
    {
      feature: "Outstation Base Tariff",
      vehicleAValue: `₹${rateA}/km (~₹${fareA.toLocaleString("en-IN")} total)`,
      vehicleBValue: `₹${rateB}/km (~₹${fareB.toLocaleString("en-IN")} total)`,
      winner: (rateA < rateB ? "A" : "B") as "A" | "B",
      rationale: `The ${rateA < rateB ? vehicleA.name : vehicleB.name} saves approximately ₹${costDifference.toLocaleString("en-IN")} on round-trip running costs.`
    },
    {
      feature: "Ghat & Mountain Curve Dynamics",
      vehicleAValue: vehicleA.terrainStrength,
      vehicleBValue: vehicleB.terrainStrength,
      winner: "Tie" as const,
      rationale: "Both vehicles are serviced with heavy-duty commercial suspension and hill-certified chauffeurs."
    },
    {
      feature: "Luggage Storage Space",
      vehicleAValue: vehicleA.luggage,
      vehicleBValue: vehicleB.luggage,
      winner: (vehicleA.category !== "car" ? "A" : "B") as "A" | "B",
      rationale: "Dedicated boot and roof-carrier arrangements ensure passenger legroom is never compromised."
    }
  ];

  const faqs = [
    {
      question: `Is the ${vehicleA.name} or ${vehicleB.name} more comfortable for the ${destination.name} route?`,
      answer: directAnswerAio
    },
    {
      question: `What is the price difference between renting ${vehicleA.name} and ${vehicleB.name}?`,
      answer: `For a Bangalore to ${destination.name} round-trip (~${roundTripKm} km), the base running fare difference is approximately ₹${costDifference.toLocaleString("en-IN")}. Total cost depends on trip duration and applicable driver Bata.`
    },
    {
      question: `Can both vehicles easily handle the ghat roads to ${destination.name}?`,
      answer: `Yes. Both the ${vehicleA.name} and ${vehicleB.name} in our fleet are piloted by chauffeurs with verified experience on South Indian ghat sections.`
    }
  ];

  return {
    slug,
    vehicleA,
    vehicleB,
    origin,
    destination,
    distanceKm: metrics.distanceKm,
    driveTime: metrics.driveTimeFormatted,
    fareA,
    fareB,
    costDifference,
    h1,
    metaTitle,
    metaDescription,
    canonicalPath,
    directAnswerAio,
    verdict,
    comparisonPoints,
    faqs,
    moneyUrlA: `/rent/${vehicleA.slug}/${origin.slug}-to-${destination.slug}`,
    moneyUrlB: `/rent/${vehicleB.slug}/${origin.slug}-to-${destination.slug}`
  };
}

/**
 * Resolves a programmatic Hyper-Local Itinerary post
 * E.g. "whitefield-to-coorg-weekend-trip" or "bangalore-to-coorg-3-day-trip"
 */
export function resolveItineraryPost(slug: string): ProgrammaticItineraryPost | null {
  // Pattern: {origin}-to-{destination}-weekend-trip OR {origin}-to-{destination}-{days}-day-trip
  let originSlug = "bangalore-city";
  let destSlug = "";
  let days = 2;

  const dayMatch = slug.match(/^(?:([a-z0-9-]+)-to-)?([a-z0-9-]+)-(\d+)-day-trip$/);
  const weekendMatch = slug.match(/^(?:([a-z0-9-]+)-to-)?([a-z0-9-]+)-weekend-trip$/);

  if (dayMatch) {
    originSlug = dayMatch[1] || "bangalore-city";
    destSlug = dayMatch[2]!;
    days = parseInt(dayMatch[3]!, 10) || 2;
  } else if (weekendMatch) {
    originSlug = weekendMatch[1] || "bangalore-city";
    destSlug = weekendMatch[2]!;
    days = 2;
  } else {
    return null;
  }

  const origin = findPseoOrigin(originSlug) || PSEO_ORIGINS[0]!;
  const destination = findPseoDestination(destSlug);
  if (!destination) return null;

  // Default optimal vehicle for this route
  const vehicle = PSEO_VEHICLES.find((v) => v.slug === "innova-crysta") || PSEO_VEHICLES[0]!;
  const metrics = calculateRouteMetrics(origin, destination);
  const rate = vehicle.ratePerKm || 19;
  const minKmPerDay = 300;
  const billedKm = Math.max(metrics.distanceKm * 2, minKmPerDay * days);
  const vehicleRent = billedKm * rate;
  const driverBata = 400 * days;
  const { toll } = calculateTollAndPermit(destination);
  const totalBudget = vehicleRent + driverBata + toll;

  const h1 = `${origin.name} to ${destination.name}: Perfect ${days}-Day Road Trip Itinerary (2026)`;
  const metaTitle = `${origin.name} to ${destination.name} ${days}-Day Itinerary & Plan`.slice(0, 60);
  const metaDescription = `Detailed ${days}-day road trip itinerary from ${origin.name} to ${destination.name}. Timing, stops, best vehicle, toll fees & complete ₹${totalBudget.toLocaleString("en-IN")} group budget.`.slice(0, 155);

  const directAnswerAio = `For a ${days}-day road trip from ${origin.name} to ${destination.name} (${metrics.distanceKm} km, ~${metrics.driveTimeFormatted}), depart before 6:00 AM to bypass Bangalore expressway tolls smoothly. Total estimated private cab budget in an Innova Crysta is ₹${totalBudget.toLocaleString("en-IN")} for the entire group, including driver Bata and tolls.`;

  const timeline = [
    {
      day: 1,
      title: `Departure from ${origin.name} & Scenic Ascent to ${destination.name}`,
      activities: [
        `05:30 AM: Doorstep boarding in ${origin.name}. Chauffeur navigates early via ${origin.highwayAccess}.`,
        `08:00 AM: Highway breakfast stop for fresh filter coffee and dosas.`,
        `01:30 PM: Arrival and resort check-in at ${destination.name}. Relax after the ${metrics.driveTimeFormatted} drive.`,
        `04:30 PM: Evening exploration of ${destination.keyStops.split(",")[0] || "scenic viewpoints"}.`
      ]
    },
    {
      day: 2,
      title: `Full-Day Sightseeing & Local Experiences`,
      activities: [
        `08:30 AM: Guided morning tour covering ${destination.keyStops.split(",")[1] || "plantation estates"}.`,
        `01:00 PM: Traditional South Indian lunch at authentic heritage restaurant.`,
        `03:30 PM: Visit ${destination.keyStops.split(",")[2] || "waterfalls and sunset points"}.`,
        days === 2 ? `06:00 PM: Return drive back toward Bangalore, arriving by 10:30 PM.` : `07:30 PM: Bonfire and dinner at homestay.`
      ]
    }
  ];

  if (days >= 3) {
    timeline.push({
      day: 3,
      title: `Souvenir Shopping & Return Drive to ${origin.name}`,
      activities: [
        `09:00 AM: Local spices, coffee, and souvenir shopping.`,
        `11:30 AM: Check-out and return departure along ${destination.highway}.`,
        `06:30 PM: Drop-off directly at your doorstep in ${origin.name}.`
      ]
    });
  }

  const faqs = [
    {
      question: `What is the best time to leave ${origin.name} for ${destination.name}?`,
      answer: `We strongly recommend a 5:30 AM to 6:00 AM departure. This ensures you cross Bangalore's Outer Ring Road or toll gates before office congestion begins, reaching ${destination.name} by lunchtime.`
    },
    {
      question: `How much does a ${days}-day cab trip from ${origin.name} to ${destination.name} cost?`,
      answer: directAnswerAio
    },
    {
      question: `Can the itinerary be customized for our family?`,
      answer: `Yes, 100%. Our chauffeur is assigned exclusively to your group for the full duration of your trip, allowing flexible photo stops and customized sightseeing hours.`
    }
  ];

  return {
    slug,
    origin,
    destination,
    vehicle,
    distanceKm: metrics.distanceKm,
    driveTime: metrics.driveTimeFormatted,
    days,
    h1,
    metaTitle,
    metaDescription,
    canonicalPath: `/blog/itinerary/${slug}`,
    directAnswerAio,
    trafficAdvice: `Depart ${origin.name} by 5:45 AM. Access ${destination.highway} via ${origin.highwayAccess} to bypass urban bottlenecks.`,
    timeline,
    budgetSummary: {
      vehicleRent,
      fuelAndDriver: driverBata,
      tollsAndEntry: toll,
      totalPerGroup: totalBudget
    },
    faqs,
    moneyPageUrl: `/rent/${vehicle.slug}/${origin.slug}-to-${destination.slug}`
  };
}
