const academyUrl = process.env.ACADEMY_SUPABASE_URL;
const academyServiceKey = process.env.ACADEMY_SUPABASE_SERVICE_KEY;

if (!academyUrl || !academyServiceKey) {
  throw new Error('Academy production environment is not configured');
}

const course = {
  slug: 'trendy-ring-nail-art-course',
  title: 'Trendy Ring Nail Art Course',
  cover: 'https://res.cloudinary.com/dnlgohkcc/image/upload/v1785314350/Trendy-Ring-Cover_mdc3dy.jpg',
  summary: 'Master modern ring nail trends, balanced placement, dimensional details, and a polished client-ready finish in four focused lessons.',
  level: 'Beginner',
  tags: ['Nail Art', 'Ring Designs', '3D Art', 'Petal Paste'],
  price_zar: 650,
  duration_text: 'Self-paced',
  tagline: 'Turn simple nails into head-turning masterpieces.',
  description: "Learn Avané Crous's approach to refined ring nail art through four practical, step-by-step video lessons.",
  notes: [
    'Lifetime access to all four course videos.',
    'White and Clear Petal Paste are not included with the course.',
    'Course purchasers receive a permanent, one-use Store offer: one White and one Clear Petal Paste for R399 together.',
    'Certificate of completion is available after the final practical submission.'
  ],
  materials: [
    {
      name: 'White Petal Paste',
      image: 'https://res.cloudinary.com/dnlgohkcc/image/upload/v1785314350/IMG-20260728-WA0023_wssnnp.jpg',
      link: 'https://blom-cosmetics.co.za/products/blom-cosmetics-petal-paste-milky-white'
    },
    {
      name: 'Clear Petal Paste',
      image: 'https://res.cloudinary.com/dnlgohkcc/image/upload/v1785314350/IMG-20260728-WA0023_wssnnp.jpg',
      link: 'https://blom-cosmetics.co.za/products/blom-cosmetics-petal-paste-clear'
    }
  ],
  is_active: false
};

const headers = {
  apikey: academyServiceKey,
  Authorization: `Bearer ${academyServiceKey}`,
  'Content-Type': 'application/json'
};

const upsertResponse = await fetch(
  `${academyUrl.replace(/\/$/, '')}/rest/v1/courses?on_conflict=slug`,
  {
    method: 'POST',
    headers: {
      ...headers,
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(course)
  }
);

if (!upsertResponse.ok) {
  const detail = await upsertResponse.text();
  throw new Error(`Academy course migration failed (${upsertResponse.status}): ${detail}`);
}

const verifyResponse = await fetch(
  `${academyUrl.replace(/\/$/, '')}/rest/v1/courses?slug=eq.trendy-ring-nail-art-course&select=id,slug,title,price_zar,is_active`,
  { headers }
);
const rows = verifyResponse.ok ? await verifyResponse.json() : [];
const verified = Array.isArray(rows) && rows.length === 1 &&
  rows[0].slug === course.slug &&
  Number(rows[0].price_zar) === 650 &&
  rows[0].is_active === false;

if (!verified) {
  throw new Error('Academy course verification failed after upsert');
}

console.log(`Academy course staged successfully (${rows[0].id})`);
