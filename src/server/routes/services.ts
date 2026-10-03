import { Router } from "express";
import { servicesRepo, serviceHighlights, faqsRepo } from "../db/content.js";
import { serviceSchema, breadcrumbSchema, faqSchema, speakableSchema } from "../utils/schema.js";
import type { Service } from "../types/models.js";

const router = Router();

// Real, published posts relevant to a specific service — an editorial link,
// not a generic "read our blog" pointer, so it only appears where it's
// actually on-topic.
const SERVICE_RELATED_POSTS: Record<string, { slug: string; title: string }> = {
  "outstation-travel": { slug: "bangalore-to-coorg-road-trip-itinerary-tempo-traveller", title: "Bangalore to Coorg Road Trip: Complete 3-Day Itinerary" },
  "airport-transfer": { slug: "bangalore-airport-taxi-cab-guide-kempegowda-blr-transfers", title: "Bangalore Airport Taxi & Cab Guide: Kempegowda (BLR) Transfers" }
};

// Real alternate phrasings people search for each service — not fabricated
// claims (this is just search-term vocabulary, unlike body copy), matched to
// what each service's own shortDescription already says it does. Opt-in per
// slug like CATEGORY_KEYWORDS/VEHICLE_TITLE_OVERRIDE in vehicles.ts, so a new
// service added via /admin just falls back to the generic pattern in
// serviceKeywords() below until a real entry is written for it here.
const SERVICE_KEYWORDS: Record<string, string> = {
  "outstation-travel": "outstation cab bangalore, outstation taxi service bangalore, one way cab bangalore, round trip cab bangalore, outstation cab booking bangalore",
  "airport-transfer": "airport taxi bangalore, airport cab booking bangalore, kempegowda airport taxi, airport pickup and drop bangalore, bangalore airport transfer service",
  "local-intercity-travel": "local cab service bangalore, hourly car rental bangalore, intercity cab bangalore, city taxi service bangalore",
  "corporate-travel": "corporate cab service bangalore, employee transportation bangalore, corporate car rental bangalore, business travel cab bangalore",
  "wedding-transportation": "wedding car rental bangalore, wedding cab service bangalore, baraat vehicle rental bangalore, guest shuttle service bangalore",
  "educational-tours": "school bus rental bangalore, college excursion bus bangalore, educational tour bus rental bangalore, study tour transportation bangalore",
  "pilgrimage-tours": "pilgrimage tour cab bangalore, temple tour taxi bangalore, pilgrimage tour package bangalore, group pilgrimage vehicle bangalore",
  "family-tours": "family tour package bangalore, family vacation cab bangalore, family trip car rental bangalore",
  "resort-trips": "resort cab bangalore, weekend getaway cab bangalore, resort trip taxi bangalore",
  "customized-tours": "custom tour package bangalore, personalized itinerary bangalore, custom road trip bangalore",
  "group-transportation": "group travel bangalore, bulk vehicle booking bangalore, association transportation bangalore",
  "event-transportation": "event transportation bangalore, conference cab service bangalore, exhibition transport bangalore"
};

const SERVICE_META_DESCRIPTIONS: Record<string, string> = {
  "outstation-travel": "Book outstation cabs in Bangalore for round trips & one-way drops across Karnataka & South India. Sedans, Innova Crysta & Tempo Travellers with verified drivers.",
  "airport-transfer": "Reliable Bangalore airport taxi & cab transfers to Kempegowda International Airport (BLR). On-time pickup, flight tracking, AC sedans & Tempo Travellers 24/7.",
  "local-intercity-travel": "Rent cabs for local Bangalore city travel & short intercity trips. Hourly 8hr/80km packages & per-km billing with verified drivers for errands and sightseeing.",
  "corporate-travel": "Dependable corporate cab & bus rentals in Bangalore. Employee transport, executive airport transfers, client visits & company offsites with GST invoicing.",
  "wedding-transportation": "Luxury wedding car hire & guest shuttle bus rentals in Bangalore. Decorated cars, Tempo Travellers & AC buses coordinated to your wedding schedule.",
  "educational-tours": "Safe, reliable bus & mini bus rentals for Bangalore schools and colleges. Excursions, industrial visits & study tours with experienced commercial drivers.",
  "pilgrimage-tours": "Group vehicle rentals for pilgrimage circuits from Bangalore to Tirupati, Dharmasthala, Murudeshwar & Kukke. Clean Tempo Travellers with courteous chauffeurs.",
  "family-tours": "Comfortable family vacation cabs & Tempo Traveller hire in Bangalore. Spacious seating, generous luggage capacity & child-friendly drivers for South India trips.",
  "resort-trips": "Book round-trip cabs & group vans to luxury resorts around Bangalore (Kabini, Sakleshpur, Nandi Hills). Flexible waiting & transparent upfront pricing.",
  "customized-tours": "Plan your custom Karnataka & South India road trip with Yogi Tours Bangalore. Tailor your itinerary, vehicle choice & multi-day stops with zero hidden fees.",
  "group-transportation": "Coordinated multi-vehicle fleet hire in Bangalore for large groups, associations & community gatherings. Tempo Travellers & 55-seater tourist coaches.",
  "event-transportation": "On-time event transportation in Bangalore for conferences, exhibitions & private functions. Dedicated guest shuttles & experienced fleet coordinators."
};

function serviceKeywords(service: Service): string {
  const name = service.name.toLowerCase();
  const generic = `${name} bangalore, ${name} near me, book ${name} bangalore`;
  const specific = SERVICE_KEYWORDS[service.slug];
  return specific ? `${specific}, ${generic}` : generic;
}

router.get("/", async (req, res, next) => {
  try {
    const services = await servicesRepo.all();
    res.render("pages/services-list", {
      title: "Travel & Chauffeur Services in Bangalore | Yogi Tours",
      metaDescription:
        "Comprehensive Bangalore travel services: outstation cabs, Kempegowda airport transfers, corporate employee transport & luxury wedding shuttles. Available 24/7.",
      // The list page gets one line per service name (not each service's full
      // detail-page keyword set below — stacking all of those here would be
      // 60+ near-duplicate phrases on one tag, which is exactly the keyword-
      // stuffing pattern that makes the tag look spammy to anything that
      // still reads it).
      metaKeywords: `${services.map((s) => `${s.name.toLowerCase()} bangalore`).join(", ")}, travel services bangalore, cab services bangalore`,
      canonicalPath: "/services",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" }
      ],
      services,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const service = await servicesRepo.findBySlug(req.params.slug);
    if (!service) {
      next();
      return;
    }
    const [relatedFaqsAll, allServices] = await Promise.all([
      faqsRepo.allWhere("category = ?", "Services"),
      servicesRepo.all()
    ]);
    const relatedFaqs = relatedFaqsAll.slice(0, 5);
    const related = allServices.filter((s) => s.id !== service.id).slice(0, 3);

    const fullDesc =
      SERVICE_META_DESCRIPTIONS[service.slug] ||
      (service.shortDescription.length >= 130
        ? service.shortDescription
        : `${service.shortDescription} Book chauffeur-driven vehicles with transparent per-km billing and 24/7 support in Bangalore.`);

    res.render("pages/service-detail", {
      title: `${service.name} Service in Bangalore | Yogi Tours`,
      metaDescription: fullDesc,
      metaKeywords: serviceKeywords(service),
      canonicalPath: `/services/${service.slug}`,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: service.name, url: `/services/${service.slug}` }
      ],
      service,
      highlights: serviceHighlights(service),
      relatedFaqs,
      related,
      relatedPost: SERVICE_RELATED_POSTS[service.slug],
      schemas: [
        serviceSchema({
          name: service.name,
          description: service.description,
          url: `/services/${service.slug}`,
          dateModified: service.updatedAt
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.name, url: `/services/${service.slug}` }
        ]),
        ...(relatedFaqs.length
          ? [faqSchema(relatedFaqs.map((f) => ({ question: f.question, answer: f.answer }))), speakableSchema(`/services/${service.slug}`, ["#faq"])]
          : [])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
