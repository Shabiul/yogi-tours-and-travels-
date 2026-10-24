import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  vehiclesRepo,
  featuredServices,
  featuredPackages,
  servicesRepo,
  faqsRepo,
  testimonialsRepo,
  packagesRepo,
  startingPriceByCategory,
  galleryPreview,
  sortVehiclesAlphabetically
} from "../db/content.js";
import { faqSchema, websiteSchema, breadcrumbSchema, speakableSchema, serviceSchema, toIso } from "../utils/schema.js";
import { business } from "../config/env.js";
import { orgSchemaWithRating } from "../middleware/viewLocals.js";
import { TRIP_ROUTES } from "../config/tripRoutes.js";
import { dutyTariff } from "../db/pricing.js";
import { urbaniaFareRows } from "../utils/urbaniaFares.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const creditsPath = path.resolve(__dirname, "../../../IMAGE_CREDITS.json");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [allFaqs, vehicles, services, packages, pricing, testimonials, galleryTeaser] = await Promise.all([
      faqsRepo.all(),
      vehiclesRepo.all(),
      featuredServices(6),
      featuredPackages(9),
      startingPriceByCategory(),
      testimonialsRepo.all(),
      galleryPreview()
    ]);
    const faqs = allFaqs.slice(0, 12);
    // Freshness signal: newest content row feeding the homepage.
    const dateModified = [...vehicles, ...services, ...packages].map((r) => toIso(r.updatedAt)).sort().pop();
    res.render("pages/home", {
      vehicles: sortVehiclesAlphabetically(vehicles),
      title: "Tours and Travels Near Me Bangalore | Yogi Tours and Travels",
      metaDescription:
        "Tours and travels near me in Bangalore — car, cab, Tempo Traveller, Urbania & bus rental for local, airport and outstation trips. Transparent pricing, 24/7.",
      canonicalPath: "/",
      // Only the home page opens on a full-bleed dark hero, so only it gets the transparent-over-hero header.
      transparentHeader: true,
      services,
      packages,
      pricing,
      faqs,
      testimonials,
      galleryTeaser,
      homeRoutes: TRIP_ROUTES.slice(0, 6),
      organizationSchema: orgSchemaWithRating,
      schemas: [
        websiteSchema(),
        faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
        speakableSchema("/", faqs.length ? ["#faq"] : ["h1"], { datePublished: business.sitePublished, dateModified })
      ]
    });
  } catch (err) {
    next(err);
  }
});

const FORCE_URBANIA_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Where can I get a Force Urbania rental in Bangalore?",
    answer:
      "Yogi Tours & Travels provides Force Urbania rental in Bangalore (Bengaluru) with verified commercial chauffeurs, in both a 17 seater Urbania and a 12 seater Maharaja Urbania. Pickups are available from Whitefield, Electronic City, Koramangala, Indiranagar, HSR Layout, Yelahanka, Hebbal, Jayanagar, JP Nagar, Marathahalli and Kempegowda International Airport (BLR)."
  },
  {
    question: "How much is a 17 seater Urbania for rental in Bangalore?",
    answer:
      "The 17 seater Urbania for rental starts at ₹38 per km with a 300 km daily minimum and a ₹700 per day driver Bata. Tolls, parking, interstate permits and state taxes are extra and itemised in your quotation before you pay."
  },
  {
    question: "How much does the Maharaja Urbania rental cost?",
    answer:
      "The 12 seater Maharaja Urbania is ₹38 per km with a 300 km daily minimum and a ₹700 per day driver Bata, the same terms as the 17 seater Urbania. The difference is in the seats: the Maharaja Urbania has fewer, wider business-class recliner captain chairs with calf rests."
  },
  {
    question: "What is the difference between a 17 seater Urbania and a Maharaja Urbania?",
    answer:
      "The 17 seater Urbania carries up to 17 passengers with Maharaja recliner captain seats, ideal for large groups. The Maharaja Urbania seats 12 in a 2+1 and 1+1 layout with leather captain recliners, extendable calf rests and dual blue neon ceiling light rails, built for VIP comfort rather than headcount."
  },
  {
    question: "Is there a 21 seater Urbania?",
    answer:
      "No. The Force Urbania seats up to 17 passengers. For 18 to 21 people, Yogi Tours & Travels offers a 21 seater AC mini bus from ₹34 per km."
  },
  {
    question: "What features does the Force Urbania have?",
    answer:
      "Our Force Urbania rental vehicles have Maharaja recliner captain seats with calf and leg rests, a mounted Sony Bravia Smart TV, an on-board chiller, ambient blue neon lighting, individual USB fast chargers, individual AC louvers, panoramic tinted windows and retractable sunblinds, with a high-roof walkthrough cabin and a car-like monocoque ride."
  },
  {
    question: "Can I rent a Force Urbania for outstation trips from Bangalore?",
    answer:
      "Yes. The Force Urbania is our most popular luxury group vehicle for multi-day outstation tours, including Coorg, Ooty, Chikmagalur, Wayanad, Mysore, Hampi, Tirupati and Goa."
  },
  {
    question: "Is a Force Urbania good for weddings and corporate travel?",
    answer:
      "Yes. The 17 seater Urbania and the Maharaja Urbania are booked for VIP wedding guest transfers, executive corporate delegations, offsites and client visits."
  },
  {
    question: "Should I rent an Urbania or a Tempo Traveller?",
    answer:
      "Choose a Tempo Traveller for the lowest cost, from ₹22 per km for the 12 seater and ₹30 per km for the 17 seater. Choose the Urbania, at ₹38 per km, when you want a quieter car-like ride, recliner seats, a Smart TV and an on-board chiller."
  },
  {
    question: "Which vehicle should I rent for more than 17 people?",
    answer:
      "For 18 to 21 people choose the 21 seater mini bus (₹34 per km), for 22 to 25 the 25 seater mini bus (₹38 per km), and for larger groups our 33, 40 and 50 seater tourist buses (₹45, ₹50 and ₹60 per km)."
  },
  {
    question: "Are tolls, parking and permits included in the Urbania rental rate?",
    answer:
      "No. Tolls, parking, interstate permits and state taxes are billed at actuals. The per-km rate, daily minimum and driver Bata are confirmed in writing before you pay."
  },
  {
    question: "How do I book an Urbania rental in Bangalore?",
    answer:
      "Call +91 97410 32020 or WhatsApp +91 98867 70099 at any hour with your pickup point, destination, dates and group size. You receive an itemised quotation, confirm it, and the chauffeur arrives on time. Bookings and support run 24/7."
  }
];

router.get("/force-urbania", async (req, res, next) => {
  try {
    const all = await vehiclesRepo.all();
    const sorted = [...all].sort((a, b) => a.seats - b.seats);
    // Every vehicle except the 9 seater: Urbanias, other group vehicles, then cars.
    const urbanias = sorted.filter((v) => v.name.toLowerCase().includes("urbania"));
    const groupVehicles = sorted.filter(
      (v) => v.category !== "car" && v.seats !== 9 && !v.name.toLowerCase().includes("urbania")
    );
    const cars = sorted.filter((v) => v.category === "car");
    const urbTariff = dutyTariff("force-urbania")!;
    const urbaniaRate = urbanias.find((v) => v.slug === "force-urbania")?.ratePerKm ?? 38;
    res.render("pages/force-urbania", {
      urbaniaRate,
      urbaniaTariff: urbTariff,
      urbaniaFares: urbaniaFareRows(urbaniaRate, urbTariff.minKmPerDay, urbTariff.driverBata),
      title: "Force Urbania Rental in Bangalore | 17 Seater & Maharaja Urbania | Yogi Tours",
      metaDescription:
        "Force Urbania rental in Bangalore: 17 seater Urbania & Maharaja Urbania at ₹38/km with driver. Plus 12, 17, 21, 25 seaters & buses. Rated 4.9★, 24/7.",
      metaKeywords:
        "force urbania rental in bangalore, urbania rental in bangalore, 17 seater urbania rental, 17 seater urbania for rental, maharaja urbania rental, maharaja urbania bangalore, force urbania on rent bangalore, urbania hire bangalore, luxury urbania bangalore, 12 seater urbania bangalore",
      canonicalPath: "/force-urbania",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Force Urbania", url: "/force-urbania" }
      ],
      urbanias,
      groupVehicles,
      cars,
      faqs: FORCE_URBANIA_FAQS,
      organizationSchema: orgSchemaWithRating,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Force Urbania", url: "/force-urbania" }
        ]),
        serviceSchema({
          name: "Force Urbania Rental in Bangalore",
          description:
            "17 seater Urbania and Maharaja Urbania rental in Bangalore with a verified chauffeur, from ₹38 per km, for outstation trips, weddings, corporate travel and airport transfers.",
          url: "/force-urbania"
        }),
        faqSchema(FORCE_URBANIA_FAQS),
        speakableSchema("/force-urbania", ["#quick-answer", "#faq"])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/about", async (req, res, next) => {
  try {
    const testimonials = await testimonialsRepo.all();
    res.render("pages/about", {
      title: "About Yogi Tours & Travels | Bangalore Travel Agency Since 2011",
      metaDescription:
        "Learn about Yogi Tours & Travels: Bangalore's trusted travel partner for 14+ years. Verified commercial chauffeurs, 4.9★ rating & transparent per-km fleet tariffs.",
      canonicalPath: "/about",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "About", url: "/about" }
      ],
      organizationSchema: orgSchemaWithRating,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "About", url: "/about" }
        ])
      ],
      testimonials
    });
  } catch (err) {
    next(err);
  }
});

router.get("/contact", (req, res) => {
  res.render("pages/contact", {
    title: "Contact Yogi Tours & Travels | 24/7 Bangalore Cab & Bus Booking",
    metaDescription:
      "Contact Yogi Tours & Travels for 24/7 cab, Tempo Traveller and bus bookings in Bangalore. Call, WhatsApp, or get an instant itemized quotation for your trip.",
    canonicalPath: "/contact",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" }
    ],
    organizationSchema: orgSchemaWithRating,
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Contact", url: "/contact" }
      ])
    ]
  });
});

router.get("/privacy-policy", (req, res) => {
  res.render("pages/legal", {
    title: "Privacy Policy | Yogi Tours & Travels Bangalore",
    metaDescription: "Privacy policy for Yogi Tours & Travels detailing how customer enquiry, booking and passenger data is collected, securely encrypted and protected.",
    canonicalPath: "/privacy-policy",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Privacy Policy", url: "/privacy-policy" }
    ],
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Privacy Policy", url: "/privacy-policy" }
      ])
    ],
    pageHeading: "Privacy Policy",
    lastUpdated: "8 August 2026",
    template: "privacy"
  });
});

router.get("/terms-and-conditions", (req, res) => {
  res.render("pages/legal", {
    title: "Terms and Conditions | Yogi Tours & Travels Bangalore",
    metaDescription: "Read the terms and conditions for vehicle rental, chauffeur services, outstation trips and tour bookings with Yogi Tours & Travels Bangalore.",
    canonicalPath: "/terms-and-conditions",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Terms & Conditions", url: "/terms-and-conditions" }
    ],
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Terms & Conditions", url: "/terms-and-conditions" }
      ])
    ],
    pageHeading: "Terms & Conditions",
    lastUpdated: "8 August 2026",
    template: "terms"
  });
});

router.get("/cancellation-policy", (req, res) => {
  res.render("pages/legal", {
    title: "Cancellation & Rescheduling Policy | Yogi Tours & Travels",
    metaDescription: "Clear cancellation, refund and rescheduling terms for car, Tempo Traveller and tourist bus rentals with Yogi Tours & Travels Bangalore. Zero hidden fees.",
    canonicalPath: "/cancellation-policy",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Cancellation Policy", url: "/cancellation-policy" }
    ],
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Cancellation Policy", url: "/cancellation-policy" }
      ])
    ],
    pageHeading: "Cancellation Policy",
    lastUpdated: "8 August 2026",
    template: "cancellation"
  });
});

router.get("/photo-credits", (req, res) => {
  let credits: Array<{ slug: string; artist: string; license: string; licenseUrl: string; commonsFile: string }> = [];
  try {
    credits = JSON.parse(fs.readFileSync(creditsPath, "utf8"));
  } catch {
    credits = [];
  }
  res.render("pages/photo-credits", {
    title: "Photo Credits & Attribution | Yogi Tours & Travels",
    metaDescription: "Attribution and licensing details for destination and vehicle photography on Yogi Tours & Travels, sourced under verified Creative Commons licenses.",
    canonicalPath: "/photo-credits",
    noindex: true,
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Photo Credits", url: "/photo-credits" }
    ],
    credits
  });
});

export default router;
