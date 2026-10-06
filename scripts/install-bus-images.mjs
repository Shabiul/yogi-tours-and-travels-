import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACTS_DIR = 'C:/Users/Shabiul/.gemini/antigravity-ide/brain/2a53f73a-18f5-4208-8992-39b67770acb1';
const VEHICLES_DIR = 'public/assets/images/vehicles';
const GALLERY_DIR = 'public/assets/images/gallery';

fs.mkdirSync(VEHICLES_DIR, { recursive: true });
fs.mkdirSync(GALLERY_DIR, { recursive: true });

async function processImage(srcPath, targets, options = {}) {
  if (!fs.existsSync(srcPath)) {
    console.error(`Missing source: ${srcPath}`);
    return;
  }
  const inBuf = fs.readFileSync(srcPath);
  let pipeline = sharp(inBuf).rotate();

  if (options.resize) {
    pipeline = pipeline.resize(options.resize);
  }

  const webpBuf = await pipeline.webp({ quality: 86, effort: 4 }).toBuffer();

  for (const target of targets) {
    if (target.endsWith('.jpg') || target.endsWith('.jpeg')) {
      const jpgBuf = await sharp(inBuf).rotate().resize(options.resize || {}).jpeg({ quality: 90 }).toBuffer();
      fs.writeFileSync(target, jpgBuf);
    } else {
      fs.writeFileSync(target, webpBuf);
    }
    console.log(`✓ Created ${target}`);
  }
}

async function run() {
  console.log('Processing Tourist Bus and Vehicle Images...');

  // 1. 33 Seater Tourist Bus
  const bus33Src = path.join(ARTIFACTS_DIR, 'bus_33_yogi_1791266933002.jpg');
  await processImage(bus33Src, [
    path.join(VEHICLES_DIR, 'tourist-bus-33-seater--front-01.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-33-seater.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-33-seater.jpg'),
    path.join(VEHICLES_DIR, 'tourist-bus-33-seater--front-01.jpg'),
    path.join(GALLERY_DIR, 'tourist-bus-33-seater-white-coach.webp')
  ], { resize: { width: 1280, height: 960, fit: 'cover' } });

  // 2. 45 Seater Tourist Bus
  const bus45Src = path.join(ARTIFACTS_DIR, 'bus_45_yogi_1791266905037.jpg');
  await processImage(bus45Src, [
    path.join(VEHICLES_DIR, 'tourist-bus-45-seater--front-01.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-45-seater.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-45-seater.jpg'),
    path.join(VEHICLES_DIR, 'tourist-bus-45-seater--front-01.jpg'),
    path.join(GALLERY_DIR, 'tourist-bus-45-seater-luxury-coach.webp')
  ], { resize: { width: 1280, height: 960, fit: 'cover' } });

  // 3. 49 Seater Tourist Bus
  const bus49Src = path.join(ARTIFACTS_DIR, 'bus_49_yogi_1791266959243.jpg');
  await processImage(bus49Src, [
    path.join(VEHICLES_DIR, 'tourist-bus-49-seater--front-01.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-49-seater.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-49-seater.jpg'),
    path.join(VEHICLES_DIR, 'tourist-bus-49-seater--front-01.jpg'),
    path.join(GALLERY_DIR, 'tourist-bus-49-seater-volvo-coach.webp')
  ], { resize: { width: 1280, height: 960, fit: 'cover' } });

  // 4. 50 Seater Tourist Bus
  const bus50Src = path.join(ARTIFACTS_DIR, 'bus_fifty_seater_1790856412621.jpg');
  const bus50Yogi = path.join(ARTIFACTS_DIR, 'bus_50_yogi_1791266871419.jpg');
  await processImage(bus50Yogi, [
    path.join(VEHICLES_DIR, 'tourist-bus-50-seater--front-01.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-50-seater.webp'),
    path.join(VEHICLES_DIR, 'tourist-bus-50-seater.jpg'),
    path.join(VEHICLES_DIR, 'tourist-bus-50-seater--front-01.jpg'),
    path.join(GALLERY_DIR, 'tourist-bus-50-seater-express-coach.webp')
  ], { resize: { width: 1280, height: 960, fit: 'cover' } });

  // 5. 9 Seater Tempo Traveller
  const tt12Src = path.join(VEHICLES_DIR, 'tempo-traveller-12-seater.webp');
  if (fs.existsSync(tt12Src)) {
    fs.copyFileSync(tt12Src, path.join(VEHICLES_DIR, '9-seater-tempo-traveller--front-01.webp'));
    fs.copyFileSync(tt12Src, path.join(VEHICLES_DIR, '9-seater-tempo-traveller.webp'));
    console.log('✓ Created 9-seater-tempo-traveller images from 12-seater photo');
  }

  // 6. Multi-angle gallery images for all tourist buses (Interior seating)
  const coachInteriorSrc = path.join(GALLERY_DIR, 'tour-coach-interior-seating.jpg');
  if (fs.existsSync(coachInteriorSrc)) {
    for (const slug of ['tourist-bus-33-seater', 'tourist-bus-40-seater', 'tourist-bus-45-seater', 'tourist-bus-49-seater', 'tourist-bus-50-seater']) {
      await processImage(coachInteriorSrc, [
        path.join(VEHICLES_DIR, `${slug}--interior-01.webp`)
      ], { resize: { width: 1280, height: 960, fit: 'cover' } });
    }
  }

  // 7. Multi-angle gallery images for all tourist buses (Exterior side view)
  const coachExteriorSrc = path.join(GALLERY_DIR, 'tour-coach-exterior-view.jpg');
  if (fs.existsSync(coachExteriorSrc)) {
    for (const slug of ['tourist-bus-33-seater', 'tourist-bus-45-seater', 'tourist-bus-49-seater', 'tourist-bus-50-seater']) {
      await processImage(coachExteriorSrc, [
        path.join(VEHICLES_DIR, `${slug}--exterior.webp`)
      ], { resize: { width: 1280, height: 960, fit: 'cover' } });
    }
  }

  console.log('\nAll vehicle media processed successfully!');
}

run().catch(console.error);
