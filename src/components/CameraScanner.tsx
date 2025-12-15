import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, CheckCircle2, AlertCircle, Loader2, MapPin, Navigation } from 'lucide-react';

// ⚠️ KONFIGURASI SEKOLAH - GANTI DENGAN KOORDINAT SEKOLAH ANDA
const SCHOOL_LOCATION = {
  latitude: -6.3345346,
  longitude: 107.1488326,
  name: "SMKN 9 KOTA BEKASI"
};

const MAX_DISTANCE_METERS = 100; // Radius dalam meter

// Fungsi Haversine untuk menghitung jarak
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  scanType: 'in' | 'out';
  onSuccess: (time: string, location?: GeolocationData) => void;
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  distance: number;
}

type ScanStatus = 'initializing' | 'checking_location' | 'location_valid' | 'location_invalid' | 'ready' | 'scanning' | 'success' | 'error';

export function CameraScanner({ isOpen, onClose, scanType, onSuccess }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<ScanStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [locationData, setLocationData] = useState<GeolocationData | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Fungsi cek lokasi - WAJIB VALID sebelum bisa absen
  const checkLocation = useCallback(async (): Promise<boolean> => {
    setStatus('checking_location');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Browser tidak mendukung GPS. Gunakan Chrome atau Safari terbaru.');
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      const distance = calculateDistance(
        latitude,
        longitude,
        SCHOOL_LOCATION.latitude,
        SCHOOL_LOCATION.longitude
      );

      const locationInfo: GeolocationData = {
        latitude,
        longitude,
        accuracy,
        distance: Math.round(distance)
      };

      setLocationData(locationInfo);

      // ⚠️ VALIDASI KETAT - Harus dalam radius
      if (distance <= MAX_DISTANCE_METERS) {
        setStatus('location_valid');
        return true;
      } else {
        setStatus('location_invalid');
        setErrorMessage(
          `❌ Anda berada ${Math.round(distance)}m dari ${SCHOOL_LOCATION.name}.\n\n` +
          `Absensi hanya bisa dilakukan dalam radius ${MAX_DISTANCE_METERS}m dari sekolah.\n\n` +
          `Silakan datang ke sekolah terlebih dahulu.`
        );
        return false;
      }

    } catch (error: any) {
      setStatus('error');
      
      if (error.code === 1) {
        setErrorMessage('❌ Izin lokasi ditolak.\n\nUntuk absen, Anda harus mengizinkan akses lokasi:\n\n1. Klik ikon 🔒 di address bar\n2. Pilih "Site settings"\n3. Ubah Location menjadi "Allow"');
      } else if (error.code === 2) {
        setErrorMessage('❌ Lokasi tidak tersedia.\n\nPastikan:\n• GPS aktif di perangkat\n• Location Service aktif\n• Anda berada di area terbuka');
      } else if (error.code === 3) {
        setErrorMessage('❌ Timeout deteksi lokasi.\n\nCoba:\n• Pindah ke tempat lebih terbuka\n• Restart GPS\n• Tunggu beberapa saat');
      } else {
        setErrorMessage('❌ Gagal mendapatkan lokasi.\n\nSilakan coba lagi atau hubungi admin.');
      }
      
      return false;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setStatus('initializing');
      setErrorMessage('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus('ready');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setStatus('error');
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setErrorMessage('❌ Izin kamera ditolak.\n\nUntuk absen, izinkan akses kamera di browser.');
        } else if (err.name === 'NotFoundError') {
          setErrorMessage('❌ Kamera tidak ditemukan.\n\nPastikan perangkat memiliki kamera.');
        } else {
          setErrorMessage('❌ Gagal mengakses kamera.\n\nSilakan coba lagi.');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // STEP 1: Cek lokasi DULU
      checkLocation().then(isValidLocation => {
        // STEP 2: Baru buka kamera jika lokasi valid
        if (isValidLocation) {
          startCamera();
        }
        // Jika tidak valid, TIDAK BUKA KAMERA sama sekali
      });
    } else {
      stopCamera();
      setStatus('initializing');
      setCountdown(3);
      setLocationData(null);
    }
    
    return () => stopCamera();
  }, [isOpen, checkLocation, startCamera, stopCamera]);

  const handleScan = () => {
    // DOUBLE CHECK: Pastikan lokasi masih valid
    if (status !== 'ready' || !locationData) return;
    
    if (locationData.distance > MAX_DISTANCE_METERS) {
      setStatus('location_invalid');
      setErrorMessage(`❌ Lokasi berubah! Anda sekarang ${locationData.distance}m dari sekolah.`);
      stopCamera();
      return;
    }
    
    setStatus('scanning');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      setStatus('success');
      
      const now = new Date();
      const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      setTimeout(() => {
        onSuccess(time, locationData);
        onClose();
      }, 2000);
    }, 3000);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleRetryLocation = () => {
    setLocationData(null);
    checkLocation().then(isValidLocation => {
      if (isValidLocation) {
        startCamera();
      }
    });
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
      
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {scanType === 'in' ? 'Absen Masuk' : 'Absen Pulang'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {status === 'checking_location' ? 'Mengecek lokasi...' :
                   status === 'location_invalid' ? '❌ Lokasi tidak valid' :
                   status === 'location_valid' ? '✓ Lokasi valid' :
                   status === 'ready' ? '✓ Siap absen' : 
                   status === 'scanning' ? 'Memindai wajah...' :
                   status === 'success' ? '✓ Berhasil!' : 'Memuat...'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Location Banner */}
          {locationData && (
            <div className={`p-4 border-b ${
              status === 'location_valid' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  status === 'location_valid' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${
                    status === 'location_valid' 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {status === 'location_valid' ? '✓ Anda Berada di Area Sekolah' : '✗ Anda di Luar Area Sekolah'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    status === 'location_valid' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    Jarak: <strong>{locationData.distance}m</strong> dari {SCHOOL_LOCATION.name}
                  </p>
                  {locationData.accuracy > 100 && (
                    <p className="text-xs mt-1 text-orange-600">
                      ⚠️ Akurasi GPS rendah ({Math.round(locationData.accuracy)}m)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Camera View */}
          <div className="relative aspect-[4/3] bg-gray-900">
            {status === 'checking_location' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <p className="text-white font-medium mb-2">Mengecek Lokasi Anda...</p>
                <p className="text-sm text-gray-400">Mohon izinkan akses lokasi di browser</p>
              </div>
            ) : status === 'location_invalid' || (status === 'error' && errorMessage.includes('Lokasi')) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-white font-semibold mb-3">Tidak Bisa Absen</p>
                <p className="text-sm text-gray-300 mb-4 whitespace-pre-line max-w-xs">{errorMessage}</p>
                <button
                  onClick={handleRetryLocation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Cek Ulang Lokasi
                </button>
              </div>
            ) : status === 'error' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-white font-semibold mb-3">Terjadi Kesalahan</p>
                <p className="text-sm text-gray-300 mb-4 whitespace-pre-line max-w-xs">{errorMessage}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 pointer-events-none">
                  {/* Face Guide */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-60">
                    <svg viewBox="0 0 192 240" className="w-full h-full">
                      <ellipse
                        cx="96" cy="120" rx="90" ry="115"
                        fill="none"
                        stroke={status === 'success' ? '#22c55e' : status === 'scanning' ? '#3b82f6' : '#94a3b8'}
                        strokeWidth="3"
                        strokeDasharray={status === 'ready' ? '8 8' : '0'}
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>

                  {/* Corners */}
                  <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-blue-400/50 rounded-tl-lg" />
                  <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-blue-400/50 rounded-tr-lg" />
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-blue-400/50 rounded-bl-lg" />
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-blue-400/50 rounded-br-lg" />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    {status === 'ready' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-sm text-white font-medium">Siap Absen</span>
                      </div>
                    )}
                    {status === 'scanning' && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/90 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white">{countdown}</span>
                      </div>
                    )}
                  </div>

                  {/* Success Overlay */}
                  {status === 'success' && (
                    <div className="absolute inset-0 bg-green-500/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white mb-2">Absen Berhasil!</p>
                        <p className="text-white/90">
                          {scanType === 'in' ? '🎉 Selamat datang!' : '👋 Sampai jumpa besok!'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
            {status === 'ready' && (
              <button 
                onClick={handleScan} 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Camera className="w-5 h-5" />
                Ambil Foto & Absen Sekarang
              </button>
            )}
            {status === 'scanning' && (
              <p className="text-center text-gray-600 dark:text-gray-400 py-2">
                📸 Tetap diam, wajah sedang dipindai...
              </p>
            )}
            {status === 'success' && (
              <p className="text-center text-green-600 dark:text-green-400 font-medium py-2">
                ✓ Berhasil! Mengalihkan...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}