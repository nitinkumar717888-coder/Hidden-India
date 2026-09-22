import fs from 'fs';
import path from 'path';

const USER_AGENT = 'HiddenIndiaBot/1.0 (https://hiddenindia.org; bot@hiddenindia.org)';

interface CandidateQuery {
  slug: string;
  name: string;
  hero: { fileTitle?: string; search?: string };
  detail: { fileTitle?: string; search?: string };
}

const CANDIDATES: CandidateQuery[] = [
  // Batch 1
  {
    slug: 'qutub-minar-delhi',
    name: 'Qutub Minar',
    hero: { search: 'Qutub Minar Delhi' },
    detail: { search: 'Qutub Minar carving calligraphy' },
  },
  {
    slug: 'humayuns-tomb-delhi',
    name: 'Humayun’s Tomb',
    hero: { search: 'Humayun Tomb Delhi charbagh' },
    detail: { search: 'Jali screen Humayun Tomb' },
  },
  {
    slug: 'agrasen-ki-baoli-new-delhi',
    name: 'Agrasen Ki Baoli',
    hero: { search: 'Agrasen ki Baoli Delhi' },
    detail: { search: 'Agrasen ki Baoli arches' },
  },
  {
    slug: 'hawa-mahal-jaipur',
    name: 'Hawa Mahal',
    hero: { fileTitle: 'File:Hawa Mahal 2011.jpg' },
    detail: { search: 'Hawa Mahal window detail' },
  },
  {
    slug: 'mehrangarh-fort-jodhpur',
    name: 'Mehrangarh Fort',
    hero: { search: 'Mehrangarh Fort Jodhpur Rajasthan' },
    detail: { search: 'Mehrangarh Fort balcony jali' },
  },
  {
    slug: 'jaisalmer-fort-jaisalmer',
    name: 'Jaisalmer Fort',
    hero: { search: 'Jaisalmer Fort golden fort' },
    detail: { search: 'Jaisalmer Fort haveli jharokha' },
  },
  {
    slug: 'chand-baori-abhaneri',
    name: 'Chand Baori',
    hero: { search: 'Stepwell Chand Baori Abhaneri' },
    detail: { search: 'Chand Baori geometric stairs' },
  },

  // Batch 2
  {
    slug: 'red-fort-delhi',
    name: 'Red Fort',
    hero: { search: 'Red Fort Delhi Lahore Gate' },
    detail: { search: 'Diwan-i-Khas Red Fort interior' },
  },
  {
    slug: 'safdarjungs-tomb-delhi',
    name: 'Safdarjung’s Tomb',
    hero: { search: 'Safdarjung Tomb Delhi facade' },
    detail: { search: 'Safdarjung Tomb ceiling dome' },
  },
  {
    slug: 'chittorgarh-fort-chittorgarh',
    name: 'Chittorgarh Fort',
    hero: { search: 'Vijay Stambha Chittorgarh' },
    detail: { search: 'Chittorgarh Fort stone carving' },
  },
  {
    slug: 'kumbhalgarh-fort-rajsamand',
    name: 'Kumbhalgarh Fort',
    hero: { search: 'Kumbhalgarh Fort wall view' },
    detail: { search: 'Kumbhalgarh Fort ramparts' },
  },
  {
    slug: 'amber-fort-jaipur',
    name: 'Amber Fort',
    hero: { search: 'Amber Fort Jaipur Maota Lake' },
    detail: { search: 'Sheesh Mahal Amber Fort' },
  },
  {
    slug: 'purana-qila-delhi',
    name: 'Purana Qila',
    hero: { search: 'Bada Darwaza Purana Qila' },
    detail: { search: 'Qila-i-Kuhna Mosque Delhi' },
  },
  {
    slug: 'golden-temple-amritsar',
    name: 'Golden Temple',
    hero: { search: 'Harmandir Sahib Amritsar Golden Temple' },
    detail: { search: 'Harmandir Sahib gold repousse detail' },
  },

  // Batch 3
  {
    slug: 'kangra-fort-kangra',
    name: 'Kangra Fort',
    hero: { search: 'Kangra Fort entrance Himachal' },
    detail: { search: 'Kangra Fort gateway stone arch' },
  },
  {
    slug: 'hidimba-devi-temple-manali',
    name: 'Hidimba Devi Temple',
    hero: { search: 'Hadimba Temple Manali Himachal' },
    detail: { search: 'Hidimba Temple carved wood doorway' },
  },
  {
    slug: 'pinjore-gardens-panchkula',
    name: 'Pinjore Gardens',
    hero: { search: 'Pinjore Gardens Yadavindra terrace' },
    detail: { search: 'Pinjore Gardens Shish Mahal cascade' },
  },
  {
    slug: 'rakhigarhi-archaeological-site-hisar',
    name: 'Rakhigarhi Archaeological Site',
    hero: { search: 'Rakhigarhi excavation mound Harappan' },
    detail: { search: 'Rakhigarhi archaeological remains' },
  },
];

async function queryCommonsFile(filename: string) {
  const cleanTitle = filename.startsWith('File:') ? filename : `File:${filename}`;
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    cleanTitle
  )}&prop=imageinfo&iiprop=url|extmetadata|size|mime&format=json`;

  try {
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
    }

    const license = meta.LicenseShortName?.value || meta.License?.value || 'Unknown';
    const licenseUrl = meta.LicenseUrl?.value || null;
    const date = meta.DateTimeOriginal?.value || meta.DateTime?.value || null;
    const description = meta.ImageDescription?.value
      ? meta.ImageDescription.value.replace(/<[^>]*>?/gm, '').trim()
      : null;

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
      description,
    };
  } catch {
    return null;
  }
}

async function searchCommons(query: string): Promise<string[]> {
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=5&srsearch=${encodeURIComponent(
    query
  )}&format=json`;
  try {
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.query?.search || []).map((item: any) => item.title);
  } catch {
    return [];
  }
}

async function verifyAll() {
  console.log('Verifying candidates across all 18 destinations...\n');

  for (const item of CANDIDATES) {
    console.log(`=== [${item.slug}] ${item.name} ===`);

    // Hero
    let heroFile = item.hero.fileTitle;
    if (!heroFile && item.hero.search) {
      const results = await searchCommons(item.hero.search);
      heroFile = results[0];
    }
    if (heroFile) {
      const data = await queryCommonsFile(heroFile);
      if (data) {
        console.log(`  HERO: ${data.title}`);
        console.log(`    Artist: ${data.artist} | License: ${data.license} | Dimensions: ${data.width}x${data.height}`);
        console.log(`    LicenseUrl: ${data.licenseUrl}`);
      } else {
        console.log(`  HERO: FAILED to load ${heroFile}`);
      }
    } else {
      console.log(`  HERO: No file found for ${item.hero.search}`);
    }

    // Detail
    let detailFile = item.detail.fileTitle;
    if (!detailFile && item.detail.search) {
      const results = await searchCommons(item.detail.search);
      detailFile = results[0];
    }
    if (detailFile) {
      const data = await queryCommonsFile(detailFile);
      if (data) {
        console.log(`  DETAIL: ${data.title}`);
        console.log(`    Artist: ${data.artist} | License: ${data.license} | Dimensions: ${data.width}x${data.height}`);
        console.log(`    LicenseUrl: ${data.licenseUrl}`);
      } else {
        console.log(`  DETAIL: FAILED to load ${detailFile}`);
      }
    } else {
      console.log(`  DETAIL: No file found for ${item.detail.search}`);
    }
    console.log('');
  }
}

verifyAll();
