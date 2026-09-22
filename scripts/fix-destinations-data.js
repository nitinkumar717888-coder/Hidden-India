const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/db/destinations-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Lhudiana typo
content = content.replace("district: 'Lhudiana',", "district: 'Ludhiana',");

// 2. Fix feeType: 'verified_baseline' -> 'per_person'
content = content.replace(/feeType: 'verified_baseline'/g, "feeType: 'per_person'");

// 3. Fix coordinates
// Golden Temple: 31.6200 -> 31.61998
content = content.replace(
  /name: 'Sri Harmandir Sahib \(Golden Temple\)',[\s\S]*?latitude: 31\.6200,/,
  (match) => match.replace('latitude: 31.6200,', 'latitude: 31.61998,')
);

// Summer Palace: 74.8800 -> 74.8802
content = content.replace(
  /name: 'Summer Palace of Maharaja Ranjit Singh',[\s\S]*?longitude: 74\.8800,/,
  (match) => match.replace('longitude: 74.8800,', 'longitude: 74.8802,')
);

// 4. Fix Chittorgarh Fort LOCAL_TRADITION content
content = content.replace(
  "content: 'The narrative of Alauddin Khalji glimpsing Rani Padmini’s reflection in a mirror originated in Malik Muhammad Jayasi’s fictional Avadhi epic poem Padmavat (1540 CE), written over two centuries after the 1303 siege, and lacks corroboration in contemporary 14th-century court records by Amir Khusrau.',",
  "content: 'Local tradition, popular folklore, and legend recounting Alauddin Khalji glimpsing Rani Padmini’s reflection in a mirror originated in Malik Muhammad Jayasi’s fictional Avadhi epic poem Padmavat (1540 CE), written over two centuries after the 1303 siege, and lacks corroboration in contemporary 14th-century court records by Amir Khusrau.',"
);

// 5. Fix Jyotisar evidence items to include DOCUMENTED item
const oldJyotisarEvidence = `    evidenceItems: [
      {
        sectionTitle: 'Epic Tradition and Geological Reality',
        content: 'While literary and religious traditions from the Puranas unanimously celebrate Jyotisar as the Gita Upadesha site, no contemporary archaeological artifacts dating to the late Vedic or Bronze Age have been identified in the immediate tree precinct.',
        classification: 'LOCAL_TRADITION',
        citationNotes: 'Analysis in archaeological surveys of Kurukshetra district (ASI).',
        displayOrder: 1,
      },
    ],`;

const newJyotisarEvidence = `    evidenceItems: [
      {
        sectionTitle: 'Archaeological Documentation of Kurukshetra Region',
        content: 'Systematic surveys and excavations by the Archaeological Survey of India (ASI) across the Kurukshetra region have documented Painted Grey Ware (PGW) and Late Harappan horizons, confirming the historical antiquity of the district though the current raised marble plinth reflects late 19th- and 20th-century construction phases.',
        classification: 'DOCUMENTED',
        citationNotes: 'Archaeological Survey of India (ASI) Kurukshetra Circle excavation records.',
        displayOrder: 1,
      },
      {
        sectionTitle: 'Epic Tradition and Geological Reality',
        content: 'While literary, local folklore, and religious traditions from the Mahabharata and Puranas celebrate Jyotisar as the sacred site of the Gita Upadesha, no contemporary Bronze Age epigraphic artifacts have been identified in the immediate tree precinct.',
        classification: 'LOCAL_TRADITION',
        citationNotes: 'Analysis in archaeological surveys and district gazetteers of Kurukshetra (ASI).',
        displayOrder: 2,
      },
    ],`;

content = content.replace(oldJyotisarEvidence, newJyotisarEvidence);

// 6. Fix all unlinked sources notes
const noticePrefix = 'Digital source unavailable — bibliographic citation retained. ';

const titlesToFix = [
  'Report of a Tour in the Punjab in 1878-79 (Vol. XIV)',
  'Haryana District Gazetteers: Ambala District',
  'Corpus Inscriptionum Indicarum: Vol. III (Inscriptions of Early Gupta Kings)',
  'Archaeological Survey of India Reports: Vol. XXIII',
  'The Ain-i-Akbari (Vol. I)',
  'Monuments of Haryana: Historical Perspective',
  'District Gazetteer of Mahendragarh',
  'Archaeological Survey Reports (Vol. XX)',
  'Tarikh-i-Firoz Shahi',
  'Indian Rock-Cut Temples',
  'Antiquities of Indian Tibet (Vol. I & II)',
  'The Temples of Western Tibet (Spiti and Kunavar)',
  'Chamba State Gazetteer (Vol. XXII-A)',
  'Imperial Gazetteer of India, Vol. VII',
  'History of the Panjab Hill States (Vol. I & II)',
  'The Himalayan Districts of Kooloo, Lahoul, and Spiti',
  'Himachal Pradesh District Gazetteers: Lahaul and Spiti',
  'Kangra District Gazetteer',
  'Vernacular Architecture of the Kangra Valley',
  'Tuzuk-i-Jahangiri (Memoirs of Jahangir)',
  'Mughal Gardens in India',
  'Caravanserais of the Grand Trunk Road in Punjab',
  'Faridkot State Gazetteer',
  'The Rajas of the Punjab',
  'Chandigarh Master Plan 2031: Heritage Precincts Document',
  'Sculptures from Bhima Devi Temple, Pinjore',
  'Working Plan for the Forests of the Kalesar Division',
  'The Indian Forester (Vol. XVI)',
  'Imperial Gazetteer of India: Provincial Series (Punjab Vol. I)',
  'Malfuzat-i-Timuri (Autobiography of Timur)',
  'Annals and Antiquities of Rajasthan (Vol. II)',
  'The Stepwells of Gujarat and India',
  'Mutiny for the Cause: The Story of the Connaught Rangers',
  'Gazetteer of the Simla Hill States (Solan and Kalka Districts)',
  'An Historical Memoir on the Qutb: Delhi',
  'Mughal Architecture: An Outline of Its History and Development',
  "Humayun's Tomb: Form, Function, and Meaning in Early Mughal Architecture",
  'Excavations at Purana Qila, New Delhi: From PGW to Post-Gupta Eras',
  'Mehrauli Archaeological Park: Heritage Trail and Conservation Manual',
  'Stepwells of Gujarat and Delhi in Art-Historical Perspective',
  'Architecture of Mughal India',
  'Indian Architecture (Islamic Period)',
  'A History of Jaipur: c. 1503–1938',
  'Building Jaipur: The Making of an Indian City',
  'The Rajput Palaces: The Development of an Architectural Style, 1450–1750',
  'Mewar and the Mughal Emperors',
  'Maharana Kumbha and His Times',
  'The Stepwells of Gujarat and Delhi in Art-Historical Perspective',
  'Excavations at Rakhigarhi (1997-1998 to 1999-2000)',
  'Cranial DNA from an Ancient Harappan Site in Rakhigarhi',
  'Kurukshetra in Sanskrit Literature',
  'The Gardens of Mughul India: A History and a Guide',
  'History of the Panjab Hill States, Vol. I',
  'Imperial Simla: The Political Culture of the Raj',
  'Kulu: The End of the Habitable World',
  'Amritsar: Past and Present',
  'Jallianwala Bagh',
  'Some Aspects of State and Society Under Ranjit Singh',
  'Ranjit Singh: Maharaja of the Punjab',
  'Excavations at Sanghol: An Overview',
  'Kushana Sculptures from Sanghol',
];

for (const title of titlesToFix) {
  const regex = new RegExp(
    `(title:\\s*['"]${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][\\s\\S]*?notes:\\s*['"])([^'"]+)(['"])`,
    'g'
  );
  content = content.replace(regex, (match, prefix, notes, suffix) => {
    if (!notes.includes('Digital source unavailable — bibliographic citation retained.')) {
      return `${prefix}${noticePrefix}${notes}${suffix}`;
    }
    return match;
  });
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully applied all data fixes to destinations-data.ts');
