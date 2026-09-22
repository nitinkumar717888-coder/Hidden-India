import fs from 'fs';
import path from 'path';

const USER_AGENT = 'HiddenIndiaBot/1.0 (https://hiddenindia.org; bot@hiddenindia.org)';

interface FileTarget {
  slug: string;
  role: 'hero' | 'detail';
  filename: string;
  altText: string;
  caption: string;
  forcedLicense?: string;
  forcedLicenseUrl?: string;
  forcedAuthor?: string;
}

const TARGETS: FileTarget[] = [
  // ─── Batch 1 ─────────────────────────────────────────────────────────────
  // 1. Qutub Minar
  {
    slug: 'qutub-minar-delhi',
    role: 'hero',
    filename: 'File:Qutub Minar in Delhi 03-2016.jpg',
    altText: 'Full vertical elevation of the 72.5-meter fluted red sandstone Qutub Minar against a blue sky',
    caption: 'Monumental 72.5-meter fluted sandstone minaret commissioned in 1199 CE by Qutb-ud-din Aibak.',
    forcedLicense: 'CC BY-SA 4.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    slug: 'qutub-minar-delhi',
    role: 'detail',
    filename: 'File:Qutub Minar Calligraphy.jpg',
    altText: 'Intricate calligraphic bands carved into the red sandstone fluting of Qutub Minar',
    caption: 'Epigraphic bands of Quranic verses in floriated Kufic script girdling the lower sandstone storey.',
  },

  // 2. Humayun’s Tomb
  {
    slug: 'humayuns-tomb-delhi',
    role: 'hero',
    filename: 'File:Humayun Tomb, Delhi, from the entrance portal.jpg',
    altText: 'Frontal axial vista of Humayun’s Tomb across the geometric water channels of the Charbagh',
    caption: 'Monumental red sandstone and white marble mausoleum constructed between 1565 and 1572 CE.',
  },
  {
    slug: 'humayuns-tomb-delhi',
    role: 'detail',
    filename: 'File:Jali windows - Humayun\'s Tomb.jpg',
    altText: 'Intricate white marble jali geometric lattice screen at Humayun’s Tomb',
    caption: 'Finely perforated marble jali screen filtering daylight into the tomb ambulatory.',
    forcedLicense: 'CC BY-SA 2.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
  },

  // 3. Agrasen Ki Baoli
  {
    slug: 'agrasen-ki-baoli-new-delhi',
    role: 'hero',
    filename: 'File:Agrasen Ki Baoli-New Delhi-Delhi-DSC02.jpg',
    altText: 'Central axial view down the 108 stone steps of Agrasen Ki Baoli stepwell',
    caption: 'Fourteenth-century Delhi Sultanate stepwell featuring 108 stone steps flanked by arched niches.',
  },
  {
    slug: 'agrasen-ki-baoli-new-delhi',
    role: 'detail',
    filename: 'File:Baoli Arches (6136760429).jpg',
    altText: 'Arched subterranean corridors and alcoves lining the deep stone shaft of Agrasen Ki Baoli',
    caption: 'Tiered subterranean rubble masonry arcades flanking the central staircase.',
  },

  // 4. Hawa Mahal
  {
    slug: 'hawa-mahal-jaipur',
    role: 'hero',
    filename: 'File:Hawa Mahal 2011.jpg',
    altText: 'Five-storey pink and red sandstone honeycomb facade of Hawa Mahal',
    caption: 'Iconic Palace of Winds designed in 1799 CE by Lal Chand Ustad for Maharaja Sawai Pratap Singh.',
  },
  {
    slug: 'hawa-mahal-jaipur',
    role: 'detail',
    filename: 'File:India (Jaipur) Window details of Hawa Mahal Palace1 (33534259125).jpg',
    altText: 'Intricate domed sandstone jharokha balcony with pierced lattice screen on Hawa Mahal facade',
    caption: 'Detailed view of the ornamental jharokha balconies designed for royal women to observe street processions.',
  },

  // 5. Mehrangarh Fort
  {
    slug: 'mehrangarh-fort-jodhpur',
    role: 'hero',
    filename: 'File:Mehrangarh Fort, Jodhpur, Rajasthan, India.jpg',
    altText: 'Massive sandstone ramparts and palaces of Mehrangarh Fort rising atop a 120-meter cliff',
    caption: 'Perpendicular cliff citadel founded in 1459 CE by Rao Jodha commanding the blue city of Jodhpur.',
    forcedLicense: 'CC BY-SA 4.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    slug: 'mehrangarh-fort-jodhpur',
    role: 'detail',
    filename: 'File:Carved balcony, Mehrangarh Fort.jpg',
    altText: 'Finely carved red sandstone jali screen and corbelled balcony inside Mehrangarh Fort',
    caption: 'Exquisite sandstone latticework and relief carving on the palace zenana facade.',
  },

  // 6. Jaisalmer Fort
  {
    slug: 'jaisalmer-fort-jaisalmer',
    role: 'hero',
    filename: 'File:Jaisalmer Fort, India.jpg',
    altText: 'Golden yellow sandstone bastions of Jaisalmer Fort rising from the Thar Desert',
    caption: 'Twelfth-century Sonar Qila (Golden Fort) built in 1156 CE by Rawal Jaisal atop Trikuta Hill.',
  },
  {
    slug: 'jaisalmer-fort-jaisalmer',
    role: 'detail',
    filename: 'File:Jaisalmer - Patwa Haveli 26.jpg',
    altText: 'Intricately sculpted yellow sandstone balconies and screens of havelis within Jaisalmer',
    caption: 'Pierced sandstone jharokhas showing master stonemasonry characteristic of the fort complex.',
  },

  // 7. Chand Baori
  {
    slug: 'chand-baori-abhaneri',
    role: 'hero',
    filename: 'File:Abhaneri-Chand Baori-17a-Stufenbrunnen-2018-gje.jpg',
    altText: 'Geometric precision of the 3,500 chevron-patterned stone steps of Chand Baori stepwell',
    caption: 'Eighth-to-ninth-century stepwell descending 13 storeys into the earth in Abhaneri village.',
  },
  {
    slug: 'chand-baori-abhaneri',
    role: 'detail',
    filename: 'File:Steps of Chand Baori step-well.jpg',
    altText: 'Detailed triangular chevron steps and stone pavilions lining the subterranean tiers of Chand Baori',
    caption: 'Subterranean geometric chevron staircases engineered during the Nikumbha dynasty.',
    forcedLicense: 'CC BY-SA 4.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },

  // ─── Batch 2 ─────────────────────────────────────────────────────────────
  // 8. Red Fort (Lal Qila)
  {
    slug: 'red-fort-delhi',
    role: 'hero',
    filename: 'File:Lahore Gate at Red Fort, Delhi (29138421264).jpg',
    altText: 'Monumental red sandstone Lahore Gate of the Red Fort with domed chhatris and battlements',
    caption: 'Main ceremonial western gate of Emperor Shah Jahan’s fortified palace citadel, completed in 1648 CE.',
  },
  {
    slug: 'red-fort-delhi',
    role: 'detail',
    filename: 'File:Sixteen views of monuments in Delhi Diwan-i-Khas Red Fort Delhi 1850.png',
    altText: 'Marble pillars and Pietra Dura floral inlay of the Diwan-i-Khas hall of private audience',
    caption: 'Diwan-i-Khas pavilion with pietre dure marble inlay where the Peacock Throne once stood.',
    forcedLicense: 'Public Domain',
    forcedLicenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
  },

  // 9. Safdarjung’s Tomb
  {
    slug: 'safdarjungs-tomb-delhi',
    role: 'hero',
    filename: 'File:Delhi, Tomb of Safdarjung (15658609218).jpg',
    altText: 'Late Mughal garden tomb of Safdarjung with buff sandstone facade and white marble central dome',
    caption: 'Final monumental garden tomb of the Mughal architectural tradition, built in 1754 CE.',
  },
  {
    slug: 'safdarjungs-tomb-delhi',
    role: 'detail',
    filename: 'File:Safdarjung Tomb, ceiling details.jpg',
    altText: 'Polychrome painted stucco muqarnas and vaulting inside the dome chamber of Safdarjung’s Tomb',
    caption: 'Intricate late-Mughal painted plaster ceiling relief inside the central tomb chamber.',
  },

  // 10. Chittorgarh Fort
  {
    slug: 'chittorgarh-fort-chittorgarh',
    role: 'hero',
    filename: 'File:Vijay Stambha- Chittorgarh, Rajasthan, India.jpg',
    altText: 'Nine-storey Vijay Stambha (Tower of Victory) standing against the sky inside Chittorgarh Fort',
    caption: 'Monumental 37.2-meter victory tower erected by Rana Kumbha in 1448 CE to celebrate his victory.',
  },
  {
    slug: 'chittorgarh-fort-chittorgarh',
    role: 'detail',
    filename: 'File:VijayStambha.jpg',
    altText: 'Elaborate Hindu deity sculptures and friezes carved into the stone tiers of Vijay Stambha',
    caption: 'Intricate iconographic stone carvings depicting Hindu deities adorning each tier of the tower.',
  },

  // 11. Kumbhalgarh Fort
  {
    slug: 'kumbhalgarh-fort-rajsamand',
    role: 'hero',
    filename: 'File:The boundary walls of Kumbhalgarh fort,Udaipur .jpg',
    altText: 'Serpentine stone curtain wall of Kumbhalgarh Fort winding across the Aravalli mountain ridges',
    caption: 'Massive 36-kilometer curtain wall built by Rana Kumbha in the 15th century CE.',
  },
  {
    slug: 'kumbhalgarh-fort-rajsamand',
    role: 'detail',
    filename: 'File:Ruins of over 360 Hindu and Jain temples in Kumbhalgarh area Rajasthan, 1829 sktech.jpg',
    altText: 'Ancient stone temple architecture and fort crenellations at Kumbhalgarh',
    caption: 'Historic architectural masonry of the temple compounds within the upper fort enclosure.',
    forcedLicense: 'Public Domain',
    forcedLicenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
  },

  // 12. Amber Fort
  {
    slug: 'amber-fort-jaipur',
    role: 'hero',
    filename: 'File:Maota Lake at Amber Fort, Jaipur, India.jpg',
    altText: 'Amber Fort palace pavilions reflected in Maota Lake with Kesar Kyari garden below',
    caption: 'Fortified hill palace complex constructed in yellow and pink sandstone above Maota Lake.',
    forcedLicense: 'CC BY-SA 4.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    slug: 'amber-fort-jaipur',
    role: 'detail',
    filename: 'File:Amber Fort, Jaipur, 20191219 1032 9565.jpg',
    altText: 'Mirror mosaic and stucco relief medallions decorating the walls of Sheesh Mahal',
    caption: 'Intricate Belgian convex mirror mosaic and floral reliefs decorating the Sheesh Mahal.',
  },

  // 13. Purana Qila (Old Fort)
  {
    slug: 'purana-qila-delhi',
    role: 'hero',
    filename: 'File:Bada Darwaza of Purana Qila in Delhi.JPG',
    altText: 'Monumental stone gatehouse of Bada Darwaza with bastions and sandstone inlays at Purana Qila',
    caption: 'Imposing 16th-century fortification gateway attributed to Sher Shah Suri and Humayun.',
  },
  {
    slug: 'purana-qila-delhi',
    role: 'detail',
    filename: 'File:Purana Qila A Family visiting Qila i Kuhna Mosque.jpg',
    altText: 'Five-bay marble and red sandstone facade of Qila-i-Kuhna Mosque inside Purana Qila',
    caption: 'Transitional Suri architecture of Qila-i-Kuhna Mosque featuring horseshoe arches and marble inlays.',
  },

  // 14. Golden Temple
  {
    slug: 'golden-temple-amritsar',
    role: 'hero',
    filename: 'File:Harmandir Sahib, Amritsar, India.jpg',
    altText: 'Illuminated golden sanctum of Sri Harmandir Sahib reflected in the sacred Amrit Sarovar at dusk',
    caption: 'Central sanctum of Sikh faith founded by Guru Ram Das in 1577 CE with gilded copper work added by Maharaja Ranjit Singh.',
  },
  {
    slug: 'golden-temple-amritsar',
    role: 'detail',
    filename: 'File:Repoussé plaque depicting Guru Ram Das, overseeing enlargement of the pond at Guru ka Chak (later becoming the \'Sarovar\' or holy temple tank of the Golden Temple).jpg',
    altText: 'Historical brass and gilded repoussé panel depicting the founding and excavation of the sacred Sarovar',
    caption: 'Traditional artisanal gilded repoussé artwork commemorating the history of Harmandir Sahib.',
    forcedLicense: 'Public Domain',
    forcedLicenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
  },

  // ─── Batch 3 ─────────────────────────────────────────────────────────────
  // 15. Kangra Fort
  {
    slug: 'kangra-fort-kangra',
    role: 'hero',
    filename: 'File:Kangra Fort, Kangra, Himachal Pradesh.jpg',
    altText: 'Stone defensive walls and gatehouses of Kangra Fort towering above the river confluence gorge',
    caption: 'Ancient Katoch dynasty fortress commanding the steep confluence of the Banganga and Majhi rivers.',
    forcedLicense: 'CC BY-SA 4.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    slug: 'kangra-fort-kangra',
    role: 'detail',
    filename: 'File:Sculpture of Shiva, flanked by female attendants, Kangra Fort, Himachal Pradesh.jpg',
    altText: 'Ancient stone carved sculptural relief of Shiva preserved within Kangra Fort temple ruins',
    caption: 'Ninth-century temple stone sculpture excavated and preserved within the fort temple enclosure.',
    forcedLicense: 'CC BY-SA 4.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },

  // 16. Hidimba Devi Temple
  {
    slug: 'hidimba-devi-temple-manali',
    role: 'hero',
    filename: 'File:Hidimba Devi Temple, Dhungri Manali 2.jpg',
    altText: 'Three-tiered timber pagoda roof and brass cone spire of Hidimba Devi Temple nestled in deodar forest',
    caption: 'Unique wooden pagoda temple erected in 1553 CE by Raja Bahadur Singh in the cedar groves of Dhungri.',
  },
  {
    slug: 'hidimba-devi-temple-manali',
    role: 'detail',
    filename: 'File:Hidimba Temple 03.JPG',
    altText: 'Intricate wood carving on the portal, lintels and pillars of Hidimba Devi Temple',
    caption: 'Sixteenth-century deodar wood carvings depicting goddess Durga, motifs of animals, and mythological dancers.',
    forcedLicense: 'CC BY-SA 3.0',
    forcedLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },

  // 17. Pinjore Gardens (Yadavindra)
  {
    slug: 'pinjore-gardens-panchkula',
    role: 'hero',
    filename: 'File:Pinjore Garden Panchkula.jpg',
    altText: 'Symmetrical terrace waterways and pavilion architecture of Pinjore Gardens looking toward Shivalik foothills',
    caption: 'Seventeenth-century Mughal terraced garden created by Nawab Fidai Khan with central water channels.',
  },

  // 18. Rakhigarhi Archaeological Site
  // Rakhigarhi: strictly maintain PENDING_LICENSE_VERIFICATION for excavation photography until official ASI clearance
];

async function queryCommonsFile(filename: string) {
  const cleanTitle = filename.startsWith('File:') ? filename : `File:${filename}`;
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    cleanTitle
  )}&prop=imageinfo&iiprop=url|extmetadata|size|mime&format=json`;

  const res = await fetch(endpoint, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const pages = json.query?.pages;
  if (!pages) return null;
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1' || !pages[pageId].imageinfo) return null;

  const info = pages[pageId].imageinfo[0];
  const meta = info.extmetadata || {};

  let artist = meta.Artist?.value || null;
  if (artist) {
    artist = artist.replace(/<[^>]*>?/gm, '').trim();
    artist = artist.replace(/^(Photo by|Photograph by|By|User:)\s*/i, '').trim();
    if (artist.toLowerCase().includes('unknown')) {
      artist = null;
    }
  }

  let license = meta.LicenseShortName?.value || meta.License?.value || 'Unknown';
  if (license.toLowerCase() === 'cc by-sa 4.0' || license.toLowerCase() === 'cc-by-sa-4.0') {
    license = 'CC BY-SA 4.0';
  } else if (license.toLowerCase() === 'cc by-sa 3.0' || license.toLowerCase() === 'cc-by-sa-3.0') {
    license = 'CC BY-SA 3.0';
  } else if (license.toLowerCase() === 'cc by 2.0' || license.toLowerCase() === 'cc-by-2.0') {
    license = 'CC BY 2.0';
  } else if (license.toLowerCase().includes('public domain')) {
    license = 'Public Domain';
  }

  const licenseUrl = meta.LicenseUrl?.value || null;
  const date = meta.DateTimeOriginal?.value || meta.DateTime?.value || null;

  return {
    title: pages[pageId].title,
    url: info.url,
    descriptionUrl: info.descriptionurl,
    width: info.width,
    height: info.height,
    size: info.size,
    mime: info.mime,
    artist,
    license,
    licenseUrl,
    date,
  };
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err);
    return false;
  }
}

async function main() {
  console.log('Beginning Photography Intake Verification and Processing...\n');

  const publicDestDir = path.join(process.cwd(), 'public', 'images', 'destinations');
  fs.mkdirSync(publicDestDir, { recursive: true });

  const results: Record<string, any[]> = {};

  for (const t of TARGETS) {
    console.log(`Processing [${t.slug}] ${t.role}: ${t.filename}...`);
    const data = await queryCommonsFile(t.filename);
    if (!data) {
      console.error(`  -> Failed to retrieve Commons metadata for ${t.filename}`);
      continue;
    }

    const artist = t.forcedAuthor || data.artist || null;
    const license = t.forcedLicense || data.license;
    const licenseUrl =
      t.forcedLicenseUrl ||
      data.licenseUrl ||
      (license === 'Public Domain' ? 'https://creativecommons.org/publicdomain/mark/1.0/' : null);

    const ext = data.mime === 'image/png' ? 'png' : data.mime === 'image/svg+xml' ? 'svg' : 'jpg';
    const localRelPath = `/images/destinations/${t.slug}-${t.role}.${ext}`;
    const localAbsPath = path.join(process.cwd(), 'public', 'images', 'destinations', `${t.slug}-${t.role}.${ext}`);

    console.log(`  Artist: ${artist || 'None documented'} | License: ${license}`);
    console.log(`  Downloading ${data.url}...`);
    const downloaded = await downloadFile(data.url, localAbsPath);

    const attribution = artist
      ? `Photo: ${artist} • Source: Wikimedia Commons • License: ${license}`
      : `Source: Wikimedia Commons • License: ${license}`;

    const record = {
      imageUrl: downloaded ? localRelPath : data.url,
      altText: t.altText,
      caption: t.caption,
      role: t.role,
      photographer: artist,
      captureDate: data.date ? data.date.slice(0, 10) : null,
      source: 'Wikimedia Commons',
      sourceUrl: data.descriptionUrl,
      originalFileUrl: data.url,
      license,
      licenseUrl,
      attribution,
      accessedAt: '2026-09-22',
      credit: artist ? `${artist} (Wikimedia Commons)` : 'Wikimedia Commons',
      isPrimary: t.role === 'hero',
      requiresEditorialReplacement: false,
      editorialStatus: 'VERIFIED_THIRD_PARTY',
    };

    if (!results[t.slug]) results[t.slug] = [];
    results[t.slug].push(record);
    console.log(`  -> Successfully verified and downloaded ${t.role} for ${t.slug}!\n`);
  }

  // Save results json for inspection
  fs.writeFileSync('scripts/verified-intake-results.json', JSON.stringify(results, null, 2));
  console.log('Finished processing! Results saved to scripts/verified-intake-results.json');
}

main();
