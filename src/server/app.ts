import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { initSchema, pool } from "./db/connection.js";
import { injectViewLocals } from "./middleware/viewLocals.js";
import { ensureCsrfToken } from "./middleware/csrf.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { LEGACY_REDIRECTS } from "./config/redirects.js";
import { getCacheVersion, getCachedPage, setCachedPage } from "./utils/cache.js";

import pagesRouter from "./routes/pages.js";
import vehiclesRouter from "./routes/vehicles.js";
import servicesRouter from "./routes/services.js";
import packagesRouter from "./routes/packages.js";
import galleryRouter from "./routes/gallery.js";
import blogRouter from "./routes/blog.js";
import apiRouter from "./routes/api.js";
import seoRouter from "./routes/seo.js";
import adminRouter from "./routes/admin/index.js";
import locationsRouter from "./routes/locations.js";
import tripRoutesRouter from "./routes/tripRoutes.js";
import { rentRouter } from "./routes/rent.js";
import vehicleLocationsRouter from "./routes/vehicleLocations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../");

const app = express();

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(projectRoot, "src/views"));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 'unsafe-inline' is required for the small inline bootstrap script in
        // head.ejs, the JSON-LD schema blocks, and the optional GA4 snippet —
        // none of the templates take unescaped user input into a <script>
        // tag (verified: every dynamic value in views renders via EJS's
        // auto-escaping <%= %>), so this doesn't reopen an existing hole.
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        // GA4 beacons post to google-analytics.com; the pixel fallback and
        // Google Tag Manager assets need image + script allowances too. These
        // only ever fire after the visitor accepts analytics cookies.
        imgSrc: ["'self'", "data:", "https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.googletagmanager.com"],
        connectSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
          "https://www.google-analytics.com",
          "https://*.google-analytics.com",
          "https://*.analytics.google.com",
          "https://*.googletagmanager.com"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        // The Contact page embeds a keyless Google Maps iframe (no API key
        // needed for this basic embed) showing the business location.
        frameSrc: ["https://www.google.com"]
      }
    }
  })
);
// This site never uses the camera, microphone, geolocation, etc. — deny them
// all outright rather than leaving the default (permissive) policy in place.
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  next();
});
// Canonical Host & Protocol Enforcement (GSC Zero-Duplicate Protection):
// Enforces single primary canonical domain (https://www.yogitourstravels.com) in production.
// Redirects bare domain (yogitourstravels.com) to www, and plain http to https with 301.
app.use((req, res, next) => {
  if (env.isProd) {
    const host = ((req.headers["x-forwarded-host"] || req.headers.host || "") as string).toLowerCase().split(":")[0];
    const proto = ((req.headers["x-forwarded-proto"] || req.protocol || "") as string).toLowerCase();
    if (host === "yogitourstravels.com") {
      res.redirect(301, `https://www.yogitourstravels.com${req.originalUrl}`);
      return;
    }
    if (proto === "http" && host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      res.redirect(301, `https://${host}${req.originalUrl}`);
      return;
    }
  }
  next();
});

// 1. Legacy URLs from the previous website — 301 to the closest current page
// so any residual Google ranking/backlinks transfer instead of hitting a 404/410.
// LEGACY_REDIRECTS keys never have a trailing slash, so normalize the incoming path first.
// Running this BEFORE junk path filtering ensures valuable legacy URLs (like /tag/tempo-traveller-rental-bangalore)
// are redirected to their real destination instead of getting rejected as junk.
app.use((req, res, next) => {
  const normalizedPath = req.path.length > 1 && req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;
  const target = LEGACY_REDIRECTS[normalizedPath];
  if (target) {
    res.redirect(301, target);
    return;
  }
  next();
});

// 2. Query parameter spam cleaner (Resolves 109,320 "Crawled - currently not indexed" and Soft 404s):
// Automated bots/scanners on old WordPress generated hundreds of thousands of ?s=..., ?p=..., ?attachment_id=...
// Sending HTTP 410 Gone with X-Robots-Tag: noindex tells Googlebot to purge these URLs immediately from index.
const SPAM_QUERY_PARAMS = ["s", "attachment_id", "replytocom", "author", "m", "p", "feed", "preview"];
app.use((req, res, next) => {
  if (req.method === "GET") {
    const hasSpamQuery = SPAM_QUERY_PARAMS.some((k) => k in req.query);
    if (hasSpamQuery) {
      res
        .set("X-Robots-Tag", "noindex, nofollow")
        .status(410)
        .type("text/plain")
        .send("Gone: Legacy query endpoint permanently removed.");
      return;
    }
  }
  next();
});

// 3. Obsolete WordPress / scanner / defaced PHP paths (Resolves 82,195 404s, 17,609 403s & April 2026 legacy artifacts):
// Returning HTTP 410 Gone with X-Robots-Tag: noindex tells Googlebot that these legacy resources
// were permanently removed, protecting domain reputation and clearing crawl waste.
const JUNK_PATH_RE = /(?:\.php(?:\/|$)|^\/(?:wp-|xmlrpc|comments\/feed|tag\/|category\/|author\/|feed\/|trackback|cate-\d|\.env|\.git|phpmyadmin|wordpress\/|shell|wso|c99|alfa|adminer|cgi-bin))/i;
app.use((req, res, next) => {
  if (req.method === "GET" && JUNK_PATH_RE.test(req.path)) {
    res
      .set("X-Robots-Tag", "noindex, nofollow")
      .status(410)
      .type("text/plain")
      .send("Gone: This legacy resource has been permanently removed.");
    return;
  }
  next();
});

app.use(compression());
if (!env.isProd) {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Postgres schema creation is async (unlike the old node:sqlite version,
// which ran it synchronously at import time) — every request waits for the
// one-time CREATE TABLE IF NOT EXISTS pass before hitting a route. initSchema()
// memoizes its promise, so this is a no-op after the first request.
app.use((req, res, next) => {
  initSchema().then(() => next(), next);
});

const sessionStore = env.databaseUrl
  ? new (connectPgSimple(session))({ pool, tableName: "session", createTableIfMissing: true })
  : undefined;

app.use(
  session({
    ...(sessionStore ? { store: sessionStore } : {}),
    name: "ytt.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
  })
);

// Scoped to /admin only: CSRF tokens are only ever checked on admin forms
// (verifyCsrfToken is never used outside src/server/routes/admin/*). Running
// this globally was touching req.session on every public page view — which,
// combined with saveUninitialized:false, still forces a session save (and a
// Set-Cookie + a write to the Postgres session store) the instant a value is
// assigned to it — so every anonymous visitor to the homepage, fleet pages,
// etc. was creating and persisting a session for no reason. That both adds
// an extra DB round-trip to every public request and makes every response
// contain a unique Set-Cookie header, which rules out HTTP caching entirely
// (a cached response would replay one visitor's session cookie to another).
app.use("/admin", ensureCsrfToken);
app.use(injectViewLocals);

// Shared by the header middleware below and the Redis page cache: every GET
// that isn't /admin or /api is a public, non-personalized page — safe to
// cache at any layer since (per the comment above ensureCsrfToken) none of
// them touch the session or carry a per-visitor Set-Cookie.
function isPublicCacheablePath(req: express.Request): boolean {
  return req.method === "GET" && !req.path.startsWith("/admin") && !req.path.startsWith("/api");
}

// Public, non-personalized pages are safe to cache now that they no longer
// carry a per-visitor Set-Cookie. A short edge cache means most visitors —
// including from India, where Vercel's edge is close but the function/DB
// round-trip is not — get an instant cached response instead of re-running
// the full render + database query path on every request.
app.use((req, res, next) => {
  if (isPublicCacheablePath(req)) {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    // Vercel's edge strips s-maxage from the client-facing Cache-Control on
    // Serverless Function responses, so it doesn't drive Vercel's own CDN
    // cache the way it would on a plain static/CDN origin — this header is
    // Vercel's documented mechanism for controlling that edge cache
    // specifically, independent of what's sent to the browser.
    res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  }
  next();
});

app.use(
  "/assets/uploads",
  express.static(path.join(projectRoot, "public/assets/uploads"), { maxAge: env.isProd ? "7d" : 0 })
);
app.use(express.static(path.join(projectRoot, "public"), { maxAge: env.isProd ? "1d" : 0 }));

// Redis-backed page cache for the same public/non-personalized routes as the
// header middleware above. This is what actually keeps repeat requests off
// Postgres and out of the render path — the Cache-Control headers only
// affect the browser and Vercel's edge, which still call this function on
// every cache miss/expiry/region. A miss here just falls through to the
// normal render (res.send is captured below and stored for next time); a
// disabled/unreachable Redis makes getCachedPage resolve null, so this is a
// pure no-op when caching isn't configured.
const PAGE_CACHE_TTL_SECONDS = 300;
app.use((req, res, next) => {
  if (!isPublicCacheablePath(req)) {
    next();
    return;
  }
  const cacheKey = req.originalUrl;
  // Fetch the version once and reuse it for both the read and the eventual
  // write below — rendering happens in between, and if we let each call
  // fetch its own version instead, a bumpCacheVersion() from an admin save
  // landing mid-render would make the write land under the new (post-edit)
  // version key with pre-edit content, hiding the edit for the full TTL
  // instead of invalidating it immediately.
  getCacheVersion()
    .then((version) =>
      getCachedPage(cacheKey, version).then((html) => {
        if (html !== null) {
          res.setHeader("X-Cache", "HIT");
          res.type("html").send(html);
          return;
        }
        res.setHeader("X-Cache", "MISS");
        const originalSend = res.send.bind(res);
        res.send = ((body: unknown) => {
          if (res.statusCode === 200 && typeof body === "string") {
            void setCachedPage(cacheKey, body, PAGE_CACHE_TTL_SECONDS, version);
          }
          return originalSend(body as never);
        }) as typeof res.send;
        next();
      })
    )
    .catch(next);
});

// Basic abuse protection on the public enquiry endpoint.
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again in a little while." }
});
app.use("/api/enquiry", enquiryLimiter);

// Brute-force protection on admin login.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/admin/login", loginLimiter);

// forgot-password has no auth gate (it can't — that's the point) and
// triggers a real outbound email via SMTP on every hit for a guessed/known
// username, so an unthrottled attacker could mail-bomb the business's own
// inbox or exhaust the SMTP send quota. Tighter than the login limiter
// since there's no legitimate reason to hit this more than a handful of
// times in 15 minutes.
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/admin/forgot-password", forgotPasswordLimiter);

// Defense-in-depth on the admin password-change form: this is behind
// requireAdmin already, so it only matters if a session is already
// compromised, but there's no reason a legitimate admin ever needs more
// than a handful of attempts in 15 minutes.
app.use("/admin/settings/password", loginLimiter);

app.use(seoRouter);
app.use(pagesRouter);
app.use("/fleet", vehiclesRouter);
app.use("/services", servicesRouter);
app.use("/tour-packages", packagesRouter);
app.use("/locations", locationsRouter);
app.use("/routes", tripRoutesRouter);
app.use("/rent", rentRouter);
app.use("/gallery", galleryRouter);
app.use("/blog", blogRouter);
app.use("/api", apiRouter);
app.use("/admin", adminRouter);
// Root-mounted, exactly-2-segment routes (/:groupSlug/:locationSlug) — must
// come after every other router above so it never shadows a real page; a
// 1-segment path like /about can't match this pattern regardless of order.
app.use(vehicleLocationsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// Vercel's Node runtime invokes the exported app directly per-request — it
// does not want (and will not use) a listening server. api/index.js imports
// this same module for that environment.
if (!process.env.VERCEL) {
  app.listen(env.port, () => {
    console.log(`Yogi Tours & Travels server running at ${env.siteUrl} (port ${env.port}, ${env.nodeEnv})`);
  });
}

export default app;
