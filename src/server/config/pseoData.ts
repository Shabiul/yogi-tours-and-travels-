export interface PseoVehicle {
  slug: string;
  name: string;
  category: "car" | "tempo-traveller" | "mini-bus" | "tourist-bus";
  seats: number;
  luggage: string;
  dbSlug: string;
  ratePerKm?: number;
  highlight: string;
  terrainStrength: string;
  imageKey: string;
}

export interface PseoOrigin {
  slug: string;
  name: string;
  zone: string;
  highwayAccess: string;
  pickupNote: string;
  distanceOffsetKm: number; // relative to central Bangalore (Majestic)
  timeOffsetHours: number;
}

export interface PseoDestination {
  slug: string;
  name: string;
  state: string;
  baseDistanceKm: number;
  baseDriveTimeHours: number;
  routeType: "hill-station" | "heritage" | "coastal" | "pilgrimage" | "wildlife" | "weekend-getaway" | "city";
  highway: string;
  keyStops: string;
  terrainHook: string;
}

export const PSEO_VEHICLES: PseoVehicle[] = [
  {
    slug: "swift-dzire",
    name: "Swift Dzire",
    category: "car",
    seats: 4,
    luggage: "2 medium bags",
    dbSlug: "swift-dzire",
    ratePerKm: 13,
    highlight: "Compact, highly economical sedan ideal for solo travellers, couples, or small families.",
    terrainStrength: "High fuel efficiency and nimble handling through expressway toll lanes and narrow town streets.",
    imageKey: "/assets/images/destinations/hero-bangalore.webp"
  },
  {
    slug: "ertiga",
    name: "Maruti Ertiga",
    category: "car",
    seats: 6,
    luggage: "3 medium bags",
    dbSlug: "maruti-ertiga",
    ratePerKm: 16,
    highlight: "Smart hybrid MUV offering comfortable 3-row seating for family getaways.",
    terrainStrength: "Light hybrid powertrain delivering smooth economy over extended rural state highways.",
    imageKey: "/assets/images/destinations/vidhana-soudha.webp"
  },
  {
    slug: "innova",
    name: "Toyota Innova",
    category: "car",
    seats: 7,
    luggage: "4 bags",
    dbSlug: "toyota-innova",
    ratePerKm: 17,
    highlight: "Legendary long-distance touring workhorse with rugged body-on-frame durability.",
    terrainStrength: "High-travel suspension that soaks up road ruts and delivers unmatched highway endurance.",
    imageKey: "/assets/images/vehicles/toyota-innova--front-02.jpg"
  },
  {
    slug: "innova-crysta",
    name: "Toyota Innova Crysta",
    category: "car",
    seats: 7,
    luggage: "4 bags + boot space",
    dbSlug: "innova-crysta",
    ratePerKm: 19,
    highlight: "Premium executive MUV with middle-row captain seats and automatic climate control.",
    terrainStrength: "Torquey 2.4L diesel pulling power that climbs steep mountain hairpins effortlessly.",
    imageKey: "/assets/images/vehicles/toyota-innova--front-02.jpg"
  },
  {
    slug: "innova-hycross",
    name: "Toyota Innova Hycross",
    category: "car",
    seats: 7,
    luggage: "4 bags",
    dbSlug: "innova-hycross",
    ratePerKm: 24,
    highlight: "Latest-generation luxury hybrid MUV with ottoman leg-rests and whisper-quiet cabin.",
    terrainStrength: "Monocoque platform and electric EV mode driving that eliminates passenger motion sickness.",
    imageKey: "/assets/images/vehicles/toyota-innova--front-02.jpg"
  },
  {
    slug: "fortuner",
    name: "Toyota Fortuner",
    category: "car",
    seats: 7,
    luggage: "4 large bags",
    dbSlug: "toyota-fortuner",
    ratePerKm: 34,
    highlight: "Flagship 4x4 luxury SUV with commanding road stance and premium leather cabin.",
    terrainStrength: "220mm ground clearance and 4WD traction that conquer unpaved plantation trails and rocky ghats.",
    imageKey: "/assets/images/destinations/chikmagalur-coffee-trails.webp"
  },
  {
    slug: "9-seater-tempo",
    name: "9 Seater Tempo Traveller",
    category: "tempo-traveller",
    seats: 9,
    luggage: "9 bags + rear boot",
    dbSlug: "9-seater-tempo-traveller",
    ratePerKm: 28,
    highlight: "Executive compact van with forward-facing pushback seats and separate rear luggage boot.",
    terrainStrength: "Manoeuvrable wheelbase suited for narrow hill curves while providing individual window views.",
    imageKey: "/assets/images/gallery/tempo-traveller-exterior-view.jpg"
  },
  {
    slug: "12-seater-tempo",
    name: "12 Seater Tempo Traveller",
    category: "tempo-traveller",
    seats: 12,
    luggage: "12 bags + roof carrier",
    dbSlug: "maharaja-tempo-traveller",
    ratePerKm: 22,
    highlight: "Spacious mid-size van with plush sofa-style seating for family celebrations and temple tours.",
    terrainStrength: "Heavy-duty suspension tuned for uniform comfort across state highway expansion joints.",
    imageKey: "/assets/images/gallery/tempo-traveller-exterior-view.jpg"
  },
  {
    slug: "17-seater-tempo",
    name: "17 Seater Tempo Traveller",
    category: "tempo-traveller",
    seats: 17,
    luggage: "17 bags + roof carrier",
    dbSlug: "tempo-traveller-17-seater",
    ratePerKm: 30,
    highlight: "Full-capacity group van with high-roof walkthrough interior and individual AC vents.",
    terrainStrength: "Robust commercial powertrain built for multi-day outstation itineraries and long highway hauls.",
    imageKey: "/assets/images/gallery/tempo-traveller-exterior-view.jpg"
  },
  {
    slug: "force-urbania",
    name: "Force Urbania",
    category: "tempo-traveller",
    seats: 17,
    luggage: "17 bags + rear storage",
    dbSlug: "force-urbania",
    ratePerKm: 38,
    highlight: "European-engineered luxury van with monocoque body, independent suspension, and 6ft 3in standing height.",
    terrainStrength: "World-class acoustic dampening that eliminates highway road roar and body-roll.",
    imageKey: "/assets/images/gallery/force-urbania-luxury-cabin-interior.webp"
  },
  {
    slug: "urbania-12-seater-maharaja",
    name: "Urbania 12 Seater Maharaja",
    category: "tempo-traveller",
    seats: 12,
    luggage: "12 bags + rear storage",
    dbSlug: "urbania-12-seater-maharaja",
    ratePerKm: 38,
    highlight: "Ultra-luxury van with bespoke leather captain recliners, deployable calf supports, smart TV & chiller box.",
    terrainStrength: "First-class flight cabin experience engineered specifically for VIP delegates and luxury retreats.",
    imageKey: "/assets/images/gallery/urbania-12-seater-maharaja-white-exterior.webp"
  },
  {
    slug: "21-seater-mini-bus",
    name: "21 Seater Mini Bus",
    category: "mini-bus",
    seats: 21,
    luggage: "Overhead racks + rear boot",
    dbSlug: "mini-bus-21-seater",
    ratePerKm: 38,
    highlight: "Mid-sized coach with 2+1 seating layout for corporate offsites and wedding parties.",
    terrainStrength: "Powerful diesel engine maintaining strong hill-climbing momentum with full air conditioning active.",
    imageKey: "/assets/images/gallery/tour-coach-exterior-view.jpg"
  },
  {
    slug: "25-seater-mini-bus",
    name: "25 Seater Mini Bus",
    category: "mini-bus",
    seats: 25,
    luggage: "Overhead racks + rear boot",
    dbSlug: "mini-bus-25-seater",
    ratePerKm: 42,
    highlight: "Spacious department-sized coach with wide center aisle and high luggage capacity.",
    terrainStrength: "Air-assisted hydraulic brakes ensuring dependable stopping distance on long interstate corridors.",
    imageKey: "/assets/images/gallery/tour-coach-exterior-view.jpg"
  },
  {
    slug: "40-seater-tourist-bus",
    name: "40 Seater Tourist Bus",
    category: "tourist-bus",
    seats: 40,
    luggage: "Massive underfloor cargo hold",
    dbSlug: "tourist-bus-40-seater",
    ratePerKm: 55,
    highlight: "Full-size tourist coach with pneumatic air suspension and wide panoramic passenger windows.",
    terrainStrength: "Pneumatic air-bellow suspension that glides smoothly over uneven highway surfaces.",
    imageKey: "/assets/images/vehicles/tourist-bus-40-seater--front-01.jpg"
  },
  {
    slug: "55-seater-tourist-bus",
    name: "55 Seater Tourist Bus",
    category: "tourist-bus",
    seats: 55,
    luggage: "Full-coach underbody belly",
    dbSlug: "tourist-bus-55-seater",
    ratePerKm: 65,
    highlight: "Heavy-capacity tourist coach for large conventions, pilgrimage groups, and educational tours.",
    terrainStrength: "Twin-axle stability and high-output dual AC compressors keeping 55 passengers relaxed.",
    imageKey: "/assets/images/vehicles/tourist-bus-40-seater--front-01.jpg"
  }
];

export const PSEO_ORIGINS: PseoOrigin[] = [
  {
    slug: "bangalore-city",
    name: "Bangalore City (Central)",
    zone: "Central Bangalore",
    highwayAccess: "Immediate connection to Outer Ring Road, Mysore Road, and elevated toll flyovers.",
    pickupNote: "Doorstep pickup available across Majestic, MG Road, Malleshwaram, and central neighbourhoods.",
    distanceOffsetKm: 0,
    timeOffsetHours: 0
  },
  {
    slug: "whitefield",
    name: "Whitefield",
    zone: "East Bangalore",
    highwayAccess: "Quick routing via SH104, Old Madras Road (NH75) or Outer Ring Road to NICE expressway.",
    pickupNote: "Direct pickup at ITPL, EPIP Zone, Hope Farm, and residential communities across Whitefield.",
    distanceOffsetKm: 20,
    timeOffsetHours: 0.5
  },
  {
    slug: "koramangala",
    name: "Koramangala",
    zone: "South-Central Bangalore",
    highwayAccess: "Fast access to Hosur Road, Dairy Circle, and rapid link to the NICE peripheral road.",
    pickupNote: "Convenient doorstep boarding across all Koramangala blocks (1 to 8) and Sony World signal.",
    distanceOffsetKm: 5,
    timeOffsetHours: 0.2
  },
  {
    slug: "electronic-city",
    name: "Electronic City",
    zone: "South Bangalore",
    highwayAccess: "Immediate access to the Electronic City Elevated Tollway, Hosur Highway (NH44), and NICE Road.",
    pickupNote: "Pickup at Phase 1, Phase 2, Wipro Gate, and tech campuses with immediate south highway clearance.",
    distanceOffsetKm: -15, // saves km to southern routes (Mysore, Ooty, Salem, Vellore)
    timeOffsetHours: -0.3
  },
  {
    slug: "indiranagar",
    name: "Indiranagar",
    zone: "East-Central Bangalore",
    highwayAccess: "Effortless transit onto 100 Feet Road, Old Airport Road, and Old Madras Road.",
    pickupNote: "Doorstep pickup around CMH Road, Defence Colony, and metro station corridor.",
    distanceOffsetKm: 8,
    timeOffsetHours: 0.25
  },
  {
    slug: "jayanagar",
    name: "Jayanagar",
    zone: "South Bangalore",
    highwayAccess: "Instant connectivity to Kanakapura Road (NH948) and fast transit to Mysore Expressway via NICE road.",
    pickupNote: "Smooth residential boarding across Jayanagar 1st to 9th Blocks and South End Circle.",
    distanceOffsetKm: -5,
    timeOffsetHours: -0.1
  },
  {
    slug: "hebbal",
    name: "Hebbal",
    zone: "North Bangalore",
    highwayAccess: "Direct gateway onto Airport Expressway (NH44) and the Outer Ring Road intersection.",
    pickupNote: "Fast pickup around Manyata Tech Park, Hebbal Flyover, and Bellary Road corridor.",
    distanceOffsetKm: 12,
    timeOffsetHours: 0.2
  },
  {
    slug: "yelahanka",
    name: "Yelahanka",
    zone: "North Bangalore",
    highwayAccess: "Strategic access to NH44 North and Doddaballapur State Highway toward Tumkur.",
    pickupNote: "Immediate northern exit avoiding city congestion toward Lepakshi, Hyderabad, and Hampi.",
    distanceOffsetKm: 25,
    timeOffsetHours: 0.3
  },
  {
    slug: "marathahalli",
    name: "Marathahalli",
    zone: "East Bangalore",
    highwayAccess: "Outer Ring Road arterial hub with multi-lane links to Varthur and Sarjapur corridors.",
    pickupNote: "Pickup available across Marathahalli Bridge, Spice Garden, and tech park zones.",
    distanceOffsetKm: 15,
    timeOffsetHours: 0.35
  },
  {
    slug: "kempegowda-airport",
    name: "Kempegowda Airport (BLR)",
    zone: "Devanahalli / Airport",
    highwayAccess: "Direct elevated expressway transit with dedicated commercial pickup lanes at T1 and T2.",
    pickupNote: "Flight-tracked curbside chauffeur greeting outside Terminal 1 and Terminal 2 arrival gates.",
    distanceOffsetKm: 35,
    timeOffsetHours: 0.5
  }
];

export const PSEO_DESTINATIONS: PseoDestination[] = [
  {
    slug: "coorg",
    name: "Coorg (Madikeri)",
    state: "Karnataka",
    baseDistanceKm: 260,
    baseDriveTimeHours: 5.5,
    routeType: "hill-station",
    highway: "Bangalore-Mysore Expressway (NH275) & Kushalnagar Highway",
    keyStops: "Bylakuppe Golden Temple, Kaveri Nisargadhama, Raja's Seat",
    terrainHook: "The ascent from Kushalnagar to Madikeri twists through shaded coffee estates requiring high torque and steady brake cooling."
  },
  {
    slug: "mysore",
    name: "Mysore",
    state: "Karnataka",
    baseDistanceKm: 145,
    baseDriveTimeHours: 2.5,
    routeType: "heritage",
    highway: "Access-controlled 10-lane Bangalore-Mysore Expressway",
    keyStops: "Mysore Palace, Chamundi Hills, Brindavan Gardens, St. Philomena's Church",
    terrainHook: "High-speed access-controlled cruising allows sustained highway velocity with zero city slowdowns."
  },
  {
    slug: "ooty",
    name: "Ooty",
    state: "Tamil Nadu",
    baseDistanceKm: 280,
    baseDriveTimeHours: 6.5,
    routeType: "hill-station",
    highway: "NH181 via Bandipur Tiger Reserve & Gudalur Hill Pass",
    keyStops: "Bandipur Safari Gate, Pykara Lake, Botanical Gardens, Doddabetta Peak",
    terrainHook: "The scenic ascent climbs past 36 switchbacks and eucalyptus groves where hill-tested drivers ensure smooth, nausea-free travel."
  },
  {
    slug: "wayanad",
    name: "Wayanad",
    state: "Kerala",
    baseDistanceKm: 290,
    baseDriveTimeHours: 6.5,
    routeType: "hill-station",
    highway: "NH766 via Mysore, Gundlupet & Sulthan Bathery",
    keyStops: "Edakkal Caves, Banasura Sagar Dam, Chembra Peak, Pookode Lake",
    terrainHook: "Passing through the protected Nilgiri biosphere sanctuary requires punctuality to clear forest gates before the 9 PM curfew."
  },
  {
    slug: "goa",
    name: "Goa (Panaji)",
    state: "Goa",
    baseDistanceKm: 580,
    baseDriveTimeHours: 10.5,
    routeType: "coastal",
    highway: "NH48 6-lane Golden Quadrilateral via Hubli, Dharwad & Anmod Ghat",
    keyStops: "Davanagere Benne Dosa, Hubli bypass, Mollem National Park, Dudhsagar trails",
    terrainHook: "An epic 580 km cross-state journey demanding spacious cabin ergonomics, deep pushback recliners, and dual highway drivers."
  },
  {
    slug: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    baseDistanceKm: 340,
    baseDriveTimeHours: 6.5,
    routeType: "city",
    highway: "NH48 6-lane tollway via Hosur, Krishnagiri & Ranipet",
    keyStops: "Krishnagiri mango orchards, Vellore golden temple, Sriperumbudur industrial belt",
    terrainHook: "A heavily-trafficked commercial and family artery where high-performance dual-zone AC is essential in tropical heat."
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    baseDistanceKm: 570,
    baseDriveTimeHours: 8.5,
    routeType: "city",
    highway: "NH44 4/6-lane high-speed expressway via Anantapur & Kurnool",
    keyStops: "Lepakshi detour, Penukonda Fort, Gooty Fort viewpoint, Kurnool heritage",
    terrainHook: "Arrow-straight open expressway stretches reward high aerodynamic stability, steady cruise control, and uninterrupted speed."
  },
  {
    slug: "tirupati",
    name: "Tirupati",
    state: "Andhra Pradesh",
    baseDistanceKm: 250,
    baseDriveTimeHours: 4.5,
    routeType: "pilgrimage",
    highway: "NH69 via Hoskote, Kolar, Mulbagal & Chittoor bypass",
    keyStops: "Woody's Kolar, Sri Venkateswara Temple, Padmavathi Ammavari Temple",
    terrainHook: "Devotees journeying for time-slotted darshans rely on punctual chauffeurs and generous luggage holds for puja materials."
  },
  {
    slug: "pondicherry",
    name: "Pondicherry",
    state: "Tamil Nadu / UT",
    baseDistanceKm: 315,
    baseDriveTimeHours: 6.0,
    routeType: "coastal",
    highway: "NH77 / NH48 via Krishnagiri, Chengam & Tindivanam",
    keyStops: "Tiruvannamalai temple backdrop, Gingee Fort, Promenade Beach, Auroville",
    terrainHook: "Transitions from rocky Deccan plateau into French colonial coastal roads requiring serene passenger isolation."
  },
  {
    slug: "hampi",
    name: "Hampi",
    state: "Karnataka",
    baseDistanceKm: 340,
    baseDriveTimeHours: 6.5,
    routeType: "heritage",
    highway: "NH48 to Chitradurga, then NH50 4-lane expressway via Hospet",
    keyStops: "Chitradurga Windmills, Tungabhadra Dam, Virupaksha Temple, Vijayanagara ruins",
    terrainHook: "Vast expanses of historical granite boulder valleys where tinted UV-cut panoramic glass shields passengers from arid heat."
  },
  {
    slug: "gokarna",
    name: "Gokarna",
    state: "Karnataka",
    baseDistanceKm: 485,
    baseDriveTimeHours: 9.0,
    routeType: "coastal",
    highway: "NH48 to Haveri, then state highway via Sirsi, Kumta & NH66",
    keyStops: "Sirsi spice plantations, Sahasralinga river rocks, Om Beach, Mahabaleshwar Temple",
    terrainHook: "Winding rural ghat curves through the dense tropical forests of Uttara Kannada demand seasoned commercial steering."
  },
  {
    slug: "chikmagalur",
    name: "Chikmagalur",
    state: "Karnataka",
    baseDistanceKm: 245,
    baseDriveTimeHours: 4.5,
    routeType: "hill-station",
    highway: "NH75 4-lane tollway via Kunigal, Channarayapatna & Hassan bypass",
    keyStops: "Yagachi Water Sports, Belur Chennakeshava Temple, Mullayanagiri Peak",
    terrainHook: "The ascent toward Karnataka's highest peak involves tight hairpins and steep private estate inclines requiring rugged torque."
  },
  {
    slug: "kabini",
    name: "Kabini (Nagarhole)",
    state: "Karnataka",
    baseDistanceKm: 220,
    baseDriveTimeHours: 4.8,
    routeType: "wildlife",
    highway: "Mysore Expressway (NH275) to Mysore Ring Road, then HD Kote Road",
    keyStops: "Mysore outskirts, Kabini Dam backwaters, Nagarhole National Park safari gates",
    terrainHook: "Gentle rural single-carriageway tracks around the lake perimeter require soft suspension damping to keep safari guests rested."
  },
  {
    slug: "br-hills",
    name: "BR Hills (Biligiriranga)",
    state: "Karnataka",
    baseDistanceKm: 180,
    baseDriveTimeHours: 4.2,
    routeType: "wildlife",
    highway: "NH948 via Kanakapura, Malavalli, Kollegal & Yelandur",
    keyStops: "Chamarajanagar silk belt, Biligiriranganatha Swamy Temple, tiger sanctuary viewpoints",
    terrainHook: "Steep forest reserve climb through misty shola woods with restricted night access and wildlife roadside crossings."
  },
  {
    slug: "nandi-hills",
    name: "Nandi Hills",
    state: "Karnataka",
    baseDistanceKm: 60,
    baseDriveTimeHours: 1.2,
    routeType: "weekend-getaway",
    highway: "NH44 Airport Highway, branching at Devanahalli via SH104",
    keyStops: "Tipu Sultan Summer Residence, Nandi Fort viewpoint, Bhoga Nandeeshwara Temple",
    terrainHook: "A popular dawn sprint with tight 38-hairpin hill curves rewarding responsive handling and punctual sunrise departures."
  },
  {
    slug: "shivanasamudra",
    name: "Shivanasamudra Falls",
    state: "Karnataka",
    baseDistanceKm: 135,
    baseDriveTimeHours: 3.0,
    routeType: "weekend-getaway",
    highway: "NH948 via Kanakapura, Malavalli & Bharachukki road",
    keyStops: "Gaganachukki waterfalls, Bharachukki falls, Darga viewpoint, Kaveri riverbed",
    terrainHook: "A scenic rustic highway journey through lush sugar cane fields terminating at roaring seasonal river gorges."
  },
  {
    slug: "lepakshi",
    name: "Lepakshi",
    state: "Andhra Pradesh",
    baseDistanceKm: 125,
    baseDriveTimeHours: 2.5,
    routeType: "heritage",
    highway: "NH44 4-lane expressway past Bagepalli border to Kodikonda check-post",
    keyStops: "Jatayu theme park, Monolithic Nandi bull, Veerabhadra Temple hanging pillar",
    terrainHook: "A smooth, high-speed interstate highway run ideal for senior citizens and architecture enthusiasts seeking day trips."
  },
  {
    slug: "madikeri",
    name: "Madikeri",
    state: "Karnataka",
    baseDistanceKm: 260,
    baseDriveTimeHours: 5.5,
    routeType: "hill-station",
    highway: "NH275 through Hunsur, Periyapatna & Kushalnagar",
    keyStops: "Abbey Falls, Madikeri Fort, Omkareshwara Temple, Stuart Hill coffee homestays",
    terrainHook: "Elevated hill capital surrounded by misty valleys where dependable braking and hill-hold assist ensure smooth ascents."
  },
  {
    slug: "sakleshpur",
    name: "Sakleshpur",
    state: "Karnataka",
    baseDistanceKm: 225,
    baseDriveTimeHours: 4.2,
    routeType: "hill-station",
    highway: "NH75 4-lane expressway to Hassan, continuing toward Shiradi Ghat entrance",
    keyStops: "Manjarabad star-shaped fort, Bisle Ghat viewpoint, Hemavathi river backwaters",
    terrainHook: "Gateway to the Western Ghats with panoramic cardamom plantations and rolling hill passes."
  },
  {
    slug: "hassan",
    name: "Hassan",
    state: "Karnataka",
    baseDistanceKm: 185,
    baseDriveTimeHours: 3.2,
    routeType: "heritage",
    highway: "NH75 4-lane expressway past Kunigal & Channarayapatna",
    keyStops: "Shravanabelagola monolithic Gommateshwara, Gorur Dam, Shettihalli Rosary Church",
    terrainHook: "A fast, impeccably maintained expressway corridor ideal for quick corporate retreats and historical tours."
  },
  {
    slug: "shimoga",
    name: "Shimoga (Shivamogga)",
    state: "Karnataka",
    baseDistanceKm: 300,
    baseDriveTimeHours: 5.5,
    routeType: "city",
    highway: "NH48 to Tumkur, then NH69 via Kadur, Birur & Tarikere",
    keyStops: "Tunga river front, Sakrebyle elephant camp, gateway to Jog Falls & Agumbe",
    terrainHook: "Vibrant entrance to Malnad region with lush paddy fields transitioning into dense rainforest foothills."
  },
  {
    slug: "udupi",
    name: "Udupi",
    state: "Karnataka",
    baseDistanceKm: 410,
    baseDriveTimeHours: 8.0,
    routeType: "coastal",
    highway: "NH75 through Sakleshpur & Shiradi Ghat, or via Charmadi Ghat to coastal NH66",
    keyStops: "Udupi Sri Krishna Temple, Malpe Beach, St. Mary's Island, Kapu lighthouse",
    terrainHook: "Demanding coastal descent across steep Western Ghat hairpins where experienced hill drivers make all the difference."
  },
  {
    slug: "mangalore",
    name: "Mangalore",
    state: "Karnataka",
    baseDistanceKm: 355,
    baseDriveTimeHours: 7.2,
    routeType: "coastal",
    highway: "NH75 direct via Kunigal, Hassan, Sakleshpur & Shiradi Ghat",
    keyStops: "Panambur Beach, Mangaladevi Temple, Kadri Manjunatha, seafood dining spots",
    terrainHook: "Important commercial and pilgrimage link connecting the Deccan plateau with the Arabian Sea coast."
  },
  {
    slug: "belgaum",
    name: "Belgaum (Belagavi)",
    state: "Karnataka",
    baseDistanceKm: 505,
    baseDriveTimeHours: 7.5,
    routeType: "city",
    highway: "NH48 6-lane Golden Quadrilateral highway via Tumkur, Chitradurga & Hubli",
    keyStops: "Belgaum Fort, Kamal Basti, Gokak Falls detour, Kittur Fort memorial",
    terrainHook: "High-speed six-lane cruising where long-wheelbase stability and individual air vents maximize passenger comfort."
  },
  {
    slug: "hubli",
    name: "Hubli (Hubballi)",
    state: "Karnataka",
    baseDistanceKm: 410,
    baseDriveTimeHours: 6.5,
    routeType: "city",
    highway: "NH48 access-controlled expressway via Haveri & Davanagere",
    keyStops: "Unkal Lake, Nrupatunga Betta, Glass House, culinary stops for authentic Jolada Roti",
    terrainHook: "North Karnataka's prime commercial nexus reached via a fast, toll-integrated 6-lane highway."
  },
  {
    slug: "dharwad",
    name: "Dharwad",
    state: "Karnataka",
    baseDistanceKm: 430,
    baseDriveTimeHours: 7.0,
    routeType: "heritage",
    highway: "NH48 continuing seamlessly past Hubli bypass",
    keyStops: "Dharwad Pedha heritage confectioneries, Karnatak University campus, Kelkar museum",
    terrainHook: "Educational and cultural twin-city offering tranquil heritage touring along pristine highway bypasses."
  },
  {
    slug: "bijapur",
    name: "Bijapur (Vijayapura)",
    state: "Karnataka",
    baseDistanceKm: 525,
    baseDriveTimeHours: 9.0,
    routeType: "heritage",
    highway: "NH48 to Chitradurga, then NH50 past Hospet & Almatti Dam",
    keyStops: "Gol Gumbaz whispering gallery, Ibrahim Rauza, Bara Kaman, Almatti Dam gardens",
    terrainHook: "Arid Deccan highway traversing historical sultanate frontiers requiring generous hydration and reliable AC cooling."
  },
  {
    slug: "badami",
    name: "Badami",
    state: "Karnataka",
    baseDistanceKm: 450,
    baseDriveTimeHours: 7.5,
    routeType: "heritage",
    highway: "NH48 to Chitradurga, NH50 toward Kushtagi, then SH14 via Ron",
    keyStops: "Rock-cut cave temples, Agastya Lake, Bhutanatha temples, Badami Fort cliffs",
    terrainHook: "Red sandstone canyon tracks housing 6th-century Chalukyan rock architecture demanding robust vehicle suspension."
  },
  {
    slug: "aihole",
    name: "Aihole",
    state: "Karnataka",
    baseDistanceKm: 460,
    baseDriveTimeHours: 8.0,
    routeType: "heritage",
    highway: "NH50 corridor past Ilkal, branching into Malaprabha river valley",
    keyStops: "Durga Temple complex, Lad Khan Temple, Ravana Phadi cave temple",
    terrainHook: "Cradle of Indian temple architecture set amidst peaceful rural countryside where private chauffeured travel is indispensable."
  },
  {
    slug: "pattadakal",
    name: "Pattadakal",
    state: "Karnataka",
    baseDistanceKm: 455,
    baseDriveTimeHours: 7.8,
    routeType: "heritage",
    highway: "Connecting loop between Badami and Aihole along the Malaprabha river",
    keyStops: "UNESCO World Heritage temple cluster, Virupaksha temple, Mallikarjuna shrine",
    terrainHook: "Intricately carved 8th-century temple sanctuaries best explored with dedicated day-hire vehicles."
  },
  {
    slug: "hospet",
    name: "Hospet (Hosapete)",
    state: "Karnataka",
    baseDistanceKm: 330,
    baseDriveTimeHours: 6.0,
    routeType: "heritage",
    highway: "NH48 to Chitradurga, continuing directly onto 4-lane NH50",
    keyStops: "Tungabhadra Dam musical fountains, Anjanadri Hill crossing, base for Hampi exploration",
    terrainHook: "Modern accommodation hub for Hampi explorers reached comfortably via fast divided highways."
  },
  {
    slug: "bellary",
    name: "Bellary (Ballari)",
    state: "Karnataka",
    baseDistanceKm: 310,
    baseDriveTimeHours: 6.0,
    routeType: "city",
    highway: "NH44 North toward Anantapur, then NH67 westward",
    keyStops: "Bellary Fort on single rock hill, mining heritage centers, historical cantonment",
    terrainHook: "Industrial and historical hub requiring comfortable, dust-sealed cabins across warm sunlit plains."
  },
  {
    slug: "raichur",
    name: "Raichur",
    state: "Karnataka",
    baseDistanceKm: 410,
    baseDriveTimeHours: 7.5,
    routeType: "heritage",
    highway: "NH44 through Andhra Pradesh, branching via Guntakal and Mantralayam road",
    keyStops: "Raichur Fort, Krishna and Tungabhadra doab viewpoints, historic battlefields",
    terrainHook: "Doab river basin roads connecting historical battlements with long highway straightaways."
  },
  {
    slug: "gulbarga",
    name: "Gulbarga (Kalaburagi)",
    state: "Karnataka",
    baseDistanceKm: 565,
    baseDriveTimeHours: 9.5,
    routeType: "heritage",
    highway: "NH50 northward via Hospet and Kushtagi, or via Hyderabad NH44 corridor",
    keyStops: "Gulbarga Fort, Jami Masjid dome, Khwaja Bande Nawaz Dargah, Sharana Basaveshwara temple",
    terrainHook: "Extensive northern Karnataka cultural seat best travelled with spacious multi-seater pushback luxury."
  },
  {
    slug: "bidar",
    name: "Bidar",
    state: "Karnataka",
    baseDistanceKm: 650,
    baseDriveTimeHours: 11.0,
    routeType: "heritage",
    highway: "NH44 North past Hyderabad outer ring road or NH50 via Kalaburagi",
    keyStops: "Bidar Fort, Mahmud Gawan Madrasa, Bahmani tombs, Bidriware handicraft craft markets",
    terrainHook: "Karnataka's northernmost historic crown sitting high on a laterite plateau requiring dual drivers."
  },
  {
    slug: "koppal",
    name: "Koppal",
    state: "Karnataka",
    baseDistanceKm: 360,
    baseDriveTimeHours: 6.8,
    routeType: "heritage",
    highway: "NH48 to Chitradurga, then NH50 toward Hospet & Koppal",
    keyStops: "Koppal Fort, Mahadeva Temple at Itagi ('Devalaya Chakravarti'), Kinnal toy craft villages",
    terrainHook: "World-renowned Kinnal wooden art villages and stone temples accessible via smooth toll highways."
  },
  {
    slug: "gadag",
    name: "Gadag",
    state: "Karnataka",
    baseDistanceKm: 395,
    baseDriveTimeHours: 7.0,
    routeType: "heritage",
    highway: "NH48 past Chitradurga to Ranibennur, then state highway via Mundargi",
    keyStops: "Trikuteshwara temple complex, Veeranarayana temple, Lakkundi stepwells",
    terrainHook: "Rich architectural hub with intricate Kalyana Chalukya stepped water wells and stone pillars."
  },
  {
    slug: "haveri",
    name: "Haveri",
    state: "Karnataka",
    baseDistanceKm: 340,
    baseDriveTimeHours: 5.5,
    routeType: "heritage",
    highway: "NH48 6-lane Golden Quadrilateral highway directly through Haveri",
    keyStops: "Siddheshwara temple, Byadgi red chilli market, Cardamom garland artisan bazaars",
    terrainHook: "Centrally positioned on the smooth NH48 expressway, providing easy access to historic stepwells."
  },
  {
    slug: "davanagere",
    name: "Davanagere",
    state: "Karnataka",
    baseDistanceKm: 265,
    baseDriveTimeHours: 4.2,
    routeType: "weekend-getaway",
    highway: "NH48 6-lane expressway directly from Bangalore via Tumkur",
    keyStops: "Original Benne Dosa eateries, Kunduvada Kere lake, Bathi Gudda hilltop viewpoint",
    terrainHook: "Karnataka's culinary butter dosa capital sitting squarely on a pristine six-lane transit corridor."
  },
  {
    slug: "chitradurga",
    name: "Chitradurga",
    state: "Karnataka",
    baseDistanceKm: 200,
    baseDriveTimeHours: 3.5,
    routeType: "heritage",
    highway: "NH48 6-lane access-controlled highway past Tumkur and Sira",
    keyStops: "Chitradurga Fort (Kallina Kote - 'Fort of Seven Rounds'), Onake Obavva Kindi, Windmill hills",
    terrainHook: "Legendary seven-tiered granite stone fortress rising dramatically along the central highway."
  },
  {
    slug: "tumkur",
    name: "Tumkur (Tumakuru)",
    state: "Karnataka",
    baseDistanceKm: 70,
    baseDriveTimeHours: 1.5,
    routeType: "weekend-getaway",
    highway: "NH48 elevated tollway past Nelamangala",
    keyStops: "Siddaganga Mutt, Devarayanadurga hill temples, Namada Chilume natural spring",
    terrainHook: "Quick weekend pilgrimage escape just outside the city with forested hill switchbacks."
  },
  {
    slug: "mandya",
    name: "Mandya",
    state: "Karnataka",
    baseDistanceKm: 100,
    baseDriveTimeHours: 1.8,
    routeType: "weekend-getaway",
    highway: "Bangalore-Mysore Expressway (NH275)",
    keyStops: "Sugar factory countryside, Maddur border eateries, Kokkare Bellur pelican sanctuary",
    terrainHook: "Fast-moving green agricultural plain reached via the state's most modern high-speed expressway."
  },
  {
    slug: "ramanagara",
    name: "Ramanagara",
    state: "Karnataka",
    baseDistanceKm: 50,
    baseDriveTimeHours: 1.1,
    routeType: "weekend-getaway",
    highway: "Bangalore-Mysore Expressway (NH275)",
    keyStops: "Ramadevara Betta vulture sanctuary, Sholay shooting cliffs, silk cocoon market",
    terrainHook: "Rugged granite rock formations famous for climbing, adventure trekking, and quick morning drives."
  },
  {
    slug: "channapatna",
    name: "Channapatna",
    state: "Karnataka",
    baseDistanceKm: 65,
    baseDriveTimeHours: 1.3,
    routeType: "weekend-getaway",
    highway: "Bangalore-Mysore Expressway (NH275)",
    keyStops: "Artisan wooden lacquerware toy factories, silk farms, highway craft centers",
    terrainHook: "The world-famous 'Gombegala Ooru' (Toy Town) ideal for short family souvenir shopping road trips."
  },
  {
    slug: "maddur",
    name: "Maddur",
    state: "Karnataka",
    baseDistanceKm: 80,
    baseDriveTimeHours: 1.5,
    routeType: "weekend-getaway",
    highway: "Bangalore-Mysore Expressway (NH275)",
    keyStops: "Iconic Maddur Tiffany breakfast joints, Shimsha river bridge, Ugra Narasimha temple",
    terrainHook: "A celebrated morning breakfast destination on the smooth 10-lane expressway route."
  },
  {
    slug: "malavalli",
    name: "Malavalli",
    state: "Karnataka",
    baseDistanceKm: 110,
    baseDriveTimeHours: 2.2,
    routeType: "weekend-getaway",
    highway: "NH948 via Kanakapura",
    keyStops: "Marehalli Sri Ranga temple, scenic village coconut groves, crossroads to Kaveri falls",
    terrainHook: "Serene rural southern highway offering quiet countryside driving away from expressway commercial traffic."
  },
  {
    slug: "melukote",
    name: "Melukote",
    state: "Karnataka",
    baseDistanceKm: 140,
    baseDriveTimeHours: 2.5,
    routeType: "pilgrimage",
    highway: "Bangalore-Mysore Expressway, branching at Mandya via SH84",
    keyStops: "Cheluvanarayana Swamy Temple, Yoga Narasimha hill shrine, Kalyani step pond, Puliyogare feasts",
    terrainHook: "Ancient temple hilltop town with panoramic valley views and heritage stone stepwells."
  },
  {
    slug: "srirangapatna",
    name: "Srirangapatna",
    state: "Karnataka",
    baseDistanceKm: 125,
    baseDriveTimeHours: 2.2,
    routeType: "heritage",
    highway: "Bangalore-Mysore Expressway (NH275)",
    keyStops: "Ranganathaswamy Temple, Dariya Daulat Bagh, Gumbaz of Tipu Sultan, Sangam river confluence",
    terrainHook: "Kaveri river island capital steeped in Mysore sultanate and Hoysala religious history."
  },
  {
    slug: "mahabalipuram",
    name: "Mahabalipuram (Mamallapuram)",
    state: "Tamil Nadu",
    baseDistanceKm: 350,
    baseDriveTimeHours: 6.8,
    routeType: "coastal",
    highway: "NH48 past Kanchipuram, connecting to East Coast Road (ECR)",
    keyStops: "Shore Temple by the sea, Pancha Rathas, Arjuna's Penance, beachside seafood shacks",
    terrainHook: "UNESCO monolith stone sanctuaries on the Bay of Bengal reached via comfortable cross-border touring."
  },
  {
    slug: "vellore",
    name: "Vellore",
    state: "Tamil Nadu",
    baseDistanceKm: 215,
    baseDriveTimeHours: 4.0,
    routeType: "heritage",
    highway: "NH48 via Hosur, Krishnagiri & Ambur",
    keyStops: "Sripuram Golden Temple, Vellore Fort with granite moat, Jalakandeswarar temple, Ambur Biryani",
    terrainHook: "Direct expressway link to world-class hospital centers, university campuses, and golden shrines."
  }
];

export const PSEO_INTENT_MODIFIERS = [
  "transparent pricing",
  "no hidden charges",
  "with GST invoice",
  "for corporate billing",
  "female-safe travel",
  "pet-friendly",
  "senior citizen friendly",
  "with experienced driver",
  "24/7 support",
  "immediate booking",
  "luxury",
  "budget-friendly",
  "one-way drop",
  "round trip",
  "toll included",
  "driver bata included",
  "free water bottles",
  "charging points",
  "pushback seats",
  "sleeper option"
];

export interface ResolvedPseoRoute {
  vehicle: PseoVehicle;
  origin: PseoOrigin;
  destination: PseoDestination;
  intentModifier?: string;
  distanceKm: number;
  driveTimeHours: string;
  primaryKeyword: string;
  urlSlug: string;
  canonicalPath: string;
  uniqueRouteHook: string;
  metaTitle: string;
  metaDescription: string;
  searchIntent: "Commercial" | "Transactional" | "Informational";
  estimatedFare: number;
}

export function findPseoVehicle(slug: string): PseoVehicle | undefined {
  return PSEO_VEHICLES.find(
    (v) =>
      v.slug === slug ||
      v.dbSlug === slug ||
      slug.replace(/-/g, "").toLowerCase() === v.slug.replace(/-/g, "").toLowerCase()
  );
}

export function findPseoOrigin(slug: string): PseoOrigin | undefined {
  return PSEO_ORIGINS.find((o) => o.slug === slug || o.name.toLowerCase().includes(slug.replace(/-/g, " ")));
}

export function findPseoDestination(slug: string): PseoDestination | undefined {
  return PSEO_DESTINATIONS.find(
    (d) => d.slug === slug || d.name.toLowerCase().includes(slug.replace(/-/g, " "))
  );
}

/** Parses route slugs in format "whitefield-to-coorg" */
export function parseRouteSlug(routeSlug: string): { originSlug: string; destinationSlug: string } | null {
  const parts = routeSlug.split("-to-");
  if (parts.length !== 2) return null;
  return { originSlug: parts[0]!, destinationSlug: parts[1]! };
}

/** Computes accurate distance & drive time taking into account the specific origin in Bangalore */
export function calculateRouteMetrics(
  origin: PseoOrigin,
  destination: PseoDestination
): { distanceKm: number; driveTimeFormatted: string; hoursNumeric: number } {
  // Northern destinations (Lepakshi, Hyderabad, Nandi Hills) are closer from Hebbal/Yelahanka/Airport
  // Southern destinations (Mysore, Ooty, Coorg, Salem, Wayanad) are closer from Electronic City/Jayanagar
  // Eastern destinations (Tirupati, Chennai, Vellore, Pondicherry) are closer from Whitefield/Indiranagar
  let modifier = origin.distanceOffsetKm;
  let timeModifier = origin.timeOffsetHours;

  const isSouthRoute = ["mysore", "coorg", "ooty", "wayanad", "kabini", "br-hills", "shivanasamudra", "madikeri", "sakleshpur", "mandya", "ramanagara", "channapatna", "maddur", "malavalli", "melukote", "srirangapatna"].includes(destination.slug);
  const isNorthRoute = ["nandi-hills", "lepakshi", "hyderabad", "hampi", "belgaum", "hubli", "dharwad", "bijapur", "badami", "aihole", "pattadakal", "hospet", "bellary", "raichur", "gulbarga", "bidar", "koppal", "gadag", "haveri", "davanagere", "chitradurga", "tumkur"].includes(destination.slug);
  const isEastRoute = ["tirupati", "chennai", "vellore", "mahabalipuram", "pondicherry"].includes(destination.slug);

  if (isSouthRoute) {
    if (origin.slug === "electronic-city") {
      modifier = -20;
      timeModifier = -0.4;
    } else if (origin.slug === "whitefield" || origin.slug === "kempegowda-airport") {
      modifier = +25;
      timeModifier = +0.5;
    }
  } else if (isNorthRoute) {
    if (origin.slug === "yelahanka" || origin.slug === "hebbal") {
      modifier = -20;
      timeModifier = -0.4;
    } else if (origin.slug === "kempegowda-airport") {
      modifier = -30;
      timeModifier = -0.6;
    } else if (origin.slug === "electronic-city") {
      modifier = +25;
      timeModifier = +0.6;
    }
  } else if (isEastRoute) {
    if (origin.slug === "whitefield" || origin.slug === "indiranagar" || origin.slug === "marathahalli") {
      modifier = -15;
      timeModifier = -0.3;
    }
  }

  const finalDistance = Math.max(30, destination.baseDistanceKm + modifier);
  const rawHours = Math.max(0.8, destination.baseDriveTimeHours + timeModifier);
  const hoursFormatted = rawHours.toFixed(1) + " hours";

  return {
    distanceKm: finalDistance,
    driveTimeFormatted: hoursFormatted,
    hoursNumeric: rawHours
  };
}

export function generatePseoHook(vehicle: PseoVehicle, origin: PseoOrigin, destination: PseoDestination): string {
  const vName = vehicle.name;
  const oName = origin.name;
  const dName = destination.name;

  if (destination.routeType === "hill-station") {
    if (vehicle.slug.includes("urbania")) {
      return `The Force Urbania's monocoque chassis and independent suspension eliminate body roll while climbing the winding tea and coffee plantation ghats to ${dName}, departing straight from ${oName}.`;
    }
    if (vehicle.slug === "fortuner") {
      return `With full-time 4x4 traction and 220mm ground clearance, the Fortuner easily tackles rocky homestay access tracks and wet hairpins around ${dName} after a prompt pickup in ${oName}.`;
    }
    if (vehicle.slug === "innova-crysta" || vehicle.slug === "innova-hycross") {
      return `The ${vName}'s powerful hill-climbing torque and ergonomic middle-row captain seats prevent altitude fatigue along the scenic ascent to ${dName} from ${oName}.`;
    }
    return `Our hill-experienced chauffeurs take the gentlest gradient roads up to ${dName} with ${vName}, ensuring a smooth, nausea-free mountain trip starting directly from ${oName}.`;
  }

  if (destination.routeType === "heritage") {
    if (vehicle.category === "mini-bus" || vehicle.category === "tourist-bus") {
      return `High panoramic windows, full air-conditioning, and deep overhead storage make the ${vName} the premier group choice for touring ${dName}'s historic monuments from ${oName}.`;
    }
    if (vehicle.slug.includes("urbania")) {
      return `Onboard charging ports and tinted UV-cut glass keep passengers relaxed across long open highway stretches from ${oName} to the ancient ruins of ${dName}.`;
    }
    return `Enjoy seamless highway cruising along ${destination.highway} in a sanitized ${vName}, arriving fresh to explore ${dName} with transparent per-km billing from ${oName}.`;
  }

  if (destination.routeType === "coastal") {
    return `Long-distance highway ergonomics and high-output dual air-conditioning in the ${vName} shield travelers from coastal heat between ${oName} and ${dName}.`;
  }

  if (destination.routeType === "pilgrimage") {
    return `Spacious boot space for puja offerings and smooth pushback seating ensure elderly family members complete their pilgrimage to ${dName} from ${oName} in restful comfort.`;
  }

  if (destination.routeType === "wildlife") {
    return `Timed departures from ${oName} guarantee clearing the sanctuary forest gate curfews before dusk, with ${vName}'s elevated seating providing optimal safari corridor views.`;
  }

  return `Enjoy dependable, punctual point-to-point transit from ${oName} to ${dName} in a verified ${vName} with transparent pricing and no hidden charges.`;
}

export function resolvePseoRoute(
  vehicleSlug: string,
  originSlug: string,
  destinationSlug: string,
  intentModifier?: string
): ResolvedPseoRoute | null {
  const vehicle = findPseoVehicle(vehicleSlug);
  const origin = findPseoOrigin(originSlug);
  const destination = findPseoDestination(destinationSlug);

  if (!vehicle || !origin || !destination) return null;

  const metrics = calculateRouteMetrics(origin, destination);
  const modifierText = intentModifier ? ` with ${intentModifier}` : "";
  const primaryKeyword = `${vehicle.name} rental from ${origin.name} to ${destination.name}${modifierText}`;
  const urlSlug = `/rent/${vehicle.slug}/${origin.slug}-to-${destination.slug}`;
  const canonicalPath = urlSlug;
  const uniqueRouteHook = generatePseoHook(vehicle, origin, destination);

  const metaTitle = `${vehicle.name} ${origin.name.split(" ")[0]} to ${destination.name.split(" ")[0]} | Yogi Tours`.slice(0, 60);

  const trustSignal = intentModifier || "transparent per-km billing and no hidden charges";
  const metaDescription = `Book ${vehicle.name} from ${origin.name} to ${destination.name} (${metrics.distanceKm} km, ${metrics.driveTimeFormatted}). ${trustSignal}. Verified drivers.`.slice(0, 155);

  const rate = vehicle.ratePerKm || 18;
  const estimatedFare = Math.round(metrics.distanceKm * 2 * rate); // standard round-trip estimate base

  return {
    vehicle,
    origin,
    destination,
    intentModifier,
    distanceKm: metrics.distanceKm,
    driveTimeHours: metrics.driveTimeFormatted,
    primaryKeyword,
    urlSlug,
    canonicalPath,
    uniqueRouteHook,
    metaTitle,
    metaDescription,
    searchIntent: intentModifier && (intentModifier.includes("booking") || intentModifier.includes("drop") || intentModifier.includes("round trip")) ? "Transactional" : "Commercial",
    estimatedFare
  };
}

/** Generates dynamic contextual FAQs for this exact vehicle + route */
export function generatePseoFaqs(resolved: ResolvedPseoRoute) {
  const { vehicle, origin, destination, distanceKm, driveTimeHours, estimatedFare } = resolved;
  return [
    {
      question: `What is the driving distance and travel time from ${origin.name} to ${destination.name} in a ${vehicle.name}?`,
      answer: `The road distance from ${origin.name}, Bangalore to ${destination.name} is approximately ${distanceKm} km. In a ${vehicle.name}, the drive typically takes around ${driveTimeHours} via ${destination.highway}, depending on departure time and traffic conditions.`
    },
    {
      question: `Can I get doorstep pickup in ${origin.name} for our trip to ${destination.name}?`,
      answer: `Yes, Yogi Tours & Travels provides 100% confirmed doorstep pickup across all residential apartments, tech parks, hotels, and landmarks in ${origin.name}. Your chauffeur arrives punctually with the sanitized vehicle ready for immediate departure.`
    },
    {
      question: `Is the ${vehicle.name} suitable for the road conditions to ${destination.name}?`,
      answer: `Yes, the ${vehicle.name} is specifically recommended for the ${destination.name} route. ${resolved.uniqueRouteHook}`
    },
    {
      question: `How is the rental fare calculated for this ${vehicle.name} trip?`,
      answer: `We follow transparent, itemized billing. The estimated base round-trip tariff begins from approximately ₹${estimatedFare.toLocaleString("en-IN")} based on our per-km rate. All driver Bata, toll options, and permit taxes are confirmed upfront with no hidden charges.`
    }
  ];
}
