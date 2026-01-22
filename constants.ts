import { EquipmentConfig } from './types';

export const CLASS_LIST = [
  "1 Al-Biruni", "1 Al-Farabi", "1 Al-Ghazali",
  "2 Al-Biruni", "2 Al-Farabi",
  "3 Al-Biruni", "3 Al-Farabi",
  "4 Ibnu Sina", "4 Ibnu Khaldun",
  "5 Ibnu Sina", "5 Ibnu Khaldun",
  "Pertandingan", "Pameran", "Kursus"
];

export const LOCATION_LIST = [
  "Kelas", "Perpustakaan", "Bengkel RBT", "Makmal Sains",
  "Makmal Komputer", "Future Classroom", "Bilik Mesyuarat",
  "Tempat Pertandingan", "Tempat Kursus/ Pameran"
];

export const EQUIPMENT_LIST: EquipmentConfig[] = [
  {
    id: "laptop",
    name: "Laptop",
    totalStock: 21,
    limitPerBooking: null,
    assetCodePrefix: "LPT",
    // Image: Laptop workspace
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "chromebook",
    name: "Chromebook",
    totalStock: 15,
    limitPerBooking: 5,
    assetCodePrefix: "CHR",
    // Image: Modern laptop/chromebook usage
    imageUrl: "https://awsimages.detik.net.id/community/media/visual/2021/04/13/logo-chromebook_169.jpeg?w=700&q=90"
  },
  {
    id: "tablet",
    name: "Samsung Tablet",
    totalStock: 5,
    limitPerBooking: null,
    assetCodePrefix: "TAB",
    // Image: Tablet/iPad
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "projector_maiwp",
    name: "Projektor MAIWP",
    totalStock: 2,
    limitPerBooking: null,
    assetCodePrefix: "PRJ-M",
    // Image: Conference room / Projection
    imageUrl: "https://i0.wp.com/bm.soyacincau.com/wp-content/uploads/2022/06/220630-acer-predator-projector-04.jpg?w=1200&ssl=1"
  },
  {
    id: "projector_kpm",
    name: "Projektor KPM",
    totalStock: 2,
    limitPerBooking: null,
    assetCodePrefix: "PRJ-K",
    // Image: Classroom/Office Setup
    imageUrl: "https://i0.wp.com/bm.soyacincau.com/wp-content/uploads/2022/06/220630-acer-predator-projector-04.jpg?w=1200&ssl=1"
  },
  {
    id: "drone",
    name: "Drone",
    totalStock: 1,
    limitPerBooking: null,
    assetCodePrefix: "DRN",
    // Image: Drone flying
    imageUrl: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80"
  }
];

export const MOCK_INITIAL_BOOKINGS = [
  // Populated dynamically in App or used as seed data if needed
];