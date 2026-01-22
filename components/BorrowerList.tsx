import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus } from '../types';
import { EQUIPMENT_LIST } from '../constants';
import { Search, Filter, Calendar, User, BookOpen } from 'lucide-react';

interface BorrowerListProps {
  bookings: Booking[];
}

const BorrowerList: React.FC<BorrowerListProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = 
        b.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.equipmentId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const getEquipmentName = (id: string) => EQUIPMENT_LIST.find(e => e.id === id)?.name || id;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.APPROVED: return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100";
      case BookingStatus.PENDING: return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100";
      case BookingStatus.REJECTED: return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100";
      case BookingStatus.RETURNED: return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100";
      case BookingStatus.DRAFT: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.APPROVED: return "Lulus (Aktif)";
      case BookingStatus.PENDING: return "Menunggu";
      case BookingStatus.REJECTED: return "Ditolak";
      case BookingStatus.RETURNED: return "Dipulangkan";
      case BookingStatus.DRAFT: return "Draf";
      default: return status;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors border-t-4 border-red-600">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
        <h3 className="text-xl font-bold text-red-900 dark:text-red-100 flex items-center">
           <BookOpen className="w-6 h-6 mr-2 text-yellow-600 dark:text-yellow-400" />
           Senarai Peminjam ICT
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          Rekod lengkap sejarah dan status peminjaman peralatan.
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama, kelas, atau jenis alatan..."
              className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="relative w-full sm:w-56">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
             <select 
               className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="ALL">Semua Status</option>
               <option value={BookingStatus.PENDING}>Menunggu Kelulusan</option>
               <option value={BookingStatus.APPROVED}>Sedang Digunakan</option>
               <option value={BookingStatus.RETURNED}>Telah Dipulangkan</option>
               <option value={BookingStatus.REJECTED}>Ditolak</option>
             </select>
         </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarikh / Masa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peminjam</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peralatan</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tujuan & Lokasi</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBookings.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
                   <User className="w-10 h-10 mb-2 text-gray-300" />
                   <p>Tiada rekod dijumpai.</p>
                 </td>
               </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center font-medium text-gray-900 dark:text-white">
                        <Calendar className="w-3 h-3 mr-1.5 text-gray-400"/> {booking.date}
                    </div>
                    <div className="text-xs ml-5">{booking.startTime} - {booking.endTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{booking.studentName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded inline-block mt-1">{booking.className}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-red-800 dark:text-red-300 font-medium">{getEquipmentName(booking.equipmentId)}</div>
                    <div className="text-xs text-gray-500">
                        <span className="font-bold">{booking.quantity} Unit</span>: {booking.assetCodes.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]" title={booking.purpose}>
                       {booking.purpose}
                     </div>
                     <div className="text-xs text-gray-500">{booking.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    {booking.returnedAt && (
                      <div className="text-[10px] text-gray-400 mt-1 italic">
                        Pulang: {booking.returnedAt.split(',')[0]}
                      </div>
                    )}
                    {booking.approvedBy && booking.status === BookingStatus.APPROVED && (
                       <div className="text-[10px] text-gray-400 mt-1">
                        Oleh: {booking.approvedBy}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
       <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
         <span>Menunjukkan {filteredBookings.length} rekod</span>
         {filteredBookings.length > 50 && <span>(Scroll untuk lihat lebih banyak)</span>}
       </div>
    </div>
  );
};

export default BorrowerList;