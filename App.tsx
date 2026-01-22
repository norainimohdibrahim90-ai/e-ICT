import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, ShieldCheck, Sun, Moon, Home, X, Menu, Loader2, Users } from 'lucide-react';
import BookingForm from './components/BookingForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import BorrowerList from './components/BorrowerList';
import { Booking, BookingStatus, ViewState } from './types';
import { 
  fetchBookingsFromSheet, 
  createBookingInSheet, 
  updateBookingStatusInSheet, 
  deleteBookingInSheet 
} from './services/googleSheetService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Data from Google Sheet on Mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchBookingsFromSheet();
      // Sort by date descending (newest first)
      const sortedData = data.sort((a, b) => b.timestamp - a.timestamp);
      setBookings(sortedData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleBookingSubmit = async (newBooking: Booking) => {
    // Optimistic UI Update (Instant feedback)
    setBookings(prev => [newBooking, ...prev]);
    
    // Background Sync
    try {
      await createBookingInSheet(newBooking);
    } catch (error) {
      console.error("Failed to save to Google Sheet", error);
      alert("Amaran: Gagal menyimpan ke database. Sila semak sambungan internet.");
    }
  };

  const handleBookingStatusUpdate = async (id: string, status: BookingStatus, adminName?: string) => {
    // Logic: If status is RETURNED, capture current time
    let returnedAtStr: string | undefined = undefined;
    if (status === BookingStatus.RETURNED) {
       const now = new Date();
       // Format: "12:30 PM, 15/01/2026"
       returnedAtStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + now.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric'});
    }

    // Optimistic Update
    setBookings(prev => prev.map(b => 
      b.id === id 
        ? { 
            ...b, 
            status, 
            approvedBy: adminName !== undefined ? adminName : b.approvedBy,
            returnedAt: returnedAtStr || b.returnedAt 
          } 
        : b
    ));

    // Background Sync
    try {
      await updateBookingStatusInSheet(id, status, adminName, returnedAtStr);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    // Optimistic Update
    setBookings(prev => prev.filter(b => b.id !== id));

    // Background Sync
    try {
      await deleteBookingInSheet(id);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleMenuClick = (view: ViewState) => {
    setCurrentView(view);
    if (window.innerWidth < 768) {
      setIsMenuExpanded(false);
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row-reverse font-sans transition-colors duration-200 relative overflow-x-hidden">
        
        {/* RIGHT SIDEBAR NAVIGATION - THEME RED & GOLD */}
        <aside 
          className={`
            bg-red-900 text-white 
            flex-shrink-0 flex flex-col transition-all duration-500 ease-in-out shadow-2xl z-50
            ${isMenuExpanded ? 'md:w-80 w-full fixed md:relative h-full right-0 top-0 bottom-0' : 'md:w-20 w-0 fixed md:relative h-full right-0 top-0 bottom-0 overflow-hidden'} 
          `}
        >
           {/* Desktop Collapsed Toggle */}
           {!isMenuExpanded && (
             <div className="hidden md:flex h-full flex-col items-center pt-6 space-y-4 w-full cursor-pointer hover:bg-red-800/50 transition-colors" onClick={() => setIsMenuExpanded(true)}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMenuExpanded(true); }}
                  className="p-3 bg-red-800 rounded-xl hover:bg-red-700 transition-colors shadow-lg group border border-yellow-600/30"
                  title="Buka Menu"
                >
                  <Home className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                </button>
                <div className="flex-1" />
                <button
                 onClick={(e) => { e.stopPropagation(); setIsDarkMode(!isDarkMode); }}
                 className="p-3 text-yellow-200 hover:text-white mb-6"
                 title="Tukar Tema"
                >
                  {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                </button>
             </div>
           )}

           {/* Expanded Content */}
           <div className={`flex flex-col h-full w-full ${!isMenuExpanded ? 'hidden' : 'block'}`}>
              
              {/* Header Bar: Title + Close Button */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-red-800 bg-red-950">
                <span className="font-bold text-sm tracking-wide text-yellow-500">e-ICT SMA MAIWP</span>
                <button 
                  onClick={() => setIsMenuExpanded(false)}
                  className="text-yellow-200 hover:text-white transition-colors p-2 rounded-full hover:bg-red-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Hero Text & Logo */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="p-2 bg-white/10 rounded-full border-2 border-yellow-500 shadow-lg">
                    <img 
                      src="https://iili.io/fv9OFtt.md.png" 
                      alt="Logo Sekolah" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold leading-tight mb-1 text-white">
                  e-ICT SMA MAIWP<br/><span className="text-yellow-400">LABUAN</span>
                </h1>
                <p className="text-sm text-red-200">Sistem Pengurusan ICT</p>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 space-y-3 overflow-y-auto">
                
                <button
                  onClick={() => handleMenuClick('DASHBOARD')}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                    ${currentView === 'DASHBOARD' 
                      ? 'text-white bg-red-800 border-l-4 border-yellow-400' 
                      : 'text-red-100 hover:text-yellow-200 hover:bg-red-800/30'}
                  `}
                >
                  <LayoutDashboard className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${currentView === 'DASHBOARD' ? 'text-yellow-400' : ''}`} />
                  <span className="font-medium">Dashboard</span>
                </button>

                {/* Main Call to Action Button - GOLD Theme */}
                <button
                  onClick={() => handleMenuClick('BOOKING')}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg shadow-lg transform transition-all duration-200 group
                    ${currentView === 'BOOKING'
                      ? 'bg-yellow-500 text-red-900 hover:bg-yellow-400 scale-[1.02] font-bold' 
                      : 'bg-yellow-500 text-red-900 hover:bg-yellow-400 hover:scale-[1.02] font-bold'}
                  `}
                >
                  <PlusCircle className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Tempahan Baru</span>
                </button>

                {/* New SENARAI PEMINJAM Button */}
                <button
                  onClick={() => handleMenuClick('LIST')}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                    ${currentView === 'LIST' 
                      ? 'text-white bg-red-800 border-l-4 border-yellow-400' 
                      : 'text-red-100 hover:text-yellow-200 hover:bg-red-800/30'}
                  `}
                >
                  <Users className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${currentView === 'LIST' ? 'text-yellow-400' : ''}`} />
                  <span className="font-medium">Senarai Peminjam</span>
                </button>

                <button
                  onClick={() => handleMenuClick('ADMIN')}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                    ${currentView === 'ADMIN' 
                      ? 'text-white bg-red-800 border-l-4 border-yellow-400' 
                      : 'text-red-100 hover:text-yellow-200 hover:bg-red-800/30'}
                  `}
                >
                  <ShieldCheck className={`w-5 h-5 mr-3 group-hover:scale-110 transition-transform ${currentView === 'ADMIN' ? 'text-yellow-400' : ''}`} />
                  <span className="font-medium">Admin Panel</span>
                </button>

              </nav>

              {/* Footer */}
              <div className="p-6 mt-auto bg-red-950 border-t border-red-900">
                 <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center text-sm text-yellow-200 hover:text-white mb-4 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {isDarkMode ? 'Mod Cerah' : 'Mod Gelap'}
                </button>
                <div className="bg-red-900/50 rounded p-2 text-center border border-red-800">
                   <p className="text-xs text-red-200 font-medium">
                    &copy; 2026 Unit ICT SMA MAIWP Labuan
                  </p>
                </div>
              </div>

           </div>
        </aside>

        {/* Floating Toggle Button for Mobile */}
        {!isMenuExpanded && (
          <button 
            onClick={() => setIsMenuExpanded(true)}
            className="md:hidden fixed bottom-6 right-6 bg-red-900 text-yellow-400 p-4 rounded-full shadow-2xl z-[60] animate-bounce hover:bg-red-800 active:scale-95 transition-all border-2 border-yellow-500"
            aria-label="Buka Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Overlay for Mobile */}
        {isMenuExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMenuExpanded(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto h-screen relative bg-orange-50/50 dark:bg-gray-900 scroll-smooth w-full">
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full pb-24 md:pb-8">
            
            {/* Context Header */}
            <div className="mb-6 flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="bg-red-900 p-2 rounded text-yellow-400 shadow border border-yellow-600">
                   <LayoutDashboard className="w-6 h-6"/>
                 </div>
                 
                 {/* SCHOOL LOGO ADDED HERE */}
                 <div className="p-1 bg-white rounded-full border border-yellow-500 shadow-sm">
                   <img 
                     src="https://iili.io/fv9OFtt.md.png" 
                     alt="Logo Sekolah" 
                     className="w-10 h-10 object-contain"
                   />
                 </div>

                 <div>
                   <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {currentView === 'DASHBOARD' && 'Dashboard'}
                    {currentView === 'BOOKING' && 'Borang Tempahan'}
                    {currentView === 'LIST' && 'Senarai Peminjam'}
                    {currentView === 'ADMIN' && 'Panel Admin'}
                   </h2>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Selamat Datang ke e-ICT SMA MAIWP Labuan</p>
                 </div>
               </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-red-800 animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Sedang memuat data dari Database...</p>
              </div>
            )}

            {!isLoading && (
              <>
                {currentView === 'DASHBOARD' && (
                  <div className="animate-slideLeft">
                    <Dashboard bookings={bookings} isDarkMode={isDarkMode} />
                  </div>
                )}

                {currentView === 'BOOKING' && (
                  <div className="animate-slideLeft">
                    <BookingForm 
                      onSubmit={handleBookingSubmit}
                      onSaveDraft={handleBookingSubmit}
                      existingBookings={bookings}
                    />
                  </div>
                )}

                {currentView === 'LIST' && (
                  <div className="animate-slideLeft">
                    <BorrowerList bookings={bookings} />
                  </div>
                )}

                {currentView === 'ADMIN' && (
                  <div className="animate-slideLeft">
                    <AdminPanel 
                      bookings={bookings} 
                      onUpdateStatus={handleBookingStatusUpdate} 
                      onDelete={handleDeleteBooking}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      <style>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #fca5a5; /* red-300 */
          border-radius: 4px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background-color: #7f1d1d; /* red-900 */
        }
      `}</style>
    </div>
  );
};

export default App;