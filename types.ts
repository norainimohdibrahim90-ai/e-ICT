export enum BookingStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface EquipmentConfig {
  id: string;
  name: string;
  totalStock: number;
  limitPerBooking: number | null; // null means no limit other than totalStock
  assetCodePrefix: string;
}

export interface Booking {
  id: string;
  studentName: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  className: string;
  location: string;
  purpose: string;
  equipmentId: string;
  quantity: number;
  assetCodes: string[]; // e.g., ["L-01", "L-02"]
  status: BookingStatus;
  timestamp: number;
  approvedBy?: string; // Name of the admin who approved
}

export type ViewState = 'DASHBOARD' | 'BOOKING' | 'ADMIN';

// For Charts
export interface ChartData {
  name: string;
  value: number;
}