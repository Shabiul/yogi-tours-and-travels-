import { Router } from "express";
import { vehiclesRepo, vehicleFeatures, vehicleGallery } from "../db/content.js";
import { dutyTariff } from "../db/pricing.js";
import { urbaniaFareRows } from "../utils/urbaniaFares.js";
import { faqSchema, breadcrumbSchema, speakableSchema, vehicleServiceSchema } from "../utils/schema.js";
import { orgSchemaWithRating } from "../middleware/viewLocals.js";
import { env } from "../config/env.js";

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

export default router;
