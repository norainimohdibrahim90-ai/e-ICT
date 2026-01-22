import React, { useState, useEffect, useMemo } from 'react';
import { CLASS_LIST, LOCATION_LIST, EQUIPMENT_LIST } from '../constants';
import { Booking, BookingStatus, EquipmentConfig } from '../types';
import { Save, Send, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { generateBookingReceipt } from '../services/pdfService';

interface BookingFormProps {
  onSubmit: (booking: Booking) => void;
  onSaveDraft: (booking: Booking) => void;
  existingBookings: Booking[];
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onSaveDraft, existingBookings }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '08:00',
    endTime: '10:00',
    className: '',
    location: '',
    purpose: '',
    equipmentId: '',
    quantity: 1,
    assetCodes: [] as string[]
  });

  const [day, setDay] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentConfig | undefined>(undefined);
  const [lastSubmittedBooking, setLastSubmittedBooking] = useState<Booking | null>(null);

  // Auto-generate Day
  useEffect(() => {
    if (formData.date) {
      const dateObj = new Date(formData.date);
      const dayName = dateObj.toLocaleDateString('ms-MY', { weekday: 'long' });
      setDay(dayName);
    } else {
      setDay('');
    }
  }, [formData.date]);

  // Handle Equipment Change
  useEffect(() => {
    const eq = EQUIPMENT_LIST.find(e => e.id === formData.equipmentId);
    setSelectedEquipment(eq);
    // Reset selection dependent fields
    if (eq) {
      setFormData(prev => ({
        ...prev,
        quantity: 1,
        assetCodes: [] // Reset codes, forcing user to pick available ones
      }));
    }
  }, [formData.equipmentId]);

  // COLLISION DETECTION LOGIC
  const unavailableAssetCodes = useMemo(() => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.equipmentId) {
      return [];
    }

    return existingBookings
      .filter(booking => {
        // 1. Must be the same equipment type
        if (booking.equipmentId !== formData.equipmentId) return false;

        // 2. Must be active (Approved or Pending) - Ignore Returned/Rejected
        if (booking.status === BookingStatus.REJECTED || booking.status === BookingStatus.RETURNED || booking.status === BookingStatus.DRAFT) return false;

        // 3. Date Check
        if (booking.date !== formData.date) return false;

        // 4. Time Overlap Check
        // Overlap formula: (StartA < EndB) and (EndA > StartB)
        // String comparison works for 24h format e.g. "08:00" < "10:00"
        const isOverlap = (formData.startTime < booking.endTime) && (formData.endTime > booking.startTime);
        
        return isOverlap;
      })
      .flatMap(booking => booking.assetCodes); // Extract all busy codes
  }, [existingBookings, formData.date, formData.startTime, formData.endTime, formData.equipmentId]);


  const handleAssetCodeToggle = (code: string) => {
    setFormData(prev => {
      const currentCodes = prev.assetCodes;
      let newCodes;
      if (currentCodes.includes(code)) {
        newCodes = currentCodes.filter(c => c !== code);
      } else {
        // Enforce quantity matches selection count
        newCodes = [...currentCodes, code];
      }

      // Check Limits
      if (selectedEquipment?.limitPerBooking && newCodes.length > selectedEquipment.limitPerBooking) {
        alert(`Had maksimum untuk ${selectedEquipment.name} adalah ${selectedEquipment.limitPerBooking} unit.`);
        return prev;
      }
      
      return { ...prev, assetCodes: newCodes, quantity: newCodes.length };
    });
  };

  const createBookingObject = (status: BookingStatus): Booking => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      studentName: formData.name,
      date: formData.date,
      day: day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      className: formData.className,
      location: formData.location,
      purpose: formData.purpose,
      equipmentId: formData.equipmentId,
      quantity: formData.quantity,
      assetCodes: formData.assetCodes,
      status: status,
      timestamp: Date.now()
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.assetCodes.length === 0) {
      alert("Sila pilih sekurang-kurangnya satu No Kod Aset.");
      return;
    }
    const booking = createBookingObject(BookingStatus.PENDING);
    onSubmit(booking);
    setLastSubmittedBooking(booking);
    alert("Permohonan berjaya dihantar untuk kelulusan!");
  };

  const handleDraft = () => {
    const booking = createBookingObject(BookingStatus.DRAFT);
    onSaveDraft(booking);
    alert("Disimpan sebagai Draf.");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto transition-colors border-t-4 border-yellow-500">
      <h2 className="text-2xl font-bold text-red-900 dark:text-white mb-6 border-b dark:border-gray-700 pb-2">Borang Tempahan ICT</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Pemohon</label>
            <input
              required
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tarikh</label>
              <input
                required
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hari</label>
              <input
                type="text"
                disabled
                className="mt-1 block w-full bg-gray-100 dark:bg-gray-600 rounded-md border-gray-300 dark:border-gray-500 shadow-sm border p-2 text-gray-600 dark:text-gray-300"
                value={day}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Masa Mula</label>
            <input
              required
              type="time"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Masa Tamat</label>
            <input
              required
              type="time"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.endTime}
              onChange={e => setFormData({...formData, endTime: e.target.value})}
            />
          </div>
        </div>

        {/* Row 3: Class & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas / Kumpulan</label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.className}
              onChange={e => setFormData({...formData, className: e.target.value})}
            >
              <option value="">Sila Pilih...</option>
              {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tempat Digunakan</label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            >
               <option value="">Sila Pilih...</option>
              {LOCATION_LIST.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tujuan</label>
          <input
            required
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={formData.purpose}
            onChange={e => setFormData({...formData, purpose: e.target.value})}
            placeholder="Contoh: PdP Matematik Topik 2"
          />
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        {/* Equipment Selection Section - Theme RED/GOLD */}
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-100 dark:border-red-800">
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-4 flex items-center">
            <span className="w-1 h-6 bg-yellow-500 mr-2 rounded"></span>
            Butiran Peralatan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Alatan ICT</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.equipmentId}
                onChange={e => setFormData({...formData, equipmentId: e.target.value})}
              >
                 <option value="">Sila Pilih Alatan...</option>
                {EQUIPMENT_LIST.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} (Stok: {e.totalStock}) {e.limitPerBooking ? `- Had: ${e.limitPerBooking} unit` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
               {/* Read-only quantity */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bilangan Unit Dipilih</label>
              <div className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400 pl-2">
                {formData.quantity}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedEquipment?.limitPerBooking 
                  ? `Maksimum ${selectedEquipment.limitPerBooking} unit dibenarkan.` 
                  : `Tiada limitasi penggunaan (Stok max: ${selectedEquipment?.totalStock || 0}).`}
              </p>
            </div>
          </div>

          {/* Asset Codes Selector */}
          {selectedEquipment && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Pilih No Kod Aset: 
                 <span className="text-xs font-normal text-red-600 ml-2 italic">
                   (Butang kelabu bermaksud aset sedang dipinjam pada tarikh/masa tersebut)
                 </span>
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: selectedEquipment.totalStock }, (_, i) => i + 1).map(num => {
                  const code = `${selectedEquipment.assetCodePrefix}-${num}`;
                  const isSelected = formData.assetCodes.includes(code);
                  const isUnavailable = unavailableAssetCodes.includes(code);

                  return (
                    <button
                      key={code}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => !isUnavailable && handleAssetCodeToggle(code)}
                      className={`
                        text-xs py-2 px-1 rounded border transition-all font-medium relative
                        ${isUnavailable
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                          : isSelected 
                            ? 'bg-red-700 text-yellow-100 border-red-700 shadow-md transform scale-105 z-10' 
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900'}
                      `}
                      title={isUnavailable ? `Aset ${code} sedang digunakan pada waktu ini` : `Pilih aset ${code}`}
                    >
                      {num}
                      {isUnavailable && (
                        <span className="absolute inset-0 flex items-center justify-center">
                           <div className="w-full h-px bg-gray-500 rotate-45 absolute"></div>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Rules & Actions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border-l-4 border-yellow-500 dark:border-yellow-600 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-900 dark:text-yellow-200">Peraturan Peminjaman ICT</h3>
              <div className="mt-2 text-sm text-gray-700 dark:text-yellow-100 font-medium">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Sebarang kerosakan alatan ICT adalah tanggungjawab bersama peminjam.</li>
                  <li>Permohonan dianggap bersetuju dengan peraturan ini.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={handleDraft}
            className="flex-1 inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Save className="mr-2 h-4 w-4" />
            Simpan (Draft)
          </button>
          
          <button
            type="submit"
            className="flex-1 inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-md text-sm font-bold rounded-md text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Send className="mr-2 h-4 w-4 text-yellow-300" />
            Hantar Permohonan
          </button>
        </div>

        {lastSubmittedBooking && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700 text-center">
            <p className="text-green-600 dark:text-green-400 font-medium mb-2 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2"/> Permohonan terakhir berjaya!
            </p>
            <button
              type="button"
              onClick={() => generateBookingReceipt(lastSubmittedBooking)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate PDF Bukti Peminjaman
            </button>
          </div>
        )}

      </form>
    </div>
  );
};

export default BookingForm;