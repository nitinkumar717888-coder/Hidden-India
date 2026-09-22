import fs from 'fs';

const USER_AGENT = 'HiddenIndiaBot/1.0 (https://hiddenindia.org; bot@hiddenindia.org)';

async function searchCommons(query: string): Promise<any[]> {
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=8&srsearch=${encodeURIComponent(
    query
  )}&format=json`;
  const res = await fetch(endpoint, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.query?.search || []).map((item: any) => ({
    title: item.title,
    snippet: item.snippet,
  }));
}

async function findCandidates() {
  const checks = [
    { name: 'Kangra Fort', query: '"Kangra Fort" Himachal' },
    { name: 'Rakhigarhi', query: 'Rakhigarhi excavation OR Harappan' },
    { name: 'Pinjore Detail', query: 'Pinjore Gardens fountain OR terrace' },
    { name: 'Chand Baori Detail', query: 'Chand Baori steps OR stairs' },
    { name: 'Amber Fort Hero', query: 'Amber Fort Maota Lake Jaipur' },
    { name: 'Red Fort Hero', query: 'Lahore Gate Red Fort Delhi' },
    { name: 'Humayuns Tomb Detail', query: '"Humayun\'s Tomb" detail OR jali' },
    { name: 'Hidimba Detail', query: 'Hidimba Temple carving OR wood' },
  ];

  for (const c of checks) {
    console.log(`\n=== SEARCH: ${c.name} (${c.query}) ===`);
    const results = await searchCommons(c.query);
    results.forEach((r) => console.log('  -', r.title));
  }
}

findCandidates();
