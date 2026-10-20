// Satu sumber foto layanan. Lebar dipilih per pemakaian (kartu, hero, thumbnail).
const SERVICE_PHOTOS: Record<string, string> = {
  'srv-shoes-deepclean': 'photo-1542291026-7eec264c27ff',
  'srv-shoes-suede': 'photo-1560769629-975ec94e6a86',
  'srv-shoes-leather': 'photo-1595950653106-6c9ebd614d3a',
  'srv-shoes-kids': 'photo-1551107696-a4b0c5a0d9a2',
  'srv-shoes-womens': 'photo-1543163521-1bf539c55dd2',
  'srv-bag-small': 'photo-1548036328-c9fa89d128fa',
  'srv-bag-medium': 'photo-1553062407-98eeb64c6a62',
  'srv-bag-large': 'photo-1553062407-98eeb64c6a62',
  'srv-acc-deepclean': 'photo-1556906781-9a412961d28f',
  fallback: 'photo-1549298916-b41d501d3772',
};

export function serviceImage(id: string, width: number): string {
  const photo = SERVICE_PHOTOS[id] || SERVICE_PHOTOS.fallback;
  return `https://images.unsplash.com/${photo}?w=${width}&auto=format&fit=crop&q=80`;
}
