import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../src/server/config/env.js";
import {
  vehiclesRepo,
  servicesRepo,
  packagesRepo,
  publishedBlogPosts,
  VEHICLE_CATEGORY_SLUGS,
  vehicleGallery,
  galleryByCategory
} from "../src/server/db/content.js";
import { LOCATIONS } from "../src/server/config/locations.js";
import { TRIP_ROUTES } from "../src/server/config/tripRoutes.js";
import { VEHICLE_GROUPS } from "../src/server/config/vehicleGroups.js";
import { PSEO_VEHICLES, PSEO_ORIGINS } from "../src/server/config/pseoData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toLastmod(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

const STATIC_PATHS: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/fleet", priority: "0.9", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "weekly" },
  { path: "/tour-packages", priority: "0.9", changefreq: "weekly" },
  { path: "/locations", priority: "0.7", changefreq: "monthly" },
  { path: "/routes", priority: "0.8", changefreq: "monthly" },
  { path: "/rent", priority: "0.8", changefreq: "weekly" },
  { path: "/gallery", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-and-conditions", priority: "0.3", changefreq: "yearly" },
  { path: "/cancellation-policy", priority: "0.3", changefreq: "yearly" }
];

async function generateAll() {
  console.log("Generating static GSC XML sitemaps and robots.txt...");
  const siteUrl = "https://www.yogitourstravels.com";
  const today = new Date().toISOString().slice(0, 10);

  const urls: Array<{
    path: string;
    priority: string;
    changefreq: string;
    lastmod?: string;
    images?: Array<{ loc: string; title?: string; caption?: string }>;
  }> = [...STATIC_PATHS];

  for (const cat of VEHICLE_CATEGORY_SLUGS) {
    urls.push({ path: `/fleet/${cat}`, priority: "0.8", changefreq: "weekly" });
  }

  let vehicles: any[] = [];
  let services: any[] = [];
  let packages: any[] = [];
  let blogPosts: any[] = [];
  let galleryItems: any[] = [];

  try {
    [vehicles, services, packages, blogPosts, galleryItems] = await Promise.all([
      vehiclesRepo.all(),
      servicesRepo.all(),
      packagesRepo.all(),
      publishedBlogPosts(),
      galleryByCategory("All")
    ]);
  } catch (err: any) {
    console.warn("  (Local DB offline, using static inventory manifest for export)");
    vehicles = [
      { category: "tempo-traveller", slug: "force-urbania-12-seater-maharaja", name: "Force Urbania 12 Seater Maharaja", tagline: "Luxury 2+1 seating with calf-support recliners", imageKey: "/assets/images/vehicles/urbania-12-seater-maharaja.webp" },
      { category: "tempo-traveller", slug: "force-urbania-17-seater-luxury", name: "Force Urbania 17 Seater Luxury", tagline: "Executive high-roof luxury van", imageKey: "/assets/images/vehicles/force-urbania--hero-interior.webp" },
      { category: "tempo-traveller", slug: "force-urbania", name: "Force Urbania Luxury Van", tagline: "Bespoke Maharaja luxury van", imageKey: "/assets/images/vehicles/force-urbania.webp" },
      { category: "tempo-traveller", slug: "9-seater-tempo-traveller", name: "9 Seater Tempo Traveller", tagline: "Push-back seats with AC", imageKey: "/assets/images/vehicles/tempo-traveller-12-seater.webp" },
      { category: "tempo-traveller", slug: "maharaja-tempo-traveller", name: "12 Seater Tempo Traveller", tagline: "Maharaja luxury sofa seating", imageKey: "/assets/images/vehicles/tempo-traveller-12-seater.webp" },
      { category: "tempo-traveller", slug: "tempo-traveller-17-seater", name: "17 Seater Tempo Traveller", tagline: "Executive group tour van", imageKey: "/assets/images/vehicles/tempo-traveller-17-seater.webp" },
      { category: "car", slug: "innova-crysta", name: "Toyota Innova Crysta", tagline: "Premium 7-seater MUV with captain seats", imageKey: "/assets/images/vehicles/innova-crysta.webp" },
      { category: "car", slug: "maruti-swift-dzire", name: "Maruti Swift Dzire", tagline: "Economical compact sedan", imageKey: "/assets/images/vehicles/maruti-swift-dzire.webp" },
      { category: "car", slug: "maruti-ertiga", name: "Maruti Ertiga", tagline: "Spacious 6-seater family MUV", imageKey: "/assets/images/vehicles/maruti-ertiga.webp" },
      { category: "car", slug: "toyota-innova", name: "Toyota Innova", tagline: "Reliable 7-seater workhorse", imageKey: "/assets/images/vehicles/toyota-innova.webp" },
      { category: "car", slug: "innova-hycross", name: "Toyota Innova Hycross", tagline: "Modern hybrid 7-seater", imageKey: "/assets/images/vehicles/innova-hycross.webp" },
      { category: "mini-bus", slug: "21-seater-mini-bus", name: "21 Seater Mini Bus", tagline: "Push-back 2+2 seating", imageKey: "/assets/images/vehicles/21-seater-mini-bus.webp" },
      { category: "mini-bus", slug: "25-seater-mini-bus", name: "25 Seater Mini Bus", tagline: "Executive 2+2 mini coach", imageKey: "/assets/images/vehicles/25-seater-mini-bus.webp" },
      { category: "tourist-bus", slug: "33-seater-bus", name: "33 Seater Tourist Bus", tagline: "Air-conditioned 2+2 coach", imageKey: "/assets/images/vehicles/33-seater-bus.webp" },
      { category: "tourist-bus", slug: "40-seater-bus", name: "40 Seater Tourist Bus", tagline: "High-capacity corporate coach", imageKey: "/assets/images/vehicles/40-seater-bus.webp" },
      { category: "tourist-bus", slug: "45-seater-bus", name: "45 Seater Tourist Bus", tagline: "Long-distance group bus", imageKey: "/assets/images/vehicles/45-seater-bus.webp" },
      { category: "tourist-bus", slug: "49-seater-bus", name: "49 Seater Tourist Bus", tagline: "Premium South India touring coach", imageKey: "/assets/images/vehicles/49-seater-bus.webp" },
      { category: "tourist-bus", slug: "50-seater-bus", name: "50 Seater Tourist Bus", tagline: "Full-size tourist bus", imageKey: "/assets/images/vehicles/50-seater-bus.webp" },
      { category: "tourist-bus", slug: "55-seater-bus", name: "55 Seater Tourist Bus", tagline: "Maximum capacity group coach", imageKey: "/assets/images/vehicles/55-seater-bus.webp" }
    ];
    services = [
      { slug: "outstation-cabs", name: "Outstation Cabs Bangalore", shortDescription: "Round-trip and one-way outstation cab rental from Bangalore with transparent per-km billing." },
      { slug: "local-car-rental", name: "Local Car Rental Bangalore", shortDescription: "Hourly and daily package car rentals with experienced drivers across Bengaluru." },
      { slug: "airport-taxi-bangalore", name: "Airport Taxi Bangalore", shortDescription: "24/7 on-time pickup and drop to Kempegowda International Airport (BLR)." },
      { slug: "corporate-car-rental", name: "Corporate Car Rental", shortDescription: "Dedicated fleet and monthly transport solutions for companies in Bangalore." },
      { slug: "wedding-car-rental", name: "Wedding Car & Guest Transport", shortDescription: "Luxury cars and guest transport convoys for weddings and milestone celebrations." },
      { slug: "tempo-traveller-rental", name: "Tempo Traveller Rental Bangalore", shortDescription: "9, 12, 17 seater Tempo Travellers and Force Urbania for group travel." },
      { slug: "bus-rental-bangalore", name: "Bus & Coach Rental Bangalore", shortDescription: "21 to 55 seater tourist buses and coaches with push-back seats and AC." },
      { slug: "sightseeing-tours", name: "Bangalore Sightseeing Tours", shortDescription: "Guided day tours covering Vidhana Soudha, Lalbagh, Bangalore Palace and ISKCON." }
    ];
    packages = [
      { slug: "bangalore-to-mysore-1-day", title: "Bangalore to Mysore 1-Day Tour", duration: "1 Day", destination: "Mysore" },
      { slug: "bangalore-to-coorg-3-days", title: "Bangalore to Coorg 3-Day Package", duration: "3 Days", destination: "Coorg" },
      { slug: "bangalore-to-chikmagalur-2-days", title: "Bangalore to Chikmagalur 2-Day Tour", duration: "2 Days", destination: "Chikmagalur" },
      { slug: "bangalore-to-ooty-3-days", title: "Bangalore to Ooty 3-Day Tour", duration: "3 Days", destination: "Ooty" },
      { slug: "bangalore-to-wayanad-3-days", title: "Bangalore to Wayanad 3-Day Package", duration: "3 Days", destination: "Wayanad" },
      { slug: "bangalore-to-tirupati-1-day", title: "Bangalore to Tirupati 1-Day Package", duration: "1 Day", destination: "Tirupati" },
      { slug: "bangalore-to-kodaikanal-3-days", title: "Bangalore to Kodaikanal 3-Day Tour", duration: "3 Days", destination: "Kodaikanal" },
      { slug: "bangalore-to-kabini-2-days", title: "Bangalore to Kabini 2-Day Safari Tour", duration: "2 Days", destination: "Kabini" },
      { slug: "bangalore-to-hampi-3-days", title: "Bangalore to Hampi Heritage Tour", duration: "3 Days", destination: "Hampi" },
      { slug: "bangalore-to-pondicherry-3-days", title: "Bangalore to Pondicherry Tour", duration: "3 Days", destination: "Pondicherry" }
    ];
    blogPosts = [
      { slug: "force-urbania-rental-bangalore-guide", title: "Complete Guide to Force Urbania Rental in Bangalore: Pricing, Features & Comparison", excerpt: "Everything you need to know about renting a Force Urbania in Bangalore." },
      { slug: "bangalore-to-coorg-road-trip-guide", title: "Bangalore to Coorg Road Trip Guide: Best Routes, Stops & Vehicle Recommendations", excerpt: "A complete guide to planning your road trip from Bangalore to Coorg." },
      { slug: "tempo-traveller-rental-bangalore-guide", title: "Tempo Traveller Rental in Bangalore: Complete Seating, Pricing & Booking Guide", excerpt: "How to choose between 9, 12, and 17 seater Tempo Travellers for your group trip." }
    ];
    galleryItems = [
      { imageKey: "/assets/images/gallery/force-urbania-luxury-cabin-interior.webp", caption: "Force Urbania Luxury Cabin Interior", altText: "Force Urbania luxury cabin with Maharaja recliners and ambient blue neon lighting" },
      { imageKey: "/assets/images/gallery/force-urbania-maharaja-recliner-seat.webp", caption: "Maharaja Recliner Captain Seats with Calf Rest", altText: "Motorized calf-support captain seats in Force Urbania" },
      { imageKey: "/assets/images/gallery/force-urbania-entertainment-smart-tv.webp", caption: "Mounted Sony Bravia Smart LED TV", altText: "On-board entertainment system in Force Urbania" },
      { imageKey: "/assets/images/gallery/force-urbania-onboard-chiller-fridge.webp", caption: "Blackcat On-Board Refrigerator & Chiller", altText: "Chilled beverages box in Force Urbania" }
    ];
  }

  const galleryEntry = urls.find((u) => u.path === "/gallery");
  if (galleryEntry && galleryItems.length > 0) {
    galleryEntry.images = galleryItems
      .filter((g) => Boolean(g.imageKey))
      .map((g) => ({
        loc: g.imageKey.startsWith("http") ? g.imageKey : `${siteUrl}${g.imageKey}`,
        title: g.caption || "Yogi Tours & Travels Fleet Gallery Bangalore",
        caption: g.altText || "Bangalore car, tempo traveller, and tourist bus rental photo"
      }));
  }

  for (const v of vehicles) {
    const gallery = vehicleGallery(v);
    const vehicleImages: Array<{ loc: string; title?: string; caption?: string }> = [];

    if (v.imageKey) {
      vehicleImages.push({
        loc: v.imageKey.startsWith("http") ? v.imageKey : `${siteUrl}${v.imageKey}`,
        title: `${v.name} Rental Bangalore`,
        caption: `${v.name} available for hire with driver in Bangalore — ${v.tagline}`
      });
    }

    for (const g of gallery) {
      const fullUrl = g.startsWith("http") ? g : `${siteUrl}${g}`;
      if (!vehicleImages.some((img) => img.loc === fullUrl)) {
        vehicleImages.push({
          loc: fullUrl,
          title: `${v.name} Cabin & Seating Experience — Bangalore`,
          caption: `${v.name} authentic fleet photo by Yogi Tours & Travels Bangalore`
        });
      }
    }

    const isPriorityVehicle =
      v.slug.includes("urbania") ||
      v.slug === "innova-crysta" ||
      v.slug.includes("17-seater") ||
      v.slug.includes("12-seater");

    urls.push({
      path: `/fleet/${v.category}/${v.slug}`,
      priority: isPriorityVehicle ? "0.9" : "0.8",
      changefreq: "weekly",
      lastmod: toLastmod(v.updatedAt),
      images: vehicleImages.length > 0 ? vehicleImages : undefined
    });
  }

  for (const s of services) {
    urls.push({
      path: `/services/${s.slug}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: toLastmod(s.updatedAt),
      images: s.imageKey
        ? [{ loc: s.imageKey.startsWith("http") ? s.imageKey : `${siteUrl}${s.imageKey}`, title: `${s.name} Bangalore`, caption: s.shortDescription }]
        : undefined
    });
  }

  for (const p of packages) {
    urls.push({
      path: `/tour-packages/${p.slug}`,
      priority: "0.8",
      changefreq: "weekly",
      images: p.imageKey
        ? [{ loc: p.imageKey.startsWith("http") ? p.imageKey : `${siteUrl}${p.imageKey}`, title: `${p.title} Tour from Bangalore`, caption: `${p.title} (${p.duration}, ${p.destination}) by Yogi Tours & Travels` }]
        : undefined
    });
  }

  for (const post of blogPosts) {
    urls.push({
      path: `/blog/${post.slug}`,
      priority: "0.6",
      changefreq: "monthly",
      lastmod: toLastmod(post.updatedAt),
      images: post.coverImageKey
        ? [{ loc: post.coverImageKey.startsWith("http") ? post.coverImageKey : `${siteUrl}${post.coverImageKey}`, title: post.title, caption: post.excerpt }]
        : undefined
    });
  }

  for (const l of LOCATIONS) {
    urls.push({ path: `/locations/car-rental-${l.slug}`, priority: "0.6", changefreq: "monthly" });
  }

  for (const r of TRIP_ROUTES) {
    urls.push({ path: `/routes/${r.slug}`, priority: "0.7", changefreq: "monthly" });
  }

  for (const g of VEHICLE_GROUPS) {
    const hasVehicle = vehicles.some((v) => v.category === g.category && (g.seats === undefined || v.seats === g.seats));
    if (!hasVehicle) continue;
    for (const l of LOCATIONS) {
      urls.push({ path: `/${g.slug}/${l.slug}`, priority: "0.6", changefreq: "monthly" });
    }
  }

  // Outstation Rental Directory Hub and Vehicle Hubs
  for (const pv of PSEO_VEHICLES) {
    const vImages = pv.imageKey
      ? [
          {
            loc: pv.imageKey.startsWith("http") ? pv.imageKey : `${siteUrl}${pv.imageKey}`,
            title: `${pv.name} Outstation Rental Bangalore`,
            caption: `${pv.name} for hire from Bangalore — ${pv.highlight}`
          }
        ]
      : [];
    urls.push({
      path: `/rent/${pv.slug}`,
      priority: "0.8",
      changefreq: "weekly",
      images: vImages.length > 0 ? vImages : undefined
    });
  }

  // High-priority canonical outstation pSEO landing pages
  const topDestSlugs = [
    "coorg",
    "mysore",
    "ooty",
    "wayanad",
    "tirupati",
    "chikmagalur",
    "sakleshpur",
    "goa",
    "pondicherry",
    "hampi",
    "gokarna",
    "kabini"
  ];
  const priorityVehicles = PSEO_VEHICLES.filter((v) =>
    ["swift-dzire", "ertiga", "innova-crysta", "innova-hycross", "force-urbania", "12-seater-tempo"].includes(v.slug)
  );

  for (const v of priorityVehicles) {
    const vPhoto = v.imageKey
      ? [
          {
            loc: v.imageKey.startsWith("http") ? v.imageKey : `${siteUrl}${v.imageKey}`,
            title: `${v.name} Outstation Cab Rental Bangalore`,
            caption: `Hire ${v.name} from Bangalore with driver`
          }
        ]
      : undefined;

    for (const o of PSEO_ORIGINS) {
      for (const dSlug of topDestSlugs) {
        urls.push({
          path: `/rent/${v.slug}/${o.slug}-to-${dSlug}`,
          priority: "0.7",
          changefreq: "monthly",
          images: vPhoto
        });
      }
    }
  }

  // Programmatic Blog Spoke Pages (Cost, Compare, Itinerary)
  for (const dSlug of topDestSlugs) {
    for (const v of priorityVehicles) {
      urls.push({
        path: `/blog/cost/bangalore-to-${dSlug}-${v.slug}`,
        priority: "0.7",
        changefreq: "monthly"
      });
    }

    urls.push({
      path: `/blog/compare/force-urbania-vs-innova-crysta-for-${dSlug}`,
      priority: "0.7",
      changefreq: "monthly"
    });
    urls.push({
      path: `/blog/compare/ertiga-vs-innova-crysta-for-${dSlug}`,
      priority: "0.7",
      changefreq: "monthly"
    });

    for (const o of PSEO_ORIGINS.slice(0, 5)) {
      urls.push({
        path: `/blog/itinerary/${o.slug}-to-${dSlug}-weekend-trip`,
        priority: "0.7",
        changefreq: "monthly"
      });
    }
  }

  // 1. Write sitemap-pages.xml
  const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${siteUrl}${escapeXml(u.path)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(publicDir, "sitemap-pages.xml"), pagesXml, "utf8");
  console.log(`  ✓ Generated: public/sitemap-pages.xml (${urls.length} URLs)`);

  // 2. Write sitemap-images.xml
  const urlsWithImages = urls.filter((u) => u.images && u.images.length > 0);
  const imagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsWithImages
  .map(
    (u) => `  <url>
    <loc>${siteUrl}${escapeXml(u.path)}</loc>
${(u.images || [])
  .map(
    (img) => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>${img.title ? `\n      <image:title>${escapeXml(img.title)}</image:title>` : ""}${img.caption ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
      <image:geo_location>Bengaluru, Karnataka, India</image:geo_location>
    </image:image>`
  )
  .join("\n")}
  </url>`
  )
  .join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(publicDir, "sitemap-images.xml"), imagesXml, "utf8");
  console.log(`  ✓ Generated: public/sitemap-images.xml (${urlsWithImages.length} URLs with images)`);

  // 3. Write sitemap-videos.xml
  const videosXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${siteUrl}/fleet/tempo-traveller/force-urbania-12-seater-maharaja</loc>
    <video:video>
      <video:thumbnail_loc>${siteUrl}/assets/images/gallery/force-urbania-luxury-cabin-interior.webp</video:thumbnail_loc>
      <video:title>Force Urbania 12 Seater Maharaja Luxury Cabin Walkthrough — Bangalore</video:title>
      <video:description>Authentic video walkthrough of the 12 Seater Force Urbania Maharaja van in Bangalore. Features motorized calf-support captain recliners, Sony Bravia Smart LED TV, on-board chiller box, and ambient blue neon ceiling.</video:description>
      <video:content_loc>${siteUrl}/assets/video/force-urbania-luxury-walkthrough.mp4</video:content_loc>
      <video:duration>104</video:duration>
      <video:publication_date>2026-10-01T10:30:00+05:30</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>
  <url>
    <loc>${siteUrl}/fleet/tempo-traveller/force-urbania-17-seater-luxury</loc>
    <video:video>
      <video:thumbnail_loc>${siteUrl}/assets/images/gallery/force-urbania-luxury-cabin-interior.webp</video:thumbnail_loc>
      <video:title>Force Urbania 17 Seater Executive Van Walkthrough — Bangalore Rental</video:title>
      <video:description>Video tour of the 17 Seater Force Urbania luxury van available for hire with driver in Bangalore. Designed for corporate and family tours with panoramic windows, individual AC vents, and USB charging ports.</video:description>
      <video:content_loc>${siteUrl}/assets/video/force-urbania-luxury-walkthrough.mp4</video:content_loc>
      <video:duration>104</video:duration>
      <video:publication_date>2026-10-01T10:30:00+05:30</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>
  <url>
    <loc>${siteUrl}/fleet/tempo-traveller/force-urbania</loc>
    <video:video>
      <video:thumbnail_loc>${siteUrl}/assets/images/gallery/force-urbania-luxury-cabin-interior.webp</video:thumbnail_loc>
      <video:title>Force Urbania Luxury Van Hire Bangalore — Full Interior &amp; Features Walkthrough</video:title>
      <video:description>Detailed video demonstration of the Force Urbania luxury passenger van fleet in Bangalore by Yogi Tours &amp; Travels.</video:description>
      <video:content_loc>${siteUrl}/assets/video/force-urbania-luxury-walkthrough.mp4</video:content_loc>
      <video:duration>104</video:duration>
      <video:publication_date>2026-10-01T10:30:00+05:30</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>
  <url>
    <loc>${siteUrl}/</loc>
    <video:video>
      <video:thumbnail_loc>${siteUrl}/assets/images/destinations/hero-bangalore.webp</video:thumbnail_loc>
      <video:title>Yogi Tours &amp; Travels Bangalore — Luxury Fleet &amp; Outstation Cab Service</video:title>
      <video:description>Overview of Yogi Tours &amp; Travels verified passenger fleet in Bangalore, covering cars, tempo travellers, and tourist buses across Karnataka and South India.</video:description>
      <video:content_loc>${siteUrl}/assets/video/hero-background.mp4</video:content_loc>
      <video:duration>30</video:duration>
      <video:publication_date>2026-10-01T09:00:00+05:30</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(publicDir, "sitemap-videos.xml"), videosXml, "utf8");
  console.log(`  ✓ Generated: public/sitemap-videos.xml (GSC Video indexing compliant)`);

  // 4. Write sitemap.xml (Master Index)
  const masterIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-images.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-videos.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), masterIndexXml, "utf8");
  console.log(`  ✓ Generated: public/sitemap.xml (Master Sitemap Index)`);

  // 5. Write robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

# Disallow legacy WordPress paths & spam query parameters to stop crawl waste
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-content/
Disallow: /xmlrpc.php
Disallow: /wp-json/
Disallow: /trackback/
Disallow: /comments/
Disallow: /feed/
Disallow: /*?*s=*
Disallow: /*?*p=*
Disallow: /*?*attachment_id=*
Disallow: /*?*replytocom=*
Disallow: /*?*author=*

# Major Search Engines
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-Video
Allow: /

User-agent: bingbot
Allow: /

# Generative AI, LLM & Answer Engine Crawlers (AEO / GEO / AIEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Meta-ExternalFetcher
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap-pages.xml
Sitemap: ${siteUrl}/sitemap-images.xml
Sitemap: ${siteUrl}/sitemap-videos.xml
`;
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");
  console.log(`  ✓ Updated:   public/robots.txt (Master & Sub Sitemaps, AI Search Engines)`);
}

generateAll().catch((err) => {
  console.error("Static sitemap generation error:", err);
  process.exit(1);
});
