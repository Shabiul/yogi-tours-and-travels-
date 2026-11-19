// Topic clusters: one pillar page per search intent, supporting pages beneath it.
// This is the single source of truth for the "More about ..." block that page-end.ejs
// renders on every page in a cluster, so related pages always link to the pillar and
// to each other with consistent anchor text. See docs/content-clusters.md for the
// keyword-to-page map these clusters implement.

export interface ClusterLink {
  path: string;
  anchor: string;
}

export interface ContentCluster {
  id: string;
  name: string;
  pillar: ClusterLink;
  /** Supporting pages. A page that appears here also gets the block. */
  spokes: ClusterLink[];
  /** Programmatic child pages (area/route pages): they get the block but are not listed in it. */
  childPrefixes: string[];
}

export const CONTENT_CLUSTERS: ContentCluster[] = [
  {
    id: "force-urbania",
    name: "Force Urbania rental",
    pillar: { path: "/force-urbania", anchor: "Force Urbania rental in Bangalore" },
    spokes: [
      { path: "/17-seater-urbania-for-rent-in-bangalore", anchor: "17 seater Urbania for rent" },
      { path: "/12-seater-urbania-for-rent-in-bangalore", anchor: "12 seater Maharaja Urbania for rent" },
      { path: "/blog/16-seater-force-urbania-rental-bangalore-guide", anchor: "16 seater Force Urbania guide" },
      { path: "/fleet/tempo-traveller/force-urbania", anchor: "Force Urbania vehicle page and photos" },
      { path: "/fleet/tempo-traveller/urbania-12-seater-maharaja", anchor: "Maharaja Urbania vehicle page" },
      { path: "/blog/force-urbania-vs-tempo-traveller-luxury-van-rental-bangalore", anchor: "Force Urbania vs Tempo Traveller" },
      { path: "/rent/force-urbania", anchor: "Force Urbania outstation routes" },
      { path: "/blog/cost/bangalore-to-coorg-force-urbania", anchor: "Force Urbania fare to Coorg" }
    ],
    childPrefixes: ["/urbania-rent-", "/rent/force-urbania/", "/rent/urbania-12-seater-maharaja"]
  },
  {
    id: "tempo-traveller",
    name: "Tempo Traveller rental",
    pillar: { path: "/fleet/tempo-traveller", anchor: "Tempo Traveller rental in Bangalore" },
    spokes: [
      { path: "/fleet/tempo-traveller/9-seater-tempo-traveller", anchor: "9 seater Tempo Traveller rental" },
      { path: "/fleet/tempo-traveller/maharaja-tempo-traveller", anchor: "12 seater Maharaja Tempo Traveller" },
      { path: "/fleet/tempo-traveller/tempo-traveller-17-seater", anchor: "17 seater Tempo Traveller rental" },
      { path: "/blog/9-seater-tempo-traveller-bangalore-guide", anchor: "9 seater Tempo Traveller hiring guide" },
      { path: "/blog/17-seater-21-seater-tempo-traveller-urbania-mini-bus-bangalore-guide", anchor: "17 and 21 seater rental guide" },
      { path: "/force-urbania", anchor: "Force Urbania, the luxury option" }
    ],
    childPrefixes: [
      "/9seater-tempotraveller/", "/12seater-tempotraveller/", "/17seater-tempotraveller/",
      "/rent/9-seater-tempo", "/rent/12-seater-tempo", "/rent/17-seater-tempo"
    ]
  },
  {
    id: "buses",
    name: "Mini bus and tourist bus rental",
    pillar: { path: "/fleet/mini-bus", anchor: "Mini bus rental in Bangalore" },
    spokes: [
      { path: "/fleet/mini-bus/mini-bus-21-seater", anchor: "21 seater mini bus rental" },
      { path: "/fleet/mini-bus/mini-bus-25-seater", anchor: "25 seater mini bus rental" },
      { path: "/fleet/tourist-bus", anchor: "Tourist bus rental in Bangalore" },
      { path: "/fleet/tourist-bus/tourist-bus-40-seater", anchor: "40 seater tourist bus" },
      { path: "/services/group-transportation", anchor: "Group transportation in Bangalore" }
    ],
    childPrefixes: ["/mini-bus-rental/", "/tourist-bus-rental/", "/rent/40-seater-tourist-bus", "/rent/55-seater-tourist-bus", "/rent/21-seater-mini-bus", "/rent/25-seater-mini-bus"]
  },
  {
    id: "events",
    name: "Wedding and event transport",
    pillar: { path: "/services/wedding-transportation", anchor: "Wedding transportation in Bangalore" },
    spokes: [
      { path: "/services/event-transportation", anchor: "Event transportation" },
      { path: "/services/corporate-travel", anchor: "Corporate travel in Bangalore" },
      { path: "/services/group-transportation", anchor: "Group transportation" },
      { path: "/services/airport-transfer", anchor: "Airport transfer in Bangalore" },
      { path: "/12-seater-urbania-for-rent-in-bangalore", anchor: "12 seater Maharaja Urbania for VIP guests" },
      { path: "/fleet/mini-bus", anchor: "Mini buses for wedding guests" }
    ],
    childPrefixes: []
  },
  {
    id: "pilgrimage",
    name: "Pilgrimage and outstation tours",
    pillar: { path: "/services/pilgrimage-tours", anchor: "Pilgrimage tours from Bangalore" },
    spokes: [
      { path: "/tour-packages/dharmasthala-kukke-pilgrimage", anchor: "Dharmasthala and Kukke package" },
      { path: "/tour-packages/mantralaya-pilgrimage-tour", anchor: "Mantralaya pilgrimage tour" },
      { path: "/routes/bangalore-to-tirupati-cab", anchor: "Bangalore to Tirupati cab" },
      { path: "/fleet/tempo-traveller/tempo-traveller-17-seater", anchor: "17 seater Tempo Traveller for pilgrimages" },
      { path: "/services/outstation-travel", anchor: "Outstation travel from Bangalore" }
    ],
    childPrefixes: []
  }
];

export interface ClusterNav {
  name: string;
  links: ClusterLink[];
}

function normalise(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** The "More about ..." links for a request path, or null when the page is in no cluster. */
export function clusterNavFor(rawPath: string): ClusterNav | null {
  const path = normalise(rawPath);
  for (const c of CONTENT_CLUSTERS) {
    const isPillar = path === c.pillar.path;
    const isSpoke = c.spokes.some((s) => s.path === path);
    const isChild = c.childPrefixes.some((p) => path.startsWith(p));
    if (!isPillar && !isSpoke && !isChild) continue;
    const links = [c.pillar, ...c.spokes].filter((l) => l.path !== path).slice(0, 8);
    return { name: c.name, links };
  }
  return null;
}
