# Content clusters and keyword-to-page map

Source of truth for links: `src/server/config/contentClusters.ts`.
Rule from the Rankknar framework: one page per search intent, merge or redirect overlaps, and create a new page only for a real gap.

## Clusters

| Cluster | Pillar | Supporting pages |
|---|---|---|
| Force Urbania rental | `/force-urbania` | 17 seater page, 12 seater page, 16 seater guide, two vehicle pages, Urbania vs Tempo Traveller, `/rent/force-urbania`, fare guides. Children: 34 `urbania-rent-<area>` pages, `/rent/force-urbania/...` routes |
| Tempo Traveller rental | `/fleet/tempo-traveller` | 9 seater, 12 Maharaja and 17 seater vehicle pages, 9 seater guide, 17 and 21 seater guide. Children: `/9seater-`, `/12seater-`, `/17seater-tempotraveller/<area>` |
| Mini bus and tourist bus | `/fleet/mini-bus` | 21 and 25 seater mini buses, tourist buses, group transportation. Children: `/mini-bus-rental/<area>`, `/tourist-bus-rental/<area>` |
| Wedding and event transport | `/services/wedding-transportation` | event, corporate, group, airport pages, 12 seater Urbania, mini buses |
| Pilgrimage and outstation tours | `/services/pilgrimage-tours` | Dharmasthala, Mantralaya packages, Tirupati route, 17 seater Tempo Traveller, outstation travel |

## Keyword to page map (one owner per intent)

| Search intent | Owner page | Notes |
|---|---|---|
| force urbania rental in bangalore, urbania rental in bangalore, urbania hire | `/force-urbania` | Broad head term. Pillar. |
| 17 seater urbania for rent / rental / price / per km | `/fleet/tempo-traveller/force-urbania` (ranking today) and `/17-seater-urbania-for-rent-in-bangalore` | OVERLAP. Check indexing of the dedicated page after 3 to 4 weeks. If not indexed, merge it into the vehicle page and 301. |
| maharaja urbania 12 seater, 12 seater urbania | `/fleet/tempo-traveller/urbania-12-seater-maharaja` and `/12-seater-urbania-for-rent-in-bangalore` | OVERLAP. Same decision as above. |
| 16 seater urbania | `/16-seater-urbania-for-rent-in-bangalore` | Dedicated page. The blog guide `/blog/16-seater-force-urbania-rental-bangalore-guide` is the supporting spec write-up. |
| 21 seater urbania | `/force-urbania#urbania-21` | Answer block on the pillar. No page needed. |
| 9 seater tempo traveller (bangalore, on rent, near me) | `/fleet/tempo-traveller/9-seater-tempo-traveller` | Best performer. Guide blog is a supporting page. |
| 12 seater tempo traveller / maharaja tempo traveller | `/fleet/tempo-traveller/maharaja-tempo-traveller` | Position 37 to 52 for "12 seater tempo traveller bangalore". Needs work. |
| 17 seater tempo traveller | `/fleet/tempo-traveller/tempo-traveller-17-seater` | |
| mini bus / 21 seater mini bus rental | `/fleet/mini-bus` and `/fleet/mini-bus/mini-bus-21-seater` | Positions 20 to 50. |
| wedding transportation, wedding shuttle | `/services/wedding-transportation` | Position 30 to 40 across several queries. |
| X to Y distance (informational) | `/routes/<route>` | Route pages rank 4 to 10 but earn no clicks, since Google answers distance in the results. |

## Gaps and actions
1. Resolve the two OVERLAP rows once the dedicated pages have been indexed for a month.
2. Wedding transportation and 12 seater Tempo Traveller pages need stronger, more specific content.
3. Authority (backlinks, Business Profile, directory listings) is the largest missing piece.
