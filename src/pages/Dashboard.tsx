import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { CameraScanner } from '@/components/CameraScanner';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Clock, 
  CalendarDays, 
  CheckCircle2, 
  History,
  Scan,
  User,
  MapPin,
  Navigation,
  ArrowRight,
  ArrowLeft,
  XCircle
} from 'lucide-react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  distance: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';
  locationIn?: GeolocationData;
  locationOut?: GeolocationData;
}

// Mock data - akan diganti dengan data dari Supabase
const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { 
    id: '1', 
    date: '2024-01-15', 
    checkIn: '06:45', 
    checkOut: '14:30', 
    status: 'hadir',
    locationIn: { latitude: -6.3345346, longitude: 107.1488326, accuracy: 20, distance: 45 },
    locationOut: { latitude: -6.3345346, longitude: 107.1488326, accuracy: 25, distance: 50 }
  },
  { 
    id: '2', 
    date: '2024-01-14', 
    checkIn: '07:15', 
    checkOut: '14:30', 
    status: 'terlambat',
    locationIn: { latitude: -6.3345346, longitude: 107.1488326, accuracy: 30, distance: 60 }
  },
  { 
    id: '3', 
    date: '2024-01-13', 
    checkIn: '06:50', 
    checkOut: '14:00', 
    status: 'hadir' 
  },
  { 
    id: '4', 
    date: '2024-01-12', 
    status: 'izin' 
  },
  { 
    id: '5', 
    date: '2024-01-11', 
    checkIn: '06:55', 
    checkOut: '14:30', 
    status: 'hadir' 
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanType, setScanType] = useState<'in' | 'out'>('in');
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [userLocation, setUserLocation] = useState<GeolocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        setIsLoadingLocation(false);
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache 1 menit
          });
        });

        const { latitude, longitude, accuracy } = position.coords;
        
        // Hitung jarak dari sekolah (contoh koordinat)
        const SCHOOL_LAT = -6.3345346;
        const SCHOOL_LON = 107.1488326;
        
        const R = 6371e3;
        const φ1 = latitude * Math.PI / 180;
        const φ2 = SCHOOL_LAT * Math.PI / 180;
        const Δφ = (SCHOOL_LAT - latitude) * Math.PI / 180;
        const Δλ = (SCHOOL_LON - longitude) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = Math.round(R * c);

        setUserLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          distance
        });
      } catch (error) {
        console.error('Location error:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getUserLocation();
    
    // Update lokasi setiap 30 detik
    const locationInterval = setInterval(getUserLocation, 30000);
    
    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const today = new Date().toISOString().split('T')[0];
    const existing = MOCK_ATTENDANCE.find(a => a.date === today);
    if (existing) {
      setTodayAttendance(existing);
    }

    return () => clearInterval(timer);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openScanner = (type: 'in' | 'out') => {
    setScanType(type);
    setIsCameraOpen(true);
  };

  const handleScanSuccess = (time: string, location?: GeolocationData) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (scanType === 'in') {
      const hour = parseInt(time.split(':')[0]);
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        date: today,
        checkIn: time,
        status: hour >= 7 ? 'terlambat' : 'hadir',
        locationIn: location,
      };
      setTodayAttendance(newRecord);
      
      toast({
        title: '✅ Absen Masuk Berhasil!',
        description: (
          <div className="space-y-1">
            <p>Tercatat pada pukul <strong>{time}</strong></p>
            {location && <p className="text-xs">📍 Lokasi: {location.distance}m dari sekolah</p>}
          </div>
        ),
      });
    } else {
      setTodayAttendance(prev => prev ? { 
        ...prev, 
        checkOut: time,
        locationOut: location 
      } : null);
      
      toast({
        title: '✅ Absen Pulang Berhasil!',
        description: (
          <div className="space-y-1">
            <p>Tercatat pada pukul <strong>{time}</strong></p>
            <p>🎉 Sampai jumpa besok! Hati-hati di jalan.</p>
            {location && <p className="text-xs">📍 Lokasi: {location.distance}m dari sekolah</p>}
          </div>
        ),
      });
    }
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    // Cek apakah sudah pulang
    if (record.checkIn && record.checkOut) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          ✓ Lengkap
        </span>
      );
    }
    
    // Belum pulang
    if (record.checkIn && !record.checkOut) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          ⏳ Belum Pulang
        </span>
      );
    }
    
    // Status khusus
    const styles = {
      izin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      sakit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      alpha: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      terlambat: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      hadir: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };

    const labels = {
      izin: '📄 Izin',
      sakit: '🤒 Sakit',
      alpha: '✗ Alpha',
      terlambat: '⏰ Terlambat',
      hadir: '✓ Hadir',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[record.status]}`}>
        {labels[record.status]}
      </span>
    );
  };

  if (!user) return null;

  const isWithinSchoolRadius = userLocation && userLocation.distance <= 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        scanType={scanType}
        onSuccess={handleScanSuccess}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.class}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Halo, {user.name}! 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                NISN: {user.nisn} • {user.class}
              </p>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className={`rounded-2xl shadow-sm p-6 border ${
          isLoadingLocation 
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            : isWithinSchoolRadius
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isLoadingLocation
                ? 'bg-gray-300 dark:bg-gray-700'
                : isWithinSchoolRadius
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}>
              {isLoadingLocation ? (
                <Navigation className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <MapPin className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                isLoadingLocation
                  ? 'text-gray-700 dark:text-gray-300'
                  : isWithinSchoolRadius
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {isLoadingLocation 
                  ? 'Mengecek Lokasi Anda...'
                  : isWithinSchoolRadius
                  ? '✓ Anda Berada di Area Sekolah'
                  : '✗ Anda di Luar Area Sekolah'
                }
              </h3>
              {userLocation && (
                <div className={`text-sm space-y-1 ${
                  isWithinSchoolRadius
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  <p>
                    📍 Jarak dari sekolah: <strong>{userLocation.distance}m</strong>
                  </p>
                  <p className="text-xs opacity-75">
                    Akurasi: ±{userLocation.accuracy}m • 
                    Lat: {userLocation.latitude.toFixed(6)} • 
                    Lon: {userLocation.longitude.toFixed(6)}
                  </p>
                </div>
              )}
              {!isLoadingLocation && !userLocation && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ⚠️ Gagal mendapatkan lokasi. Aktifkan GPS/Location Service.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Time & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Waktu Sekarang</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {currentTime.toLocaleTimeString('id-ID', { second: '2-digit' })} WIB
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
              <CalendarDays className="w-5 h-5" />
              <span className="text-sm font-medium">Tanggal</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {currentTime.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long'
              })}
            </p>
          </div>
        </div>

        {/* Attendance Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
            Absensi Hari Ini
          </h2>
          
          {/* Today's Status */}
          {todayAttendance ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 mb-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Status Absensi</h3>
                {getStatusBadge(todayAttendance)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium">Masuk</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayAttendance.checkIn || '-'}
                  </p>
                  {todayAttendance.locationIn && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      📍 {todayAttendance.locationIn.distance}m
                    </p>
                  )}
                </div>
                
                <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <ArrowLeft className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">Pulang</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayAttendance.checkOut || '-'}
                  </p>
                  {todayAttendance.locationOut && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      📍 {todayAttendance.locationOut.distance}m
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 mb-5 border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Anda belum absen hari ini
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="default"
              className="h-28 flex-col gap-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30"
              onClick={() => openScanner('in')}
              disabled={!!todayAttendance?.checkIn}
            >
              <Scan size={32} />
              <span className="text-lg font-semibold">Absen Masuk</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-28 flex-col gap-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => openScanner('out')}
              disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
            >
              <Scan size={32} />
              <span className="text-lg font-semibold">Absen Pulang</span>
            </Button>
          </div>
        </div>

        {/* History - IMPROVED TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-6 h-6 text-gray-500" />
              Riwayat Absensi
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Jam Masuk
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Jam Pulang
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {MOCK_ATTENDANCE.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(record.date).toLocaleDateString('id-ID', { 
                            weekday: 'long' 
                          })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-bold ${
                          record.checkIn 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>
                          {record.checkIn || '-'}
                        </span>
                        {record.locationIn && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            📍 {record.locationIn.distance}m
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-bold ${
                          record.checkOut 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>
                          {record.checkOut || '-'}
                        </span>
                        {record.locationOut && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            📍 {record.locationOut.distance}m
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(record)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}