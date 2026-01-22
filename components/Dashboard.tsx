import React from 'react';
import { Booking, BookingStatus } from '../types';
import { EQUIPMENT_LIST } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateMonthlyReport } from '../services/pdfService';
import { Download } from 'lucide-react';

interface DashboardProps {
  bookings: Booking[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, isDarkMode }) => {
  // 1. Stats Cards Data
  const activeBookings = bookings.filter(b => b.status === BookingStatus.APPROVED || b.status === BookingStatus.PENDING).length;
  const approvedBookings = bookings.filter(b => b.status === BookingStatus.APPROVED).length;
  const popularItem = calculatePopularItem(bookings);

  // 2. Monthly Usage Data for Chart
  const monthlyData = calculateMonthlyData(bookings);

  // 3. Equipment Usage Data for Pie Chart
  const equipmentData = calculateEquipmentUsage(bookings);
  // Red & Gold Theme Colors: Maroon, Gold, Red, Dark Red, Orange, Pale Gold
  const COLORS = ['#7f1d1d', '#eab308', '#ef4444', '#991b1b', '#f97316', '#fde047'];

  // 4. Popular Borrowers
  const topBorrowers = calculateTopBorrowers(bookings);

  // Chart Theme Helpers
  const chartTextColor = isDarkMode ? "#e5e7eb" : "#1f2937"; // gray-200 vs gray-800
  const chartGridColor = isDarkMode ? "#374151" : "#e5e7eb"; // gray-700 vs gray-200
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderColor: isDarkMode ? '#374151' : '#fecaca', // red-100 border
    color: isDarkMode ? '#f3f4f6' : '#7f1d1d' // red-900 text
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-900 dark:text-white transition-colors">Dashboard & Laporan</h2>
        <button
          onClick={() => generateMonthlyReport(bookings, new Date().toLocaleString('ms-MY', { month: 'long', year: 'numeric' }))}
          className="flex items-center px-4 py-2 bg-yellow-500 text-red-900 font-bold rounded-md hover:bg-yellow-400 shadow-sm transition-colors border border-yellow-600"
        >
          <Download className="w-4 h-4 mr-2" />
          Laporan Bulanan PDF
        </button>
      </div>

      {/* Cards - Red & Gold Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-red-600 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Jumlah Tempahan (Aktif)</p>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{activeBookings}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-yellow-500 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tempahan Diluluskan</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{approvedBookings}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-orange-500 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Alatan Paling Popular</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white truncate">{popularItem}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-colors border-t-2 border-red-100 dark:border-red-900">
          <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-white">Trend Bulanan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="name" stroke={chartTextColor} />
                <YAxis allowDecimals={false} stroke={chartTextColor} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="tempahan" fill="#b91c1c" name="Jumlah Tempahan" /> {/* red-700 */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-colors border-t-2 border-yellow-100 dark:border-yellow-900">
          <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-white">Pecahan Alatan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {equipmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Popular Borrowers */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-colors">
           <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-white">Peminjam Paling Popular</h3>
           <ul className="divide-y divide-red-100 dark:divide-gray-700">
             {topBorrowers.map((b, idx) => (
               <li key={idx} className="py-3 flex justify-between">
                 <span className="text-gray-800 dark:text-gray-200 font-medium">{b.name}</span>
                 <span className="bg-yellow-100 dark:bg-yellow-900 text-red-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-semibold">{b.count} kali</span>
               </li>
             ))}
             {topBorrowers.length === 0 && <li className="text-gray-400 dark:text-gray-500 py-2">Tiada data.</li>}
           </ul>
         </div>

         {/* Frequent Items Details */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm transition-colors">
           <h3 className="text-lg font-bold mb-4 text-red-900 dark:text-white">Status Stok Semasa (Anggaran)</h3>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-red-100 dark:divide-gray-700 text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Alatan</th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Jumlah Stok</th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Baki</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50 dark:divide-gray-700">
                  {EQUIPMENT_LIST.map(eq => {
                    // Very simple simulation: Active bookings reduce stock
                    const activeCount = bookings
                      .filter(b => b.equipmentId === eq.id && b.status === BookingStatus.APPROVED)
                      .reduce((acc, curr) => acc + curr.quantity, 0);
                    
                    return (
                      <tr key={eq.id}>
                        <td className="py-2 text-gray-800 dark:text-gray-300 font-medium">{eq.name}</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{eq.totalStock}</td>
                        <td className="py-2 text-right font-bold text-red-600 dark:text-red-400">{Math.max(0, eq.totalStock - activeCount)}</td>
                      </tr>
                    )
                  })}
                </tbody>
             </table>
           </div>
         </div>
      </div>
    </div>
  );
};

// Helper Functions

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