import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = "public";
const VEHICLES_DIR = "public/assets/images/vehicles";
const GALLERY_DIR = "public/assets/images/gallery";
const VIDEO_DIR = "public/assets/video";

fs.mkdirSync(VEHICLES_DIR, { recursive: true });
fs.mkdirSync(GALLERY_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

const IMAGE_MAPPINGS = [
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.31 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--hero-interior.webp"),
      path.join(GALLERY_DIR, "force-urbania-luxury-cabin-interior.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.27 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--front-grey.webp"),
      path.join(GALLERY_DIR, "force-urbania-front-exterior.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.27 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--rear-grey.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.24 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--sony-tv.webp"),
      path.join(GALLERY_DIR, "force-urbania-entertainment-smart-tv.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.30 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--maharaja-recliner.webp"),
      path.join(GALLERY_DIR, "force-urbania-maharaja-recliner-seat.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.30 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--ambient-lighting.webp"),
      path.join(GALLERY_DIR, "force-urbania-blue-ambient-lighting.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.33 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--footrest-detail.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.29 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--fridge-open.webp"),
      path.join(GALLERY_DIR, "force-urbania-onboard-chiller-fridge.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.29 PM (2).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--fridge-closed.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.28 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--cockpit-dashboard.webp"),
      path.join(GALLERY_DIR, "force-urbania-driver-cockpit-dashboard.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.28 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--passenger-cabin.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.29 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--aisle-seats.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.31 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--window-blind.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.32 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--ac-vents.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.32 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "force-urbania--panoramic-view.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.34 PM.jpeg",
    targets: [
      path.join(VEHICLES_DIR, "urbania-maharaja--exterior-hero.webp"),
      path.join(VEHICLES_DIR, "urbania-12-seater-maharaja--exterior.webp"),
      path.join(GALLERY_DIR, "urbania-12-seater-maharaja-white-exterior.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.34 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "urbania-maharaja--neon-interior.webp"),
      path.join(VEHICLES_DIR, "urbania-12-seater-maharaja--interior.webp"),
      path.join(GALLERY_DIR, "urbania-12-seater-maharaja-neon-ceiling.webp")
    ]
  },
  {
    src: "WhatsApp Image 2026-10-01 at 1.23.33 PM (1).jpeg",
    targets: [
      path.join(VEHICLES_DIR, "urbania-maharaja--tan-seats.webp"),
      path.join(GALLERY_DIR, "urbania-12-seater-maharaja-tan-leather-seats.webp")
    ]
  }
];

async function run() {
  console.log("Optimizing and integrating fleet media...");
  let totalSaved = 0;

  for (const item of IMAGE_MAPPINGS) {
    const srcPath = path.join(PUBLIC_DIR, item.src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Source file not found: ${srcPath}`);
      continue;
    }

    const inBuf = fs.readFileSync(srcPath);
    const optimized = await sharp(inBuf)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    for (const target of item.targets) {
      fs.writeFileSync(target, optimized);
      console.log(`✓ Generated ${target} (${(optimized.length / 1024).toFixed(1)} KB)`);
    }

    totalSaved += inBuf.length - optimized.length;
  }

  // Handle Video
  const videoSrc = path.join(PUBLIC_DIR, "WhatsApp Video 2026-10-01 at 1.23.26 PM.mp4");
  const videoTarget = path.join(VIDEO_DIR, "force-urbania-luxury-walkthrough.mp4");
  if (fs.existsSync(videoSrc)) {
    fs.copyFileSync(videoSrc, videoTarget);
    console.log(`✓ Copied walkthrough video to ${videoTarget}`);
  }

  console.log(`\nMedia processing complete! Saved ${(totalSaved / (1024 * 1024)).toFixed(2)} MB of bandwidth.`);
}

run().catch((err) => {
  console.error("Image processing error:", err);
  process.exit(1);
});
