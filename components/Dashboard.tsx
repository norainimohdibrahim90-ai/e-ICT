import React, { useMemo } from 'react';
import { Booking, BookingStatus } from '../types';
import { EQUIPMENT_LIST } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateMonthlyReport } from '../services/pdfService';
import { Download, Monitor, Battery, BatteryCharging, AlertCircle, ImageOff } from 'lucide-react';

interface DashboardProps {
  bookings: Booking[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, isDarkMode }) => {
  // OPTIMIZATION: useMemo prevents recalculating these heavy stats on every render.
  // Only recalculate when 'bookings' array actually changes.

  // 1. Stats Cards Data
  const stats = useMemo(() => {
    return {
      active: bookings.filter(b => b.status === BookingStatus.APPROVED || b.status === BookingStatus.PENDING).length,
      approved: bookings.filter(b => b.status === BookingStatus.APPROVED).length,
      popular: calculatePopularItem(bookings)
    };
  }, [bookings]);

  // 2. Monthly Usage Data for Chart
  const monthlyData = useMemo(() => calculateMonthlyData(bookings), [bookings]);

  // 3. Equipment Usage Data for Pie Chart
  const equipmentData = useMemo(() => calculateEquipmentUsage(bookings), [bookings]);
  
  // 4. Popular Borrowers
  const topBorrowers = useMemo(() => calculateTopBorrowers(bookings), [bookings]);

  // Red & Gold Theme Colors
  const COLORS = ['#7f1d1d', '#eab308', '#ef4444', '#991b1b', '#f97316', '#fde047'];

  // Chart Theme Helpers
  const chartTextColor = isDarkMode ? "#e5e7eb" : "#1f2937";
  const chartGridColor = isDarkMode ? "#374151" : "#e5e7eb";
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderColor: isDarkMode ? '#374151' : '#fecaca',
    color: isDarkMode ? '#f3f4f6' : '#7f1d1d'
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/800x600/7f1d1d/FFF?text=Imej+Tidak+Tersedia";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-yellow-500">
             Dashboard Digital
           </h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">Analisis data masa nyata e-ICT</p>
        </div>
        
        <button
          onClick={() => generateMonthlyReport(bookings, new Date().toLocaleString('ms-MY', { month: 'long', year: 'numeric' }))}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-red-800 to-red-900 text-white font-bold rounded-full hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-red-900/30 transition-all transform hover:-translate-y-0.5 border border-yellow-500/30"
        >
          <Download className="w-4 h-4 mr-2 text-yellow-400" />
          Muat Turun Laporan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-red-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider relative z-10">Permohonan Aktif</p>
          <div className="flex items-end gap-2 mt-2 relative z-10">
             <p className="text-4xl font-black text-gray-800 dark:text-white">{stats.active}</p>
             <span className="text-red-500 font-medium text-sm mb-1 animate-pulse">● Live</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-yellow-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider relative z-10">Jumlah Diluluskan</p>
          <div className="flex items-end gap-2 mt-2 relative z-10">
             <p className="text-4xl font-black text-gray-800 dark:text-white">{stats.approved}</p>
             <span className="text-yellow-600 dark:text-yellow-400 font-medium text-sm mb-1">Total</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
            <Monitor size={120} />
          </div>
          <p className="text-sm text-yellow-200 font-bold uppercase tracking-wider relative z-10">Alatan Paling Popular</p>
          <p className="text-2xl font-black mt-2 truncate relative z-10">{stats.popular}</p>
          <p className="text-xs text-red-200 mt-1 relative z-10">Berdasarkan data terkini</p>
        </div>
      </div>

      {/* Digital Inventory Gallery */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="bg-yellow-500 w-2 h-8 rounded-full mr-3"></span>
          Galeri Status Inventori
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {EQUIPMENT_LIST.map((eq) => {
            // Optimization: Calculate specific item stock
            // This is fast enough to do inside map usually, but could be memoized if list is huge
            const activeCount = bookings
              .filter(b => b.equipmentId === eq.id && b.status === BookingStatus.APPROVED)
              .reduce((acc, curr) => acc + curr.quantity, 0);
            
            const available = Math.max(0, eq.totalStock - activeCount);
            const percentage = (available / eq.totalStock) * 100;
            
            let statusColor = "bg-green-500";
            let statusText = "Tersedia";
            if (percentage === 0) {
              statusColor = "bg-red-600";
              statusText = "Habis";
            } else if (percentage < 30) {
              statusColor = "bg-orange-500";
              statusText = "Terhad";
            }

            return (
              <div key={eq.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden group">
                <div className="h-40 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <img 
                    src={eq.imageUrl} 
                    alt={eq.name}
                    loading="lazy" // Optimization: Lazy load images
                    decoding="async" // Optimization: Decode async
                    onError={handleImageError} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full font-bold border border-white/20 z-10">
                    {eq.assetCodePrefix}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-yellow-400 transition-colors">{eq.name}</h4>
                       <span className={`text-xs px-2 py-1 rounded text-white font-bold ${statusColor}`}>
                         {statusText}
                       </span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span>Stok Semasa:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {available} / {eq.totalStock}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${statusColor} transition-all duration-1000 ease-out`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
                     <span className="flex items-center">
                        {percentage > 50 ? <BatteryCharging className="w-3 h-3 mr-1"/> : <AlertCircle className="w-3 h-3 mr-1"/>}
                        {percentage.toFixed(0)}% Kapasiti
                     </span>
                     <span>Had: {eq.limitPerBooking ? `${eq.limitPerBooking} Unit` : 'Tiada'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center">
            <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            </span>
            Trend Tempahan Bulanan
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="name" stroke={chartTextColor} axisLine={false} tickLine={false} dy={10} />
                <YAxis allowDecimals={false} stroke={chartTextColor} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{...tooltipStyle, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                  cursor={{fill: isDarkMode ? '#374151' : '#f3f4f6'}}
                />
                <Bar dataKey="tempahan" fill="#b91c1c" radius={[6, 6, 0, 0]} name="Jumlah Tempahan" /> 
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center">
             <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200 p-2 rounded-lg mr-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
             </span>
            Pecahan Penggunaan Alatan
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {equipmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{...tooltipStyle, borderRadius: '8px'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Borrowers Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
         <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">🏆 Peminjam Paling Aktif</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
           {topBorrowers.map((b, idx) => (
             <div key={idx} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-center border border-gray-100 dark:border-gray-600">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 text-white flex items-center justify-center font-bold text-lg mb-2 shadow-md">
                 {idx + 1}
               </div>
               <span className="text-gray-800 dark:text-gray-200 font-bold text-sm line-clamp-1">{b.name}</span>
               <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{b.count} Tempahan</span>
             </div>
           ))}
           {topBorrowers.length === 0 && <div className="text-gray-400 dark:text-gray-500 py-2 col-span-full text-center">Tiada data peminjam.</div>}
         </div>
      </div>
    </div>
  );
};

// Functions outside component to ensure they are stable references
function calculateMonthlyData(bookings: Booking[]) {
  const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
  const data = months.map(m => ({ name: m, tempahan: 0 }));
  
  bookings.forEach(b => {
    const d = new Date(b.date);
    if (!isNaN(d.getTime())) {
      data[d.getMonth()].tempahan += 1;
    }
  });
  return data;
}

function calculateEquipmentUsage(bookings: Booking[]) {
  const map: Record<string, number> = {};
  bookings.forEach(b => {
    const name = EQUIPMENT_LIST.find(e => e.id === b.equipmentId)?.name || b.equipmentId;
    map[name] = (map[name] || 0) + 1;
  });
  return Object.keys(map).map(k => ({ name: k, value: map[k] }));
}

function calculatePopularItem(bookings: Booking[]) {
  const usage = calculateEquipmentUsage(bookings);
  if (usage.length === 0) return "Tiada Data";
  usage.sort((a, b) => b.value - a.value);
  return usage[0].name;
}

function calculateTopBorrowers(bookings: Booking[]) {
  const map: Record<string, number> = {};
  bookings.forEach(b => {
    map[b.studentName] = (map[b.studentName] || 0) + 1;
  });
  
  return Object.keys(map)
    .map(k => ({ name: k, count: map[k] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5
}

export default Dashboard;