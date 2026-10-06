import { Router } from "express";
import { publishedBlogPosts, findBlogPostBySlug } from "../db/content.js";
import { blogPostingSchema, breadcrumbSchema, faqSchema, speakableSchema, toIso } from "../utils/schema.js";
import { clampDescription } from "../utils/meta.js";
import { business, env } from "../config/env.js";
import { resolveCostPost, resolveComparePost, resolveItineraryPost } from "../config/programmaticBlog.js";

// Real places/entities each post is substantively about — used for BlogPosting
// "mentions" (entity grounding for GEO/AEO).
const POST_MENTIONS: Record<string, Array<{ name: string; type?: string }>> = {
  "karnataka-to-gujarat-road-trip-statue-of-unity": [
    { name: "Statue of Unity" },
    { name: "Gujarat", type: "State" },
    { name: "Karnataka", type: "State" },
    { name: "Kevadia" },
    { name: "Narmada River", type: "River" }
  ],
  "bangalore-to-coorg-road-trip-itinerary-tempo-traveller": [
    { name: "Coorg", type: "Place" },
    { name: "Madikeri", type: "City" },
    { name: "Bylakuppe Golden Temple", type: "TouristAttraction" },
    { name: "Dubare Elephant Camp", type: "TouristAttraction" },
    { name: "Abbey Falls", type: "TouristAttraction" },
    { name: "Talakaveri", type: "Place" },
    { name: "Karnataka", type: "State" }
  ],
  "bangalore-to-ooty-road-trip-guide-hairpin-bends-vehicle": [
    { name: "Ooty", type: "Place" },
    { name: "Bandipur National Park", type: "Place" },
    { name: "Mudumalai National Park", type: "Place" },
    { name: "Kalhatty Ghat", type: "Place" },
    { name: "Pykara Lake", type: "TouristAttraction" },
    { name: "Nilgiri Hills", type: "Place" }
  ],
  "force-urbania-vs-tempo-traveller-luxury-van-rental-bangalore": [
    { name: "Force Urbania", type: "Product" },
    { name: "Tempo Traveller", type: "Product" },
    { name: "Force Motors", type: "Organization" },
    { name: "Bengaluru", type: "City" }
  ],
  "bangalore-airport-taxi-cab-guide-kempegowda-blr-transfers": [
    { name: "Kempegowda International Airport", type: "Airport" },
    { name: "BLR Airport Terminal 2", type: "Airport" },
    { name: "Bengaluru", type: "City" },
    { name: "Devanahalli", type: "Place" }
  ],
  "bangalore-to-chikmagalur-weekend-road-trip-guide": [
    { name: "Chikmagalur", type: "Place" },
    { name: "Mullayanagiri Peak", type: "TouristAttraction" },
    { name: "Belur Chennakeshava Temple", type: "TouristAttraction" },
    { name: "Halebidu Hoysaleshwara Temple", type: "TouristAttraction" },
    { name: "Baba Budangiri", type: "Place" }
  ],
  "9-seater-tempo-traveller-bangalore-guide": [
    { name: "9 Seater Tempo Traveller", type: "Product" },
    { name: "Tempo Traveller", type: "Product" },
    { name: "Toyota Innova Crysta", type: "Product" },
    { name: "Bengaluru", type: "City" },
    { name: "Kempegowda International Airport", type: "Airport" },
    { name: "Coorg", type: "Place" },
    { name: "Ooty", type: "Place" },
    { name: "Mysore", type: "City" },
    { name: "Tirupati", type: "City" },
    { name: "Chikmagalur", type: "Place" },
    { name: "Wayanad", type: "Place" }
  ]
};

// Real, on-page questions this post's H2 sections already answer — surfaced
// as FAQPage schema so the same content is eligible for AI-answer citation.
const POST_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  "karnataka-to-gujarat-road-trip-statue-of-unity": [
    {
      question: "How far is the Statue of Unity from Bangalore/Karnataka by road?",
      answer:
        "Around 1,500 km one-way, driving north through Karnataka into Maharashtra (via Pune and Nashik) and then into Gujarat (via Surat and Vadodara) to Kevadia in Narmada district."
    },
    {
      question: "Can you drive from Bangalore to the Statue of Unity in one day?",
      answer:
        "It's not recommended — at around 1,500 km, groups typically split the drive into two days with an overnight halt in Maharashtra, arriving in Kevadia rested rather than exhausted."
    },
    {
      question: "Which vehicle suits a long-distance trip like Bangalore to Gujarat?",
      answer:
        "An Innova Crysta works well for a small family or friend group, while a Tempo Traveller suits a larger group travelling together on one vehicle for the full two-day drive each way."
    }
  ],
  "bangalore-to-coorg-road-trip-itinerary-tempo-traveller": [
    {
      question: "What is the driving distance from Bangalore to Coorg?",
      answer:
        "The distance from Bangalore to Madikeri (Coorg) is approximately 250 km via the Mysore Expressway & Kushalnagar, taking about 5 to 5.5 hours, or 275 km via NH75 Hassan taking about 6 hours."
    },
    {
      question: "Why should we hire a Tempo Traveller for a Coorg trip instead of multiple cars?",
      answer:
        "A 12 or 17-seater Tempo Traveller keeps your entire family or group together, saves on multiple toll and driver costs, provides higher panoramic sightseeing windows, and ensures safe ghat driving with a verified commercial hill driver."
    },
    {
      question: "What are the must-visit stops on a 3-day Bangalore to Coorg road trip?",
      answer:
        "Top attractions include Namdroling Monastery (Golden Temple) at Bylakuppe, Dubare Elephant Camp, Abbey Falls, Raja's Seat sunset viewpoint, and the sacred river origin at Talakaveri."
    }
  ],
  "bangalore-to-ooty-road-trip-guide-hairpin-bends-vehicle": [
    {
      question: "What are the forest check-post timings for Bandipur and Mudumalai on the way to Ooty?",
      answer:
        "The Bandipur and Mudumalai wildlife corridor check-posts are strictly closed to all vehicular traffic between 9:00 PM and 6:00 AM daily. Plan to cross Gundlupet during daylight hours."
    },
    {
      question: "Can commercial tourist vehicles take the Kalhatty Ghat 36 hairpin bends road to Ooty?",
      answer:
        "Tamil Nadu authorities restrict heavy commercial vehicles and large buses from the steep Kalhatty GhatMasinagudi route due to the 12% incline. Commercial vehicles and Tempo Travellers typically take the safer, scenic Gudalur highway (NH181)."
    },
    {
      question: "Which vehicle is best suited for a Bangalore to Ooty road trip?",
      answer:
        "Toyota Innova Crysta is ideal for couples and families of up to 6, while a 12 or 17-seater Tempo Traveller or Force Urbania is recommended for larger groups needing high torque and AC comfort on mountain inclines."
    }
  ],
  "force-urbania-vs-tempo-traveller-luxury-van-rental-bangalore": [
    {
      question: "What is the key difference between Force Urbania and a regular Tempo Traveller?",
      answer:
        "Force Urbania features a modern car-like monocoque chassis, independent front suspension, whisper-quiet cabin acoustics, and 6 ft 3 in interior standing height, whereas the standard Tempo Traveller is built on a rugged ladder-frame chassis."
    },
    {
      question: "What luxury amenities are included in the 12-seater Maharaja Force Urbania?",
      answer:
        "Our Maharaja Urbania includes individual captain chairs with deployable calf recliners, an on-board Blackcat chiller box for beverages, mounted Sony Bravia Smart LED TV, dual blue ambient ceiling lighting rails, and individual fast USB charging ports."
    },
    {
      question: "What is the per-km rate for renting a Force Urbania in Bangalore?",
      answer:
        "Force Urbania starts at ₹38/km for outstation trips with a standard 300 km daily minimum and ₹700/day driver Bata, compared to ₹22 to ₹30/km for standard Tempo Travellers."
    }
  ],
  "bangalore-airport-taxi-cab-guide-kempegowda-blr-transfers": [
    {
      question: "How far in advance should I leave for Kempegowda Airport (BLR) from Bangalore city?",
      answer:
        "Leave at least 3.5 hours before domestic departures and 5 hours before international flights if travelling during peak traffic hours (8:30-11:30 AM and 5:30-9:30 PM) from Whitefield, Electronic City, or South Bangalore."
    },
    {
      question: "Do you offer flight tracking and fixed fares for airport pickups at BLR Terminal 1 and 2?",
      answer:
        "Yes. We track incoming flight numbers in real time so your chauffeur is ready when you land, with zero surge pricing multipliers regardless of late-night arrival times."
    }
  ],
  "bangalore-to-chikmagalur-weekend-road-trip-guide": [
    {
      question: "How long does it take to drive from Bangalore to Chikmagalur via NH75?",
      answer:
        "The 245 km drive via NH75 (Bangalore - Nelamangala - Kunigal - Hassan - Belur - Chikmagalur) takes approximately 4.5 to 5 hours on smooth 4-lane highway."
    },
    {
      question: "Can Tempo Travellers reach Mullayanagiri peak in Chikmagalur?",
      answer:
        "Yes, our experienced drivers can navigate the winding road up to the Mullayanagiri parking base steps, where travellers can climb the final 500 steps to the summit temple."
    }
  ],
  "9-seater-tempo-traveller-bangalore-guide": [
    {
      question: "How much does a 9 seater Tempo Traveller cost in Bangalore?",
      answer:
        "With Yogi Tours & Travels, a 9 seater Tempo Traveller costs ₹28/km (AC) for outstation trips, with a 300 km daily minimum and ₹500/day driver Bata, so at least ₹8,900 per day. Tolls, parking, interstate permits and state taxes are extra. A 2-day Bangalore to Coorg round trip, for example, comes to about ₹17,800 plus tolls. Local and airport trips are quoted per trip."
    },
    {
      question: "How many people and how much luggage fit in a 9 seater Tempo Traveller?",
      answer:
        "It seats 9 passengers in forward-facing push-back seats (1x1 and 2x1 layout). There's a dedicated luggage boot plus a roof carrier, with room for about 9 bags."
    },
    {
      question: "Is a 9 seater Tempo Traveller better than booking two cars?",
      answer:
        "For a group of eight or nine, usually yes. One Tempo Traveller means one driver, one driver Bata and one set of tolls, and the whole group travels together. For seven or fewer people, an Innova Crysta at ₹19/km is the more economical choice."
    },
    {
      question: "Which routes from Bangalore suit a 9 seater Tempo Traveller?",
      answer:
        "Popular 9 seater Tempo Traveller routes from Bangalore include Mysore (145 km), Chikmagalur (245 km), Coorg (255 km), Tirupati (255 km), Ooty (275 km), Wayanad (290 km), Hampi (345 km), Mangalore (355 km), Munnar (475 km) and the Kerala backwaters (590 km)."
    },
    {
      question: "Can I book a 9 seater Tempo Traveller for a Bangalore airport pickup?",
      answer:
        "Yes. Yogi Tours & Travels provides 9 seater Tempo Traveller pickups and drops at Kempegowda International Airport (BLR), with the driver briefed on your flight timing. It suits families and teams with too much luggage for one car."
    },
    {
      question: "Where can I find a 9 seater Tempo Traveller near me in Bangalore?",
      answer:
        "Yogi Tours & Travels picks up from any Bangalore locality, including Whitefield, Electronic City, Koramangala, Indiranagar, HSR Layout, Jayanagar, Marathahalli, Hebbal and Yelahanka, as well as Kempegowda International Airport. Bookings are taken 24/7."
    },
    {
      question: "Why book a 9 seater Tempo Traveller with Yogi Tours & Travels?",
      answer:
        "Yogi Tours & Travels has been operating in Bangalore since 2011, and 221 of its 228 Google reviews are five-star (October 2026). It runs under the All India Tourist Permit with commercial-badge chauffeurs, issues GST invoices, and puts the per-km rate, daily minimum and driver Bata in writing before you pay."
    }
  ]
};

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const posts = await publishedBlogPosts();
    res.render("pages/blog-list", {
      title: "Travel Tips & Guides | Yogi Tours & Travels Blog",
      metaDescription:
        "Practical guides on choosing the right vehicle, planning outstation trips from Bangalore, airport transfers and corporate travel — from Yogi Tours & Travels.",
      canonicalPath: "/blog",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" }
      ],
      posts,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/cost/:slug", (req, res, next) => {
  const post = resolveCostPost(req.params.slug);
  if (!post) {
    next();
    return;
  }
  const photo = post.vehicle.imageKey ? `${env.siteUrl}${post.vehicle.imageKey}` : undefined;
  res.render("pages/blog-cost", {
    title: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalPath: post.canonicalPath,
    ogType: "article",
    ...(photo ? { ogImage: photo } : {}),
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: "Cost & Fare Guides", url: "/blog" },
      { name: post.h1, url: post.canonicalPath }
    ],
    post,
    schemas: [
      blogPostingSchema({
        title: post.h1,
        description: post.directAnswerAio,
        url: post.canonicalPath,
        datePublished: "2026-01-15T09:00:00Z",
        dateModified: "2026-10-02T12:00:00Z",
        author: business.name,
        image: photo,
        mentions: [
          { name: post.destination.name, type: "Place" },
          { name: post.origin.name, type: "Place" },
          { name: post.vehicle.name, type: "Product" }
        ]
      }),
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: "Cost & Fare Guides", url: "/blog" },
        { name: post.h1, url: post.canonicalPath }
      ]),
      faqSchema(post.faqs),
      speakableSchema(post.canonicalPath, ["#ai-overview-answer", "#faq"])
    ]
  });
});

router.get("/compare/:slug", (req, res, next) => {
  const post = resolveComparePost(req.params.slug);
  if (!post) {
    next();
    return;
  }
  const photo = post.vehicleB.imageKey ? `${env.siteUrl}${post.vehicleB.imageKey}` : undefined;
  res.render("pages/blog-compare", {
    title: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalPath: post.canonicalPath,
    ogType: "article",
    ...(photo ? { ogImage: photo } : {}),
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: "Vehicle Comparisons", url: "/blog" },
      { name: post.h1, url: post.canonicalPath }
    ],
    post,
    schemas: [
      blogPostingSchema({
        title: post.h1,
        description: post.directAnswerAio,
        url: post.canonicalPath,
        datePublished: "2026-01-20T09:00:00Z",
        dateModified: "2026-10-02T12:00:00Z",
        author: business.name,
        image: photo,
        mentions: [
          { name: post.destination.name, type: "Place" },
          { name: post.vehicleA.name, type: "Product" },
          { name: post.vehicleB.name, type: "Product" }
        ]
      }),
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: "Vehicle Comparisons", url: "/blog" },
        { name: post.h1, url: post.canonicalPath }
      ]),
      faqSchema(post.faqs),
      speakableSchema(post.canonicalPath, ["#ai-overview-answer", "#faq"])
    ]
  });
});

router.get("/itinerary/:slug", (req, res, next) => {
  const post = resolveItineraryPost(req.params.slug);
  if (!post) {
    next();
    return;
  }
  const photo = post.vehicle.imageKey ? `${env.siteUrl}${post.vehicle.imageKey}` : undefined;
  res.render("pages/blog-itinerary", {
    title: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalPath: post.canonicalPath,
    ogType: "article",
    ...(photo ? { ogImage: photo } : {}),
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: "Road Trip Itineraries", url: "/blog" },
      { name: post.h1, url: post.canonicalPath }
    ],
    post,
    schemas: [
      blogPostingSchema({
        title: post.h1,
        description: post.directAnswerAio,
        url: post.canonicalPath,
        datePublished: "2026-02-01T09:00:00Z",
        dateModified: "2026-10-02T12:00:00Z",
        author: business.name,
        image: photo,
        mentions: [
          { name: post.destination.name, type: "Place" },
          { name: post.origin.name, type: "Place" },
          { name: post.vehicle.name, type: "Product" }
        ]
      }),
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: "Road Trip Itineraries", url: "/blog" },
        { name: post.h1, url: post.canonicalPath }
      ]),
      faqSchema(post.faqs),
      speakableSchema(post.canonicalPath, ["#ai-overview-answer", "#faq"])
    ]
  });
});

router.get("/:slug", async (req, res, next) => {
  try {
    const post = await findBlogPostBySlug(req.params.slug);
    if (!post || !post.published) {
      next();
      return;
    }
    const related = (await publishedBlogPosts()).filter((p) => p.id !== post.id).slice(0, 3);
    const absoluteCoverImage = post.coverImageKey ? `${env.siteUrl}${post.coverImageKey}` : undefined;
    const faqs = POST_FAQS[post.slug];

    res.render("pages/blog-post", {
      title: `${post.title} | Yogi Tours & Travels Blog`,
      metaDescription: clampDescription(post.excerpt),
      canonicalPath: `/blog/${post.slug}`,
      // "article" (vs the sitewide default "website") plus the published/modified
      // dates below give AI crawlers (GPTBot, ClaudeBot, Google-Extended) and
      // classic article-type parsers an explicit freshness signal beyond what's
      // already in the BlogPosting JSON-LD.
      ogType: "article",
      articlePublishedTime: toIso(post.publishedAt),
      articleModifiedTime: toIso(post.updatedAt),
      // Falls back to the generic og-default.png in head.ejs when the post has no cover photo.
      ...(absoluteCoverImage ? { ogImage: absoluteCoverImage } : {}),
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: post.title, url: `/blog/${post.slug}` }
      ],
      post,
      related,
      faqs,
      schemas: [
        blogPostingSchema({
          title: post.title,
          description: post.excerpt,
          url: `/blog/${post.slug}`,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: post.author || business.name,
          image: absoluteCoverImage,
          mentions: POST_MENTIONS[post.slug]
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` }
        ]),
        ...(faqs ? [faqSchema(faqs), speakableSchema(`/blog/${post.slug}`, ["#faq"])] : [])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
