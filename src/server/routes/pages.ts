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
import { faqSchema, websiteSchema, breadcrumbSchema, speakableSchema } from "../utils/schema.js";
import { orgSchemaWithRating } from "../middleware/viewLocals.js";
import { TRIP_ROUTES } from "../config/tripRoutes.js";

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
    res.render("pages/home", {
      vehicles: sortVehiclesAlphabetically(vehicles),
      title: "Tours and Travels Near Me Bangalore | Yogi Tours",
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
        ...(faqs.length ? [speakableSchema("/", ["#faq"])] : [])
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
