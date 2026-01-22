import { Booking, BookingStatus } from '../types';

// PENTING: Gantikan URL di bawah dengan URL 'Web App' dari Google Apps Script anda
const API_URL = "PASTE_YOUR_WEB_APP_URL_HERE";

export const fetchBookingsFromSheet = async (): Promise<Booking[]> => {
  try {
    if (API_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
      console.warn("Google Sheet API URL not set.");
      return [];
    }
    const response = await fetch(API_URL);
    const data = await response.json();
    
    // Ensure numeric fields are numbers if Sheet returns them as strings
    return data.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      timestamp: Number(item.timestamp),
      assetCodes: Array.isArray(item.assetCodes) ? item.assetCodes : []
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const createBookingInSheet = async (booking: Booking) => {
  return await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "CREATE", ...booking }),
  });
};

export const updateBookingStatusInSheet = async (id: string, status: BookingStatus, approvedBy?: string, returnedAt?: string) => {
  return await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ 
      action: "UPDATE", 
      id, 
      status, 
      approvedBy: approvedBy || "",
      returnedAt: returnedAt || "" 
    }),
  });
};

export const deleteBookingInSheet = async (id: string) => {
  return await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "DELETE", id }),
  });
};