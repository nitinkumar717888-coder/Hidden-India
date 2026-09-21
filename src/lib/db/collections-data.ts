/**
 * HIDDEN INDIA — CURATED EDITORIAL COLLECTIONS DATASET
 * Thematic trails connecting verified destinations with concrete editorial context.
 * Strict standard: No fabricated facts, verified destination references only.
 */

export interface SeedCollectionWaypoint {
  destinationSlug: string;
  sequence: number;
  editorialNote: string;
}

export interface SeedCollectionData {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImageUrl: string;
  region: string;
  theme: string;
  editorialStatus: 'published' | 'draft';
  waypoints: SeedCollectionWaypoint[];
}

export const RESEARCHED_COLLECTIONS: SeedCollectionData[] = [
  // 1. Forgotten Fortresses of Haryana & the Borderlands
  {
    title: 'Forgotten Fortresses of Haryana & the Borderlands',
    slug: 'forgotten-fortresses-haryana-borderlands',
    shortDescription:
      'Ancient mud-brick bastions, medieval desert keeps, and Aravalli mountain citadels guarding the historic approaches to Delhi.',
    description:
      'Long before the Grand Trunk Road was paved, the plains of Haryana and the northern fringes of the Thar Desert formed the critical defensive marchland protecting northern India’s imperial capitals. This curated trail links four extraordinary military monuments spanning sixteen centuries: the massive Kushan-era mud-and-brick ramparts of Qila Mubarak in Bathinda, the 3rd-century Bhati fortress of Bhatner along the dry Ghaggar riverbed, the isolated Aravalli stronghold of Kotla built by the Khanzadas of Mewat, and Chor Gumbad—the enigmatic Afghan watchtower overlooking ancient caravan paths in Narnaul.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    region: 'Haryana & Borderlands',
    theme: 'Military Architecture & Fortifications',
    editorialStatus: 'published',
    waypoints: [
      {
        destinationSlug: 'qila-mubarak-bathinda',
        sequence: 1,
        editorialNote:
          'Begin at India’s oldest surviving brick fortress, where Razia Sultana was held in 1240 CE.',
      },
      {
        destinationSlug: 'bhatner-fort-hanumangarh',
        sequence: 2,
        editorialNote:
          'Follow the ancient Ghaggar corridor south to explore 3rd-century hydraulic mud-brick ramparts assaulted by Timur.',
      },
      {
        destinationSlug: 'kotla-fort-mosque-nuh-mewat',
        sequence: 3,
        editorialNote:
          'Cross eastward to the rocky Aravalli amphitheater where Khanzada chieftains erected sloping Tughlaq-style stone battlements.',
      },
      {
        destinationSlug: 'chor-gumbad-narnaul',
        sequence: 4,
        editorialNote:
          'Conclude at the ‘Signpost of Narnaul’, an imposing 14th-century Afghan lookout tower utilized by caravan guards and medieval outlaws.',
      },
    ],
  },

  // 2. Hidden Mughal Wayposts of the Grand Highway & Frontier
  {
    title: 'Hidden Mughal Wayposts of the Grand Highway & Frontier',
    slug: 'hidden-mughal-wayposts-grand-highway',
    shortDescription:
      'Trace imperial resting stations, hydraulic pavilions, and royal mausoleums along historical Mughal corridors of Punjab and Haryana.',
    description:
      'Between the 16th and 17th centuries, the Mughal emperors developed an elaborate transit network connecting Delhi with Lahore and the frontier provinces. Beyond the heavily frequented urban centers lie serene provincial pavilions and monumental roadside wayposts. This trail traces the Grand Trunk Road and regional mint outposts through four remarkable sites: the monumental walled caravanserai of Doraha, the hydraulic royal gardens and cooling chambers of Aam Khas Bagh in Sirhind, the luminous Persian octagonal tomb of Sheikh Chehli built under Prince Dara Shikoh, and the 1591 CE water palace of Jal Mahal in Narnaul.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1200&q=80',
    region: 'Punjab & Haryana',
    theme: 'Mughal Heritage & Hydraulic Architecture',
    editorialStatus: 'published',
    waypoints: [
      {
        destinationSlug: 'mughal-sarai-doraha-ludhiana',
        sequence: 1,
        editorialNote:
          'Examine the soaring battlements and vaulted travelers’ chambers of this 17th-century Grand Trunk Road fortified caravanserai.',
      },
      {
        destinationSlug: 'aam-khas-bagh-sirhind',
        sequence: 2,
        editorialNote:
          'Visit the imperial rest stop where Jahangir and Shah Jahan stayed, famous for its cold-water channels and subterranean hammams.',
      },
      {
        destinationSlug: 'sheikh-chehli-tomb-kurukshetra',
        sequence: 3,
        editorialNote:
          'Explore Dara Shikoh’s white marble tribute to his Sufi preceptor, perched atop the multi-millennial Harsh Ka Tila archaeological mound.',
      },
      {
        destinationSlug: 'jal-mahal-narnaul',
        sequence: 4,
        editorialNote:
          'Experience provincial Mughal pleasure architecture at Shah Quli Khan’s square water palace centered in the historic Khan Sarovar.',
      },
    ],
  },

  // 3. Sacred Stones & Stepwells of the Shiwalik Foothills
  {
    title: 'Sacred Stones & Stepwells of the Shiwalik Foothills',
    slug: 'sacred-stones-stepwells-shiwaliks',
    shortDescription:
      'Ancient stone temple ruins, natural aquifer stepwells, and medieval brick gateways nestled along the lower Himalayan margins.',
    description:
      'The undulating transition zone where the Indo-Gangetic plain meets the outer Shiwalik foothills has served as a cultural meeting ground for millennia. This trail brings together three distinct expressions of medieval foothill heritage in Panchkula and Yamunanagar: the sculptural temple ruins of Bhima Devi (often termed the Khajuraho of North India), the subterranean limestone chambers of Bassi Baoli tapping mountain aquifers, and the 16th-century Buria compound featuring lakhori brick arches from the Mughal-Suri transition.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    region: 'Shiwalik Belt (Panchkula & Yamunanagar)',
    theme: 'Ancient Temples & Subterranean Water Systems',
    editorialStatus: 'published',
    waypoints: [
      {
        destinationSlug: 'bhima-devi-temple-pinjore',
        sequence: 1,
        editorialNote:
          'Explore 8th–12th century Gurjara-Pratihara stone friezes and medieval temple foundations in Pinjore.',
      },
      {
        destinationSlug: 'bassi-baoli-pinjore',
        sequence: 2,
        editorialNote:
          'Descend into the cool subterranean limestone flights of Bassi Baoli, continuously fed by natural foothill springs.',
      },
      {
        destinationSlug: 'buria-rang-mahal-yamunanagar',
        sequence: 3,
        editorialNote:
          'Inspect surviving lakhori brick gateways and pavilions associated with 16th-century Mughal frontier governors in ancient Buria.',
      },
    ],
  },

  // 4. Relics of British Colonial Frontier Administration
  {
    title: 'Relics of British Colonial Frontier Administration',
    slug: 'relics-british-colonial-frontier',
    shortDescription:
      'Victorian timber-floating river bridges, secluded sal-forest dak bungalows, and high-altitude cantonment punishment cells.',
    description:
      'Following the consolidation of British authority in northern India during the 19th century, the foothills and lower Himalayas witnessed the establishment of specialized military and administrative outposts. This thematic collection visits three preserved colonial sites: the late-Victorian red iron suspension bridge engineered to control Yamuna timber booms, the 1890s forest inspection bungalow overlooking Kalesar’s sal forests, and the grim 1847 Dagshai Heritage Jail with its subterranean solitary catacombs.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    region: 'Foothills & Lower Himachal',
    theme: 'Colonial Infrastructure & Administrative Heritage',
    editorialStatus: 'published',
    waypoints: [
      {
        destinationSlug: 'kalesar-iron-suspension-bridge',
        sequence: 1,
        editorialNote:
          'Walk to the Yamuna riverbed to view the late-19th-century riveted iron lattice bridge built to monitor timber floating logs.',
      },
      {
        destinationSlug: 'kalesar-forest-dak-bungalow',
        sequence: 2,
        editorialNote:
          'Experience late-Victorian forestry lodge design with deep verandas and deodar fireplaces in the sal canopy.',
      },
      {
        destinationSlug: 'dagshai-heritage-jail-catacombs',
        sequence: 3,
        editorialNote:
          'Explore the austere stone corridors and windowless solitary cells of the 1849 British military penitentiary at 6,000 feet.',
      },
    ],
  },

  // 5. High Himalayan Strongholds & Sacred Monoliths
  {
    title: 'High Himalayan Strongholds & Sacred Monoliths',
    slug: 'high-himalayan-strongholds-monoliths',
    shortDescription:
      'Rock-cut monolithic shrines, ancient timber tower-fortresses, and cliff meditation caves across Himachal Pradesh.',
    description:
      'The secluded valleys of Himachal Pradesh harbor indigenous architectural traditions engineered to survive intense seismic activity and high-altitude winter isolation. This collection presents four of the most extraordinary heritage landmarks of the Western Himalaya: the 8th-century monolithic rock-cut shrines of Masrur, the preserved cobblestone heritage enclave of Pragpur, the 1700 CE eight-storey timber-laced tower fortress of Gondhla, and the ancient siltstone meditation caves carved high above the Spiti River at Tabo.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    region: 'Himachal Pradesh',
    theme: 'Himalayan Monoliths, Vernacular Timber & Monastic Caves',
    editorialStatus: 'published',
    waypoints: [
      {
        destinationSlug: 'masrur-rock-cut-temples-kangra',
        sequence: 1,
        editorialNote:
          'Stand before monolithic rock-hewn shikharas facing the snow-capped Dhauladhar range.',
      },
      {
        destinationSlug: 'pragpur-heritage-village-kangra',
        sequence: 2,
        editorialNote:
          'Walk through the cobblestone lanes of India’s first certified heritage village with preserved timber havelis.',
      },
      {
        destinationSlug: 'gondhla-tower-fort-lahaul',
        sequence: 3,
        editorialNote:
          'Observe earthquake-resilient Kath-Kuni dry-stone and timber engineering at this eight-storey feudal tower-castle.',
      },
      {
        destinationSlug: 'tabo-monastic-meditation-caves-spiti',
        sequence: 4,
        editorialNote:
          'Conclude high above the Spiti valley at the ancient troglodytic prayer cells used by Buddhist monks since the 10th century.',
      },
    ],
  },
];
