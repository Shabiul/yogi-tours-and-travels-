// Illustrative round-trip fare table for the Force Urbania pages. Every number
// is derived from the live tariff (per-km rate, 300 km/day minimum, driver
// Bata) using the same billing rule the quotation uses, so it can't drift from
// the rate shown elsewhere on the page. Distances are approximate road km.

export interface UrbaniaFareRow {
  slug: string;
  place: string;
  oneWayKm: number;
  days: number;
  billedKm: number;
  total: number;
  perPerson17: number;
}

const DESTINATIONS: Array<{ slug: string; place: string; oneWayKm: number; days: number }> = [
  { slug: "mysore", place: "Mysore", oneWayKm: 145, days: 1 },
  { slug: "chikmagalur", place: "Chikmagalur", oneWayKm: 245, days: 2 },
  { slug: "coorg", place: "Coorg", oneWayKm: 255, days: 2 },
  { slug: "tirupati", place: "Tirupati", oneWayKm: 255, days: 2 },
  { slug: "ooty", place: "Ooty", oneWayKm: 275, days: 2 },
  { slug: "wayanad", place: "Wayanad", oneWayKm: 290, days: 2 },
  { slug: "hampi", place: "Hampi", oneWayKm: 345, days: 3 }
];

export function urbaniaFareRows(ratePerKm: number, minKmPerDay: number, bataPerDay: number): UrbaniaFareRow[] {
  return DESTINATIONS.map((d) => {
    const billedKm = Math.max(d.oneWayKm * 2, minKmPerDay * d.days);
    const total = billedKm * ratePerKm + bataPerDay * d.days;
    return { ...d, billedKm, total, perPerson17: Math.round(total / 17) };
  });
}

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
