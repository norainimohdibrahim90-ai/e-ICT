export enum BookingStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED'
}

export interface EquipmentConfig {
  id: string;
  name: string;
  totalStock: number;
  limitPerBooking: number | null; // null means no limit other than totalStock
  assetCodePrefix: string;
  imageUrl: string; // New field for dashboard visualization
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
  returnedAt?: string; // Formatted timestamp of when the item was returned
}

export type ViewState = 'DASHBOARD' | 'BOOKING' | 'ADMIN' | 'LIST';

// For Charts
export interface ChartData {
  name: string;
  value: number;
}