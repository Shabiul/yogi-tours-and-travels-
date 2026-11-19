// Pushes site URLs to Bing (and other IndexNow engines) so changes are crawled quickly.
// Google does not use IndexNow; it keeps using Search Console and the sitemaps.
//
//   node scripts/indexnow-submit.mjs                 # dry run: lists what would be sent
//   node scripts/indexnow-submit.mjs --submit        # sends every URL in sitemap-pages.xml
//   node scripts/indexnow-submit.mjs --submit --limit 50
//   node scripts/indexnow-submit.mjs --submit https://www.yogitourstravels.com/force-urbania ...
//
// The key file must already be live at https://www.yogitourstravels.com/<key>.txt.
const HOST = "www.yogitourstravels.com";
const KEY = "c8883e3464ba95d7666af9c523a433fc";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const submit = args.includes("--submit");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;
const explicit = args.filter((a) => a.startsWith("https://"));

async function sitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap-pages.xml`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const keyCheck = await fetch(KEY_LOCATION);
const keyBody = (await keyCheck.text()).trim();
if (keyCheck.status !== 200 || keyBody !== KEY) {
  console.error(`Key file is not live at ${KEY_LOCATION} (status ${keyCheck.status}). Deploy first, then rerun.`);
  process.exit(1);
}

let urls = explicit.length ? explicit : await sitemapUrls();
urls = urls.filter((u) => new URL(u).host === HOST).slice(0, limit);
console.log(`${urls.length} URLs ${submit ? "to submit" : "(dry run, add --submit to send)"}`);
if (!submit) {
  console.log(urls.slice(0, 5).join("\n"));
  process.exit(0);
}

for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch })
  });
  console.log(`Batch ${i / 10000 + 1}: ${batch.length} URLs -> HTTP ${res.status}`);
}
