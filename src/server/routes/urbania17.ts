import { Router } from "express";
import { vehiclesRepo, vehicleFeatures, vehicleGallery } from "../db/content.js";
import { dutyTariff } from "../db/pricing.js";
import { urbaniaFareRows } from "../utils/urbaniaFares.js";
import { faqSchema, breadcrumbSchema, speakableSchema, vehicleServiceSchema } from "../utils/schema.js";
import { orgSchemaWithRating } from "../middleware/viewLocals.js";
import { env } from "../config/env.js";
import { LOCATIONS, findLocation } from "../config/locations.js";
import { PSEO_ORIGINS } from "../config/pseoData.js";

const router = Router();

const PATH = "/17-seater-urbania-for-rent-in-bangalore";

const URBANIA_17_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Is there a 17 seater Urbania for rent in Bangalore?",
    answer:
      "Yes. Yogi Tours & Travels rents a 17 seater Force Urbania in Bangalore with a verified chauffeur at ₹38 per km, with a 300 km daily minimum and a ₹700 per day driver Bata. It carries up to 17 passengers plus the driver."
  },
  {
    question: "How much does a 17 seater Urbania cost per km?",
    answer:
      "The 17 seater Urbania costs ₹38 per km. Billing uses a 300 km daily minimum and a ₹700 per day driver Bata, plus tolls, parking, permits and state taxes at actuals. A 2-day Bangalore to Coorg round trip comes to about ₹24,200 before tolls and parking."
  },
  {
    question: "What is the 17 seater Urbania rental price per person?",
    answer:
      "For a 2-day Coorg trip with 17 travellers the vehicle cost is about ₹1,420 per person before tolls and parking. A full load makes the Urbania a low per-person cost for a luxury group vehicle."
  },
  {
    question: "How many bags fit in a 17 seater Urbania?",
    answer:
      "The 17 seater Urbania is set up for about 17 bags, with dedicated rear storage, so a full group can travel with its luggage in the same vehicle."
  },
  {
    question: "What seats and features does the 17 seater Urbania have?",
    answer:
      "It has Maharaja recliner captain seats with motorized calf and leg rests, a mounted Sony Bravia Smart TV, an on-board chiller, ambient blue neon lighting, individual USB fast chargers, individual AC louvers, panoramic tinted windows and retractable sunblinds, inside a high-roof walkthrough cabin."
  },
  {
    question: "Is the 17 seater Urbania better than a 17 seater Tempo Traveller?",
    answer:
      "Both carry 17 people. The Tempo Traveller is cheaper at ₹30 per km with AC. The Urbania costs ₹38 per km and gives a quieter, car-like ride, recliner seats, a Smart TV and a chiller, which suits long trips, VIP guests and weddings."
  },
  {
    question: "What should I rent for 18 to 21 people, a 17 seater Urbania or a mini bus?",
    answer:
      "The Force Urbania seats 17 at most. For 18 to 21 people rent the 21 seater mini bus from ₹34 per km, and for 22 to 25 people the 25 seater mini bus."
  },
  {
    question: "Is there a 21 seater Urbania?",
    answer:
      "No. We do not operate a 21 seater Urbania because the Force Urbania seats up to 17 passengers. The 21 seater mini bus is the right vehicle for groups of 18 to 21."
  },
  {
    question: "Can I rent the 17 seater Urbania for outstation trips from Bangalore?",
    answer:
      "Yes. It is regularly booked for Coorg, Ooty, Wayanad, Chikmagalur, Mysore, Hampi, Tirupati and Goa. Duty runs 6:00 AM to 10:00 PM, with extra driver Bata after 10:00 PM."
  },
  {
    question: "Can I book the 17 seater Urbania for a wedding or corporate event?",
    answer:
      "Yes. It is used for VIP wedding guest transfers, corporate offsites, executive delegations and airport group pickups, and you can combine it with other vehicles from our fleet through one point of contact."
  },
  {
    question: "Does the 17 seater Urbania pick up from Kempegowda Airport?",
    answer:
      "Yes. Pickups and drops are available at Kempegowda International Airport (BLR) and from any Bangalore locality, including Whitefield, Electronic City, Koramangala, Indiranagar, HSR Layout, Jayanagar, Marathahalli, Hebbal and Yelahanka."
  },
  {
    question: "How do I book a 17 seater Urbania for rent in Bangalore?",
    answer:
      "Call +91 97410 32020 or WhatsApp +91 98867 70099 at any hour with your pickup point, destination, dates and group size. You receive an itemised written quotation with the rate, daily minimum, Bata and expected extras before you pay."
  }
];

router.get(PATH, async (req, res, next) => {
  try {
    const all = await vehiclesRepo.all();
    const vehicle = all.find((v) => v.slug === "force-urbania");
    if (!vehicle) {
      next();
      return;
    }
    const tariff = dutyTariff("force-urbania")!;
    const rate = vehicle.ratePerKm ?? 38;
    const features = vehicleFeatures(vehicle);
    const gallery = vehicleGallery(vehicle);
    const crumbs = [
      { name: "Home", url: "/" },
      { name: "Force Urbania", url: "/force-urbania" },
      { name: "17 Seater Urbania", url: PATH }
    ];
    res.render("pages/urbania-17-seater", {
      title: "17 Seater Urbania for Rent in Bangalore | ₹38/km with Driver | Yogi Tours",
      metaDescription:
        "17 seater Urbania for rent in Bangalore at ₹38/km with driver. Recliner seats, Smart TV, chiller, 17 bags. Fare table, FAQs, 24/7 booking. Rated 4.9★.",
      metaKeywords:
        "17 seater urbania for rent in bangalore, 17 seater urbania rental, 17 seater urbania on rent, 17 seater force urbania, urbania 17 seater price, 17 seater urbania hire bangalore",
      canonicalPath: PATH,
      crumbs,
      vehicle,
      features,
      gallery,
      urbaniaRate: rate,
      urbaniaTariff: tariff,
      urbaniaFares: urbaniaFareRows(rate, tariff.minKmPerDay, tariff.driverBata),
      faqs: URBANIA_17_FAQS,
      organizationSchema: orgSchemaWithRating,
      schemas: [
        breadcrumbSchema(crumbs),
        vehicleServiceSchema({
          name: "17 Seater Force Urbania",
          description:
            "17 seater Force Urbania for rent in Bangalore with a verified chauffeur: Maharaja recliner seats, Smart TV, on-board chiller and about 17 bags of luggage space.",
          url: PATH,
          imageUrl: vehicle.imageKey ? `${env.siteUrl}${vehicle.imageKey}` : undefined,
          images: gallery.map((g) => `${env.siteUrl}${g}`),
          features,
          seats: 17,
          brand: "Force Motors",
          model: "Force Urbania",
          ratePerKm: rate,
          dateModified: vehicle.updatedAt
        }),
        faqSchema(URBANIA_17_FAQS),
        speakableSchema(PATH, ["#quick-answer", "#faq"])
      ]
    });
  } catch (err) {
    next(err);
  }
});

const URBANIA_12_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Is there a 12 seater Urbania for rent in Bangalore?",
    answer:
      "Yes. Yogi Tours & Travels rents the 12 seater Maharaja Urbania in Bangalore with a verified chauffeur at ₹38 per km, with a 300 km daily minimum and a ₹700 per day driver Bata."
  },
  {
    question: "What is a Maharaja Urbania?",
    answer:
      "The Maharaja Urbania is a 12 seater Force Urbania with flight business-class leather captain recliners in a 2+1 and 1+1 layout, extendable calf rests, dual blue neon ceiling light rails, a Smart TV and on-board cold storage."
  },
  {
    question: "How much does the 12 seater Maharaja Urbania cost per km?",
    answer:
      "₹38 per km, with a 300 km daily minimum and ₹700 per day driver Bata. Tolls, parking, permits and state taxes are billed at actuals and itemised in the quotation."
  },
  {
    question: "How many bags fit in the 12 seater Maharaja Urbania?",
    answer: "About 12 bags, in a dedicated rear luggage boot."
  },
  {
    question: "12 seater Maharaja Urbania or 17 seater Urbania, which should I rent?",
    answer:
      "Choose the 12 seater Maharaja Urbania for up to 12 people who want the widest recliners and most legroom. Choose the 17 seater Urbania for 13 to 17 people. Both cost ₹38 per km."
  },
  {
    question: "Is the Maharaja Urbania cheaper than a 12 seater Tempo Traveller?",
    answer:
      "No. The 12 seater Maharaja Tempo Traveller is ₹22 per km. The Maharaja Urbania is ₹38 per km and adds business-class recliners, a quieter car-like ride, a Smart TV and cold storage."
  },
  {
    question: "Is the Maharaja Urbania good for weddings and corporate travel?",
    answer:
      "Yes. It is booked for VIP wedding guests, executive delegations and luxury family holidays."
  },
  {
    question: "Can I take the 12 seater Urbania on outstation trips?",
    answer:
      "Yes. It is regularly booked for Coorg, Ooty, Wayanad, Chikmagalur, Mysore, Hampi and Tirupati. Duty runs 6:00 AM to 10:00 PM, with extra driver Bata after 10:00 PM."
  },
  {
    question: "How do I book a 12 seater Urbania in Bangalore?",
    answer:
      "Call +91 97410 32020 or WhatsApp +91 98867 70099 at any hour with your pickup point, destination, dates and group size. You receive an itemised written quotation before you pay."
  }
];

router.get("/12-seater-urbania-for-rent-in-bangalore", async (req, res, next) => {
  try {
    const all = await vehiclesRepo.all();
    const vehicle = all.find((v) => v.slug === "urbania-12-seater-maharaja");
    if (!vehicle) {
      next();
      return;
    }
    const path = "/12-seater-urbania-for-rent-in-bangalore";
    const tariff = dutyTariff("urbania-12-seater-maharaja")!;
    const rate = vehicle.ratePerKm ?? 38;
    const features = vehicleFeatures(vehicle);
    const gallery = vehicleGallery(vehicle);
    const crumbs = [
      { name: "Home", url: "/" },
      { name: "Force Urbania", url: "/force-urbania" },
      { name: "12 Seater Urbania", url: path }
    ];
    res.render("pages/urbania-12-seater", {
      title: "12 Seater Urbania for Rent in Bangalore | Maharaja Urbania ₹38/km | Yogi Tours",
      metaDescription:
        "12 seater Maharaja Urbania for rent in Bangalore at ₹38/km with driver. Business-class recliners, calf rests, Smart TV, cold storage. 24/7 booking. Rated 4.9★.",
      metaKeywords:
        "12 seater urbania for rent in bangalore, 12 seater urbania rental, maharaja urbania rental, maharaja urbania 12 seater price, 12 seater force urbania bangalore",
      canonicalPath: path,
      crumbs,
      vehicle,
      features,
      gallery,
      urbaniaRate: rate,
      urbaniaTariff: tariff,
      urbaniaPax: 12,
      urbaniaFares: urbaniaFareRows(rate, tariff.minKmPerDay, tariff.driverBata),
      faqs: URBANIA_12_FAQS,
      organizationSchema: orgSchemaWithRating,
      schemas: [
        breadcrumbSchema(crumbs),
        vehicleServiceSchema({
          name: "12 Seater Maharaja Urbania",
          description:
            "12 seater Maharaja Force Urbania for rent in Bangalore with a verified chauffeur: business-class leather recliners, Smart TV and cold storage.",
          url: path,
          imageUrl: vehicle.imageKey ? `${env.siteUrl}${vehicle.imageKey}` : undefined,
          images: gallery.map((g) => `${env.siteUrl}${g}`),
          features,
          seats: 12,
          brand: "Force Motors",
          model: "Force Urbania Maharaja",
          ratePerKm: rate,
          dateModified: vehicle.updatedAt
        }),
        faqSchema(URBANIA_12_FAQS),
        speakableSchema(path, ["#quick-answer", "#faq"])
      ]
    });
  } catch (err) {
    next(err);
  }
});

// /urbania-rent-<locality> — one page per Bangalore locality, built on the
// hand-written, locality-specific copy in config/locations.ts (the same copy
// that fixed the earlier near-duplicate flag), not a find-and-replace.
router.get("/urbania-rent-:slug", async (req, res, next) => {
  try {
    const location = findLocation(req.params.slug);
    if (!location) {
      next();
      return;
    }
    const all = await vehiclesRepo.all();
    const vehicle = all.find((v) => v.slug === "force-urbania");
    if (!vehicle) {
      next();
      return;
    }
    const tariff = dutyTariff("force-urbania")!;
    const rate = vehicle.ratePerKm ?? 38;
    const path = `/urbania-rent-${location.slug}`;
    const nearby = location.nearbySlugs.map((s) => findLocation(s)).filter((l): l is NonNullable<typeof l> => Boolean(l));
    const rentOrigin = PSEO_ORIGINS.find((o) => o.slug === location.slug);
    const faqs = [
      {
        question: `Is an Urbania available on rent in ${location.name}?`,
        answer: `Yes. Yogi Tours & Travels sends a 17 seater Force Urbania or a 12 seater Maharaja Urbania with a verified chauffeur directly to your pickup point in ${location.name}, Bangalore.`
      },
      {
        question: `How much is Urbania rent in ${location.name} per km?`,
        answer: `Urbania rent in ${location.name} is ₹${rate} per km for both the 17 seater and the 12 seater Maharaja Urbania, with a ${tariff.minKmPerDay} km daily minimum and ₹${tariff.driverBata} per day driver Bata. Tolls, parking, permits and state taxes are extra.`
      },
      {
        question: `Can I rent an Urbania from ${location.name} for an outstation trip?`,
        answer: `Yes. Urbania trips from ${location.name} to Coorg, Mysore, Ooty, Wayanad, Tirupati, Chikmagalur, Goa and Hampi are booked regularly. The route, billed kilometres and Bata are confirmed in writing before you pay.`
      },
      {
        question: `Is there a 21 seater Urbania in ${location.name}?`,
        answer: `No. The Force Urbania seats up to 17 passengers. For 18 to 21 people from ${location.name}, the 21 seater mini bus from ₹34 per km is the right vehicle.`
      },
      {
        question: `How do I book an Urbania in ${location.name}?`,
        answer: `Call +91 97410 32020 or WhatsApp +91 98867 70099 with your ${location.name} pickup point, destination, dates and group size. You receive an itemised written quotation, confirm it, and the chauffeur arrives on time.`
      }
    ];
    const crumbs = [
      { name: "Home", url: "/" },
      { name: "Force Urbania", url: "/force-urbania" },
      { name: `Urbania Rent in ${location.name}`, url: path }
    ];
    res.render("pages/urbania-locality", {
      title: `Urbania Rent in ${location.name} | 17 & 12 Seater Force Urbania ₹38/km | Yogi Tours`,
      metaDescription: `Urbania on rent in ${location.name}, Bangalore: 17 seater & 12 seater Maharaja Urbania at ₹38/km with driver. Doorstep pickup, itemised quote, 24/7.`,
      metaKeywords: `urbania rent ${location.name.toLowerCase()}, urbania on rent in ${location.name.toLowerCase()}, force urbania ${location.name.toLowerCase()}, urbania rental ${location.name.toLowerCase()}, 17 seater urbania ${location.name.toLowerCase()}`,
      canonicalPath: path,
      crumbs,
      location,
      nearby,
      rentOriginSlug: rentOrigin ? rentOrigin.slug : "bangalore-city",
      urbaniaRate: rate,
      urbaniaTariff: tariff,
      urbaniaFares: urbaniaFareRows(rate, tariff.minKmPerDay, tariff.driverBata),
      faqs,
      organizationSchema: orgSchemaWithRating,
      schemas: [
        breadcrumbSchema(crumbs),
        faqSchema(faqs),
        speakableSchema(path, ["#quick-answer", "#faq"])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export { LOCATIONS };
export default router;
