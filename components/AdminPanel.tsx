import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { EQUIPMENT_LIST } from '../constants';
import { Check, X, Trash2, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: BookingStatus, adminName?: string) => void;
  onDelete: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, onUpdateStatus, onDelete }) => {
  // State for Approval Modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [adminNameInput, setAdminNameInput] = useState("");

  // State for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);
  const historyBookings = bookings.filter(b => b.status !== BookingStatus.PENDING && b.status !== BookingStatus.DRAFT);

  const getEquipmentName = (id: string) => EQUIPMENT_LIST.find(e => e.id === id)?.name || id;

  // --- Approval Logic ---
  const openApproveModal = (id: string) => {
    setSelectedBookingId(id);
    setAdminNameInput(""); 
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedBookingId && adminNameInput.trim() !== "") {
        onUpdateStatus(selectedBookingId, BookingStatus.APPROVED, adminNameInput.trim());
        setIsApproveModalOpen(false);
        setSelectedBookingId(null);
    } else {
        alert("Sila masukkan nama Admin/Pegawai untuk meneruskan.");
    }
  };

  const closeApproveModal = () => {
    setIsApproveModalOpen(false);
    setSelectedBookingId(null);
  };

  // --- Delete Logic ---
  const openDeleteModal = (id: string) => {
    setBookingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bookingToDelete) {
      onDelete(bookingToDelete);
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBookingToDelete(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Pending Approvals */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors border-t-4 border-yellow-500">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/50">
          <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Permohonan Menunggu Kelulusan</h3>
        </div>
        
        {pendingBookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">Tiada permohonan baru.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pemohon</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tarikh/Masa</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Alatan</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kod Aset</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.studentName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{booking.className}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{booking.date}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{booking.startTime} - {booking.endTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{getEquipmentName(booking.equipmentId)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Qty: {booking.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-1 max-w-xs">
                         {booking.assetCodes.map(code => (
                           <span key={code} className="px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">{code}</span>
                         ))}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => openApproveModal(booking.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mx-2 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                        title="Luluskan"
                      >
                        <Check className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(booking.id, BookingStatus.REJECTED)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mx-2 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Tolak"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(booking.id)}
                        className="text-gray-400 hover:text-red-700 dark:hover:text-red-400 mx-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Padam"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Log */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors border-t-4 border-gray-400">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sejarah Tempahan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarikh</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pemohon</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Alatan</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Diluluskan Oleh</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tindakan</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {historyBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{booking.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{booking.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getEquipmentName(booking.equipmentId)} ({booking.quantity})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 italic">
                    {booking.approvedBy ? booking.approvedBy : (booking.status === BookingStatus.APPROVED ? '-' : '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${booking.status === BookingStatus.APPROVED ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                        onClick={() => openDeleteModal(booking.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Padam Rekod"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                  </td>
                </tr>
              ))}
              {historyBookings.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Tiada sejarah rekod.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeApproveModal}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-yellow-500 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
              Pengesahan Kelulusan
            </h3>
            
            <form onSubmit={handleConfirmApprove}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Pegawai / Admin
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Cth: Cikgu Siti"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={adminNameInput}
                  onChange={(e) => setAdminNameInput(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Sila masukkan nama anda untuk direkodkan dalam sistem.</p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeApproveModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow transition-colors flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Sahkan & Luluskan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-red-500 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center mb-4 text-red-600 dark:text-red-400">
               <AlertTriangle className="w-8 h-8 mr-3" />
               <h3 className="text-xl font-bold">Hapus Rekod?</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Adakah anda pasti mahu memadam rekod tempahan ini secara kekal? Tindakan ini <span className="font-bold text-red-600">tidak boleh dikembalikan</span>.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;