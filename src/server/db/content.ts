import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRepo, parseJsonArray } from "./repo.js";
import { cached } from "../utils/cache.js";
import type {
  Vehicle,
  Service,
  TourPackage,
  Faq,
  Testimonial,
  GalleryItem,
  BlogPost,
  VehicleCategory,
  GalleryCategory
} from "../types/models.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../../public");

export const VEHICLE_SLUG_ALIASES: Record<string, string> = {
  "9-seater-tempo-traveller": "tempo-traveller-12-seater",
  "tempo-traveller-12-seater": "9-seater-tempo-traveller"
};

/**
 * Resolves the primary customer-facing image for a vehicle.
 * Checks the database imageKey first; if empty, missing, or pointing to a non-existent file,
 * dynamically discovers the best matching photo from public/assets/images/vehicles.
 */
export function resolveVehicleImage(v: { slug: string; category?: string; imageKey?: string | null }): string {
  if (v.imageKey && v.imageKey.trim() !== "") {
    const local = path.join(publicDir, v.imageKey.replace(/^\//, ""));
    if (fs.existsSync(local)) return v.imageKey;
  }

  const vDir = path.join(publicDir, "assets/images/vehicles");
  if (!fs.existsSync(vDir)) return v.imageKey || "";

  const extensions = [".webp", ".jpg", ".jpeg", ".png"];
  const suffixes = ["--front-01", "--exterior-hero", "--exterior", "--front-grey", ""];

  const slugsToTry = [v.slug];
  const alias = VEHICLE_SLUG_ALIASES[v.slug];
  if (alias) slugsToTry.push(alias);

  for (const s of slugsToTry) {
    for (const suffix of suffixes) {
      for (const ext of extensions) {
        const candidate = `${s}${suffix}${ext}`;
        if (fs.existsSync(path.join(vDir, candidate))) {
          return `/assets/images/vehicles/${candidate}`;
        }
      }
    }
  }

  // Fallbacks by category
  if (v.category === "tourist-bus") {
    if (fs.existsSync(path.join(vDir, "tourist-bus-40-seater--front-01.jpg"))) {
      return "/assets/images/vehicles/tourist-bus-40-seater--front-01.jpg";
    }
  }

  return v.imageKey || "";
}

export function hydrateVehicle<T extends Vehicle>(v: T): T {
  const resolved = resolveVehicleImage(v);
  if (resolved && v.imageKey !== resolved) {
    return { ...v, imageKey: resolved };
  }
  return v;
}

const baseVehiclesRepo = createRepo<Vehicle>({ table: "vehicles" });
export const vehiclesRepo = {
  ...baseVehiclesRepo,
  async all(): Promise<Vehicle[]> {
    const list = await baseVehiclesRepo.all();
    return list.map((item) => hydrateVehicle(item));
  },
  async allWhere(whereSql: string, ...params: unknown[]): Promise<Vehicle[]> {
    const list = await baseVehiclesRepo.allWhere(whereSql, ...params);
    return list.map((item) => hydrateVehicle(item));
  },
  async findById(id: number): Promise<Vehicle | undefined> {
    const item = await baseVehiclesRepo.findById(id);
    return item ? hydrateVehicle(item) : undefined;
  },
  async findBySlug(slug: string): Promise<Vehicle | undefined> {
    const item = await baseVehiclesRepo.findBySlug(slug);
    return item ? hydrateVehicle(item) : undefined;
  }
};

export const servicesRepo = createRepo<Service>({ table: "services" });
export const packagesRepo = createRepo<TourPackage>({ table: "packages" });
export const faqsRepo = createRepo<Faq>({ table: "faqs" });
export const testimonialsRepo = createRepo<Testimonial>({ table: "testimonials" });
export const galleryRepo = createRepo<GalleryItem>({ table: "gallery" });
export const blogRepo = createRepo<BlogPost>({ table: "blog_posts", orderBy: '"publishedAt" DESC' });

/**
 * Reusable sort: vehicle TYPE first (Cars, then Tempo Travellers, then Mini
 * Buses, then Tourist Buses — VEHICLE_CATEGORY_SLUGS order, smallest
 * passenger class to largest), then seat count ascending within that
 * category, then alphabetical (case-insensitive, numeric-aware) by name as
 * a tie-break for same-seat vehicles. Apply this to any vehicle list right
 * before rendering cards — never rely on sortOrder/id/insertion order for
 * customer-facing display. Calling it on an already-single-category list
 * (vehiclesByCategory) is a no-op for the category comparison, so the same
 * function is safe to use everywhere.
 *
 * Seats-first (not name-first) is deliberate: with real vehicle names like
 * "Force Urbania" and "Maharaja Tempo Traveller" that don't lead with a
 * seat count the way "9 Seater Tempo Traveller" does, alphabetical-by-name
 * scattered them out of seat order entirely (Force Urbania's 17 seats
 * sorted ahead of the 9- and 12-seaters). Seat-ascending is also just the
 * more useful order for a customer comparing vehicles by group size.
 */
export function sortVehiclesAlphabetically<T extends { name: string; seats: number; category: VehicleCategory }>(
  vehicles: T[]
): T[] {
  return [...vehicles].sort((a, b) => {
    const categoryComparison = VEHICLE_CATEGORY_SLUGS.indexOf(a.category) - VEHICLE_CATEGORY_SLUGS.indexOf(b.category);
    if (categoryComparison !== 0) return categoryComparison;

    const seatComparison = a.seats - b.seats;
    if (seatComparison !== 0) return seatComparison;

    // Tie-break for two vehicles with the same seat count (e.g. Toyota
    // Innova Crysta vs Hycross, both 7 seats): alphabetical, numeric-aware.
    return a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: "base", numeric: true });
  });
}

// Public content changes only through /admin, which is rare — a short cache
// here trades a few minutes of staleness after an edit (bumpCacheVersion()
// in admin/crud.ts clears it immediately anyway) for skipping a DB round-trip
// on every one of these calls for every anonymous visitor.
const CONTENT_CACHE_TTL_SECONDS = 300;

export async function vehiclesByCategory(category: VehicleCategory): Promise<Vehicle[]> {
  return cached(`vehicles:byCategory:${category}`, CONTENT_CACHE_TTL_SECONDS, async () => {
    const vehicles = await vehiclesRepo.allWhere("category = ?", category);
    return sortVehiclesAlphabetically(vehicles);
  });
}

function normalizeVehicleLabel(s: string): string {
  return s.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Best-effort match between a free-text vehicle label (e.g. a tour
 * package's vehicleOptions entry, often a shorthand like "Innova Crysta")
 * and a real fleet vehicle, for internal linking. Exact match first, then
 * a single-candidate substring match; returns null rather than guessing
 * when the label is generic (e.g. "Sedan"), ambiguous, or refers to a
 * vehicle no longer in the fleet — callers must render plain, unlinked
 * text in that case rather than link to a guess or a dead page.
 */
export function matchVehicleByLabel(label: string, vehicles: Vehicle[]): Vehicle | null {
  const norm = normalizeVehicleLabel(label);
  if (!norm) return null;
  const exact = vehicles.find((v) => normalizeVehicleLabel(v.name) === norm);
  if (exact) return exact;
  const candidates = vehicles.filter((v) => {
    const vn = normalizeVehicleLabel(v.name);
    return vn.includes(norm) || norm.includes(vn);
  });
  return candidates.length === 1 ? candidates[0]! : null;
}

/**
 * Reverse lookup for the vehicle detail page: tour packages whose
 * vehicleOptions mentions this vehicle, using the same matching rule as
 * matchVehicleByLabel so the two stay consistent in both directions.
 */
export async function packagesForVehicle(vehicle: Vehicle): Promise<TourPackage[]> {
  return cached(`packages:forVehicle:${vehicle.id}`, CONTENT_CACHE_TTL_SECONDS, async () => {
    const allPackages = await packagesRepo.all();
    return allPackages.filter((p) => packageVehicleOptions(p).some((opt) => matchVehicleByLabel(opt, [vehicle]) !== null));
  });
}

export async function featuredPackages(limit = 6): Promise<TourPackage[]> {
  return cached(`packages:featured:${limit}`, CONTENT_CACHE_TTL_SECONDS, async () =>
    (await packagesRepo.allWhere("featured = 1")).slice(0, limit)
  );
}

export async function featuredServices(limit = 6): Promise<Service[]> {
  return cached(`services:featured:${limit}`, CONTENT_CACHE_TTL_SECONDS, async () =>
    (await servicesRepo.allWhere("featured = 1")).slice(0, limit)
  );
}

export async function publishedBlogPosts(): Promise<BlogPost[]> {
  return cached("blog:published", CONTENT_CACHE_TTL_SECONDS, () => blogRepo.allWhere("published = 1"));
}

const DEFAULT_CATEGORY_PHOTOS: Record<GalleryCategory, Array<{ imageKey: string; altText: string; caption: string }>> = {
  Vehicles: [
    {
      imageKey: "/assets/images/gallery/force-urbania-luxury-cabin-interior.webp",
      altText: "Force Urbania Maharaja luxury cabin interior with Sony TV and recliner captain seats",
      caption: "Force Urbania Maharaja Cabin"
    },
    {
      imageKey: "/assets/images/gallery/force-urbania-front-exterior.webp",
      altText: "Force Urbania metallic dark grey exterior front view in Bangalore",
      caption: "Force Urbania Exterior"
    },
    {
      imageKey: "/assets/images/gallery/urbania-12-seater-maharaja-white-exterior.webp",
      altText: "12 Seater Maharaja Force Urbania pearl white van with tinted panoramic windows",
      caption: "12 Seater Maharaja Urbania"
    },
    {
      imageKey: "/assets/images/gallery/force-urbania-maharaja-recliner-seat.webp",
      altText: "Custom Maharaja recliner captain seat with extendable calf rest and footrest",
      caption: "Maharaja Recliner Seat with Footrest"
    },
    {
      imageKey: "/assets/images/gallery/urbania-12-seater-maharaja-neon-ceiling.webp",
      altText: "Urbania 12 Seater Maharaja cabin with dual blue neon ceiling mood lighting",
      caption: "Dual Blue Neon Ambient Ceiling"
    }
  ],
  Corporate: [
    {
      imageKey: "/assets/images/gallery/force-urbania-driver-cockpit-dashboard.webp",
      altText: "Executive cockpit with ivory dash, wood-finish center console and infotainment screen",
      caption: "Executive Cockpit & Dashboard"
    },
    {
      imageKey: "/assets/images/gallery/force-urbania-onboard-chiller-fridge.webp",
      altText: "On-board Blackcat refrigerator and chiller box for corporate delegating travel",
      caption: "On-board Beverage Chiller"
    },
    {
      imageKey: "/assets/images/gallery/force-urbania-entertainment-smart-tv.webp",
      altText: "Mounted Sony Bravia Smart LED TV for on-road corporate presentations and media",
      caption: "Sony Bravia Smart TV"
    }
  ],
  "Group Travel": [
    {
      imageKey: "/assets/images/gallery/urbania-12-seater-maharaja-tan-leather-seats.webp",
      altText: "Tan leather luxury captain seating for group outstation travel from Bangalore",
      caption: "Tan Leather Captain Seating"
    },
    {
      imageKey: "/assets/images/gallery/force-urbania-blue-ambient-lighting.webp",
      altText: "Ambient blue LED seat illumination and USB fast chargers for night travel",
      caption: "Night Travel Ambient Illumination"
    },
    {
      imageKey: "/assets/images/gallery/tempo-traveller-exterior-view.jpg",
      altText: "Tempo Traveller prepared for group outstation journey",
      caption: "Group Tempo Traveller"
    }
  ],
  Tours: [
    {
      imageKey: "/assets/images/gallery/ooty-tea-garden-panorama-01.jpg",
      altText: "Scenic tea estate vista on Bangalore to Ooty hill tour",
      caption: "Ooty Tea Garden Vista"
    },
    {
      imageKey: "/assets/images/gallery/ghat-road-mountain-viewpoint-01.jpg",
      altText: "Mountain pass drive on Karnataka Western Ghats route",
      caption: "Western Ghats Mountain Drive"
    },
    {
      imageKey: "/assets/images/gallery/misty-hills-panorama.jpg",
      altText: "Misty morning hill roads on outstation holiday",
      caption: "Misty Mountain Trail"
    }
  ],
  Weddings: [
    {
      imageKey: "/assets/images/gallery/coastal-resort-lawn-palms-01.jpg",
      altText: "Wedding destination resort venue transportation in Karnataka",
      caption: "Destination Wedding Venue"
    },
    {
      imageKey: "/assets/images/gallery/urbania-12-seater-maharaja-white-exterior.webp",
      altText: "White Force Urbania VIP wedding guest shuttle in Bangalore",
      caption: "White Urbania Wedding Shuttle"
    }
  ],
  Destinations: [
    {
      imageKey: "/assets/images/gallery/tirupati-hills-temple-gopuram.jpg",
      altText: "Tirupati Balaji temple gopuram on outstation pilgrimage package from Bangalore",
      caption: "Tirupati Temple Gopuram"
    },
    {
      imageKey: "/assets/images/gallery/forest-waterfall-view.jpg",
      altText: "Waterfalls near Coorg and Western Ghats tour",
      caption: "Coorg Waterfall Sight"
    },
    {
      imageKey: "/assets/images/gallery/coastal-resort-palm-silhouette-dusk.jpg",
      altText: "Goa beach road trip sunset destination",
      caption: "Coastal Goa Road Trip"
    }
  ]
};

export async function galleryByCategory(category: GalleryCategory | "All"): Promise<GalleryItem[]> {
  return cached(`gallery:byCategory:${category}`, CONTENT_CACHE_TTL_SECONDS, async () => {
    const rawItems = category === "All" ? await galleryRepo.all() : await galleryRepo.allWhere("category = ?", category);
    
    // If raw items have photos set, return them
    const withPhotos = rawItems.filter((i) => i.imageKey && i.imageKey.trim() !== "");
    if (withPhotos.length > 0) return rawItems;

    // Fallback enrich with authentic fleet assets
    if (category === "All") {
      const allDefaults: GalleryItem[] = [];
      let nextId = 1;
      for (const [cat, photos] of Object.entries(DEFAULT_CATEGORY_PHOTOS)) {
        for (const p of photos) {
          allDefaults.push({
            id: nextId++,
            category: cat as GalleryCategory,
            imageKey: p.imageKey,
            altText: p.altText,
            caption: p.caption,
            sortOrder: nextId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      return allDefaults;
    }

    const defaults = DEFAULT_CATEGORY_PHOTOS[category] || [];
    return defaults.map((p, idx) => ({
      id: idx + 1,
      category,
      imageKey: p.imageKey,
      altText: p.altText,
      caption: p.caption,
      sortOrder: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  });
}

const GALLERY_CATEGORY_ICONS: Record<GalleryCategory, string> = {
  Vehicles: "car",
  Tours: "mountain",
  "Group Travel": "users-group",
  Corporate: "building",
  Weddings: "heart",
  Destinations: "map-pin"
};

/**
 * One real photo per gallery category, for the homepage teaser.
 */
export async function galleryPreview(): Promise<
  Array<{ category: GalleryCategory; icon: string; imageKey: string; altText: string }>
> {
  return cached("gallery:preview", CONTENT_CACHE_TTL_SECONDS, async () => {
    const categories: GalleryCategory[] = ["Vehicles", "Tours", "Group Travel", "Corporate", "Weddings", "Destinations"];
    const items = await Promise.all(
      categories.map(async (category) => {
        const [first] = await galleryRepo.allWhere('category = ? AND "imageKey" != \'\'', category);
        if (first) {
          return { category, icon: GALLERY_CATEGORY_ICONS[category], imageKey: first.imageKey, altText: first.altText };
        }
        const defaultItem = DEFAULT_CATEGORY_PHOTOS[category]?.[0];
        return defaultItem
          ? { category, icon: GALLERY_CATEGORY_ICONS[category], imageKey: defaultItem.imageKey, altText: defaultItem.altText }
          : null;
      })
    );
    return items.filter((i): i is NonNullable<typeof i> => i !== null);
  });
}

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  car: "Cars",
  "tempo-traveller": "Tempo Travellers",
  "mini-bus": "Mini Buses",
  "tourist-bus": "Tourist Buses"
};

export const VEHICLE_CATEGORY_SLUGS: VehicleCategory[] = ["car", "tempo-traveller", "mini-bus", "tourist-bus"];

/**
 * Lowest admin-entered ratePerKm per category, for the homepage pricing
 * table. Categories with no vehicle that has a rate set yet come back with
 * `startingFrom: null` so the view can show "Contact for price" instead of
 * a fabricated number.
 */
export async function startingPriceByCategory(): Promise<
  Array<{ category: VehicleCategory; startingFrom: number | null }>
> {
  return cached("pricing:startingByCategory", CONTENT_CACHE_TTL_SECONDS, () =>
    Promise.all(
      VEHICLE_CATEGORY_SLUGS.map(async (category) => {
        const vehicles = await vehiclesByCategory(category);
        const rates = vehicles.map((v) => v.ratePerKm).filter((r): r is number => typeof r === "number" && r > 0);
        return { category, startingFrom: rates.length ? Math.min(...rates) : null };
      })
    )
  );
}

/** Convenience accessors that deserialize JSON columns for view rendering. */
export function vehicleFeatures(v: Vehicle): string[] {
  return parseJsonArray(v.features);
}

export function vehicleGallery(v: Vehicle): string[] {
  const fromDb = parseJsonArray(v.gallery);
  if (fromDb.length > 0) return fromDb;

  // Dynamically discover all matching vehicle photos saved in public/assets/images/vehicles
  const vDir = path.join(publicDir, "assets/images/vehicles");
  if (!fs.existsSync(vDir)) return [];
  try {
    const files = fs.readdirSync(vDir);
    const prefix = `${v.slug}--`;
    const aliasPrefix = VEHICLE_SLUG_ALIASES[v.slug] ? `${VEHICLE_SLUG_ALIASES[v.slug]}--` : null;
    const matches = files
      .filter(
        (f) =>
          (f.startsWith(prefix) || (aliasPrefix && f.startsWith(aliasPrefix))) &&
          /\.(webp|jpg|jpeg|png)$/i.test(f)
      )
      .map((f) => `/assets/images/vehicles/${f}`);

    // Prefer WebP versions and sort hero/front first
    matches.sort((a, b) => {
      if (a.includes("hero") || a.includes("front")) return -1;
      if (b.includes("hero") || b.includes("front")) return 1;
      return a.localeCompare(b);
    });

    if (v.slug === "urbania-12-seater-maharaja") {
      const extraHighlights = [
        "/assets/images/vehicles/force-urbania--maharaja-recliner.webp",
        "/assets/images/vehicles/force-urbania--ambient-lighting.webp",
        "/assets/images/vehicles/force-urbania--sony-tv.webp",
        "/assets/images/vehicles/force-urbania--fridge-open.webp",
        "/assets/images/vehicles/force-urbania--window-blind.webp"
      ];
      for (const extra of extraHighlights) {
        if (!matches.includes(extra) && fs.existsSync(path.join(publicDir, extra.replace(/^\//, "")))) {
          matches.push(extra);
        }
      }
    }

    // Ensure primary resolved image is always in gallery if available
    const primary = resolveVehicleImage(v);
    if (primary && !matches.includes(primary) && fs.existsSync(path.join(publicDir, primary.replace(/^\//, "")))) {
      matches.unshift(primary);
    }

    return matches;
  } catch {
    return [];
  }
}

export function serviceHighlights(s: Service): string[] {
  return parseJsonArray(s.highlights);
}

export function packageHighlights(p: TourPackage): string[] {
  return parseJsonArray(p.highlights);
}

export function packageVehicleOptions(p: TourPackage): string[] {
  return parseJsonArray(p.vehicleOptions);
}

/** Resolves a vehicle by slug, falling back to its known alias if the DB holds the other spelling. */
export async function findVehicleBySlugOrAlias(slug: string): Promise<Vehicle | undefined> {
  const direct = await vehiclesRepo.findBySlug(slug);
  if (direct) return direct;
  const alias = VEHICLE_SLUG_ALIASES[slug];
  return alias ? await vehiclesRepo.findBySlug(alias) : undefined;
}

