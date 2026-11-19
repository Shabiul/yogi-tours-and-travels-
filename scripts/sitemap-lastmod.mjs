// Fills <lastmod> in public/sitemap-pages.xml for entries that have none.
//
// Bing treats lastmod as a key crawl signal but wants it to reflect a real content change,
// not the time the sitemap was generated. Each URL group gets the git commit time of the
// files that generate its content (data, route and template), so the date moves only when
// that content actually changes. Shared layout files (head, footer, cookie banner) are left
// out on purpose: changing them does not change a page's content. URLs whose content comes from the
// database (services, packages, posts) or that have no single source file keep no lastmod rather than a guess.
//
//   node scripts/sitemap-lastmod.mjs            # patch the file
//   node scripts/sitemap-lastmod.mjs --dry-run  # show the dates per group only
//
// Entries that already have a lastmod (set from the database) are left untouched.
import fs from "node:fs";
import { execSync } from "node:child_process";

const FILE = "public/sitemap-pages.xml";
const SITE = "https://www.yogitourstravels.com";
const dry = process.argv.includes("--dry-run");

const SOURCES = {
  rent: ["src/server/config/pseoData.ts", "src/server/routes/rent.ts", "src/views/pages/rent-detail.ejs", "src/views/pages/rent-hub.ejs"],
  urbaniaArea: ["src/server/config/locations.ts", "src/server/routes/urbania17.ts", "src/views/pages/urbania-locality.ejs", "src/views/partials/urbania-rich.ejs"],
  vehicleArea: ["src/server/config/locations.ts", "src/server/config/vehicleGroups.ts", "src/server/routes/vehicleLocations.ts", "src/views/pages/vehicle-location-detail.ejs"],
  location: ["src/server/config/locations.ts", "src/server/routes/locations.ts", "src/views/pages/location-detail.ejs"],
  route: ["src/server/config/tripRoutes.ts", "src/server/routes/tripRoutes.ts", "src/views/pages/route-detail.ejs"],
  blogGenerated: ["src/server/config/programmaticBlog.ts", "src/server/routes/blog.ts", "src/views/pages/blog-cost.ejs", "src/views/pages/blog-compare.ejs", "src/views/pages/blog-itinerary.ejs"],
  fleet: ["src/server/routes/vehicles.ts", "src/server/data/defaultData.ts", "src/views/pages/vehicle-detail.ejs", "src/views/pages/vehicles-category.ejs"],
};

const cache = new Map();
function gitDate(key) {
  if (cache.has(key)) return cache.get(key);
  const files = SOURCES[key].filter((f) => fs.existsSync(f)).join(" ");
  let d = "";
  try {
    d = execSync(`git log -1 --format=%cI -- ${files}`, { encoding: "utf8" }).trim();
  } catch {
    d = "";
  }
  cache.set(key, d);
  return d;
}

function groupFor(path) {
  if (/^\/rent\//.test(path)) return "rent";
  if (/^\/urbania-rent-/.test(path)) return "urbaniaArea";
  if (/^\/(9|12|17)seater-tempotraveller\/|^\/(mini-bus|tourist-bus)-rental\//.test(path)) return "vehicleArea";
  if (/^\/locations\//.test(path)) return "location";
  if (/^\/routes\//.test(path)) return "route";
  if (/^\/blog\/(cost|compare|itinerary)\//.test(path)) return "blogGenerated";
  if (/^\/fleet/.test(path)) return "fleet";
  // Home, list pages, legal pages, DB-driven services/packages/posts: no reliable source date here, so no guess.
  return null;
}

let xml = fs.readFileSync(FILE, "utf8");
let filled = 0;
const perGroup = {};
xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
  if (/<lastmod>/.test(inner)) return block;
  const loc = inner.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!loc) return block;
  const g = groupFor(loc.replace(SITE, "") || "/");
  if (!g) return block;
  const d = gitDate(g);
  if (!d) return block;
  filled++;
  perGroup[g] = (perGroup[g] || 0) + 1;
  return block.replace("</url>", `    <lastmod>${d}</lastmod>\n  </url>`);
});

console.log(`${filled} entries ${dry ? "would get" : "now have"} a lastmod`);
for (const [g, n] of Object.entries(perGroup)) console.log(`  ${g.padEnd(14)} ${String(n).padStart(4)}  ${gitDate(g)}`);
if (!dry) fs.writeFileSync(FILE, xml, "utf8");
