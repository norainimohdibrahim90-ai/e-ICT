import { Booking } from '../types';
import { EQUIPMENT_LIST } from '../constants';

// Declare jsPDF types globally since we are loading from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

const LOGO_URL = "https://iili.io/fv9OFtt.md.png";

// Helper to fetch image and convert to Base64
const getLogoBase64 = async (): Promise<string | null> => {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to load school logo for PDF:", error);
    return null;
  }
};

export const generateBookingReceipt = async (booking: Booking) => {
  const { jspdf } = window;
  if (!jspdf) {
    alert("PDF Library not loaded yet.");
    return;
  }

  const doc = new jspdf.jsPDF();
  const eqName = EQUIPMENT_LIST.find(e => e.id === booking.equipmentId)?.name || booking.equipmentId;
  
  // Load Logo
  const logoData = await getLogoBase64();
  if (logoData) {
    // Add Logo (x: 15, y: 10, w: 25, h: 25)
    doc.addImage(logoData, 'PNG', 15, 10, 25, 25);
  }

  // Header Text
  doc.setFontSize(18);
  doc.setTextColor(153, 27, 27); // Red-800
  // Center text relative to page width (210mm), slightly offset if logo is present
  doc.text("SMA MAIWP LABUAN", 115, 20, { align: 'center' });
  
  doc.setTextColor(0, 0, 0); // Reset black
  doc.setFontSize(14);
  doc.text("BUKTI TEMPAHAN PERALATAN ICT", 115, 30, { align: 'center' });

  // Reference & Date
  doc.setFontSize(10);
  doc.text(`ID Tempahan: ${booking.id.toUpperCase()}`, 14, 45);
  doc.text(`Tarikh Cetakan: ${new Date().toLocaleDateString('ms-MY')}`, 14, 50);

  // Content Table Data
  const data = [
    ["Nama Peminjam", booking.studentName],
    ["Kelas / Tujuan", `${booking.className} / ${booking.purpose}`],
    ["Tarikh Penggunaan", `${booking.date} (${booking.day})`],
    ["Masa", `${booking.startTime} - ${booking.endTime}`],
    ["Lokasi", booking.location],
    ["Alatan", eqName],
    ["Bilangan", `${booking.quantity} Unit`],
    ["No Kod Aset", booking.assetCodes.join(", ")],
    ["Diluluskan Oleh", booking.approvedBy || "Admin"]
  ];

  (doc as any).autoTable({
    startY: 55,
    head: [['Perkara', 'Butiran']],
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [153, 27, 27] }, // Red header
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
  });

  // Footer / Disclaimer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(200, 0, 0); // Red
  doc.text("PERINGATAN:", 14, finalY);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text("1. Sebarang kerosakan alatan ICT adalah tanggungjawab bersama peminjam.", 14, finalY + 5);
  doc.text("2. Sila pastikan alatan dipulangkan dalam keadaan baik dan bersih.", 14, finalY + 10);
  
  // Status Stamp
  doc.setTextColor(0, 150, 0);
  doc.setFontSize(20);
  doc.text(booking.status, 150, finalY + 15, { angle: -15 });

  doc.save(`Tempahan_ICT_${booking.id}.pdf`);
};

export const generateMonthlyReport = async (bookings: Booking[], monthName: string) => {
  const { jspdf } = window;
  if (!jspdf) return;

  const doc = new jspdf.jsPDF();
  
  // Load Logo
  const logoData = await getLogoBase64();
  if (logoData) {
    doc.addImage(logoData, 'PNG', 15, 10, 20, 20);
  }

  // Title
  doc.setFontSize(16);
  doc.setTextColor(153, 27, 27);
  doc.text(`Laporan Penggunaan ICT - ${monthName}`, 50, 20);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("SMA MAIWP LABUAN", 50, 26);
  doc.setTextColor(0, 0, 0);
  
  // Table columns
  const tableColumn = ["Tarikh", "Nama", "Kelas", "Alatan", "Kuantiti", "Kod Aset", "Status"];
  const tableRows: any[] = [];

  bookings.forEach(booking => {
    const eqName = EQUIPMENT_LIST.find(e => e.id === booking.equipmentId)?.name || "Unknown";
    const bookingData = [
      booking.date,
      booking.studentName,
      booking.className,
      eqName,
      booking.quantity,
      booking.assetCodes.join(", "),
      booking.status
    ];
    tableRows.push(bookingData);
  });

  (doc as any).autoTable({
    startY: 35,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [153, 27, 27] } // Red
  });

  doc.save(`Laporan_ICT_${monthName}.pdf`);
};