export interface Stockist {
  id: string;
  name: string;
  kind: 'main' | 'distributor';
  town: string;
  addressLines: string[];
  fullAddress: string;
  lat: number;
  lng: number;
  contactName?: string;
  phone?: string;
  email?: string;
  hours?: string[];
}

export const stockists: Stockist[] = [
  {
    id: 'main-randfontein',
    name: 'BLOM Cosmetics — Main Store',
    kind: 'main',
    town: 'Randfontein',
    addressLines: ['34 Horingbek Avenue', 'Helikonpark, Randfontein', 'South Africa'],
    fullAddress: '34 Horingbek Avenue, Helikonpark, Randfontein, South Africa',
    lat: -26.1826,
    lng: 27.7460,
    contactName: 'Avané',
    phone: '+27 79 548 3317',
    email: 'shop@blomcosmetics.com',
    hours: [
      'Monday - Friday: 9:00 AM - 6:00 PM',
      'Saturday: 10:00 AM - 4:00 PM',
      'Sunday: Closed',
      'Visits by appointment only'
    ]
  },
  {
    id: 'beaut-a-holics-reitz',
    name: 'Beaut A Holics',
    kind: 'distributor',
    town: 'Reitz',
    addressLines: ['6 Steenbok Avenue', 'Reitz, 9810'],
    fullAddress: '6 Steenbok Avenue, Reitz, 9810, South Africa',
    lat: -27.8081,
    lng: 28.4247,
    contactName: 'Natasha',
    phone: '+27 82 547 1228'
  },
  {
    id: 'blom-orkney',
    name: 'BLOM Orkney',
    kind: 'distributor',
    town: 'Orkney',
    addressLines: ['9 Addison Street', 'Golf Park, Orkney'],
    fullAddress: '9 Addison Street, Golf Park, Orkney, South Africa',
    lat: -26.9773,
    lng: 26.6688,
    contactName: 'Ypolanda',
    phone: '+27 73 151 8407',
    email: 'blom.orkney.northwest@gmail.com'
  }
];
