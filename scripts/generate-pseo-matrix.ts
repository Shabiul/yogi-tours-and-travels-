import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PSEO_VEHICLES,
  PSEO_ORIGINS,
  PSEO_DESTINATIONS,
  resolvePseoRoute,
  generatePseoFaqs
} from "../src/server/config/pseoData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "data");
const outputFile = path.join(outputDir, "pseo-matrix.csv");

function escapeCsv(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function run() {
  console.log("Generating Programmatic SEO (pSEO) Matrix for Yogi Tours & Travels...");
  console.log(`Vehicles: ${PSEO_VEHICLES.length}`);
  console.log(`Origins: ${PSEO_ORIGINS.length}`);
  console.log(`Destinations: ${PSEO_DESTINATIONS.length}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const headers = [
    "url_slug",
    "primary_keyword",
    "search_intent",
    "vehicle_name",
    "category",
    "seats",
    "origin",
    "destination",
    "state",
    "highway",
    "distance_km",
    "drive_time",
    "estimated_roundtrip_fare",
    "meta_title",
    "meta_description",
    "unique_route_hook",
    "doorstep_pickup_note",
    "sample_faq_question",
    "sample_faq_answer"
  ];

  const rows: string[] = [headers.join(",")];
  let count = 0;

  for (const vehicle of PSEO_VEHICLES) {
    for (const origin of PSEO_ORIGINS) {
      for (const dest of PSEO_DESTINATIONS) {
        const resolved = resolvePseoRoute(vehicle.slug, origin.slug, dest.slug);
        if (!resolved) continue;

        const faqs = generatePseoFaqs(resolved);
        const firstFaq = faqs[0] || { question: "", answer: "" };

        const row = [
          escapeCsv(resolved.urlSlug),
          escapeCsv(resolved.primaryKeyword),
          escapeCsv(resolved.searchIntent),
          escapeCsv(vehicle.name),
          escapeCsv(vehicle.category),
          escapeCsv(vehicle.seats),
          escapeCsv(origin.name),
          escapeCsv(dest.name),
          escapeCsv(dest.state),
          escapeCsv(dest.highway),
          escapeCsv(resolved.distanceKm),
          escapeCsv(resolved.driveTimeHours),
          escapeCsv(resolved.estimatedFare),
          escapeCsv(resolved.metaTitle),
          escapeCsv(resolved.metaDescription),
          escapeCsv(resolved.uniqueRouteHook),
          escapeCsv(origin.pickupNote),
          escapeCsv(firstFaq.question),
          escapeCsv(firstFaq.answer)
        ];

        rows.push(row.join(","));
        count++;
      }
    }
  }

  fs.writeFileSync(outputFile, rows.join("\n"), "utf-8");
  console.log(`Successfully generated ${count.toLocaleString()} pSEO matrix rows at:`);
  console.log(`-> ${outputFile}`);
}

run();
