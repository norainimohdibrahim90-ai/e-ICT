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
    assetCodePrefix: "LPT"
  },
  {
    id: "chromebook",
    name: "Chromebook",
    totalStock: 15,
    limitPerBooking: 5,
    assetCodePrefix: "CHR"
  },
  {
    id: "tablet",
    name: "Samsung Tablet",
    totalStock: 5,
    limitPerBooking: null,
    assetCodePrefix: "TAB"
  },
  {
    id: "projector_maiwp",
    name: "Projektor MAIWP",
    totalStock: 2,
    limitPerBooking: null,
    assetCodePrefix: "PRJ-M"
  },
  {
    id: "projector_kpm",
    name: "Projektor KPM",
    totalStock: 2,
    limitPerBooking: null,
    assetCodePrefix: "PRJ-K"
  },
  {
    id: "drone",
    name: "Drone",
    totalStock: 1,
    limitPerBooking: null,
    assetCodePrefix: "DRN"
  }
];

export const MOCK_INITIAL_BOOKINGS = [
  // Populated dynamically in App or used as seed data if needed
];