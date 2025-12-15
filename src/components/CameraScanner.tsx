import { useRef, useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  scanType: 'in' | 'out';
  onSuccess: (time: string) => void;
}

type ScanStatus = 'initializing' | 'ready' | 'scanning' | 'success' | 'error';

export function CameraScanner({ isOpen, onClose, scanType, onSuccess }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<ScanStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
          setErrorMessage('Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda.');
        } else if (err.name === 'NotFoundError') {
          setErrorMessage('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.');
        } else {
          setErrorMessage('Gagal mengakses kamera. Silakan coba lagi.');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setStatus('initializing');
      setCountdown(3);
    }
    
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const handleScan = () => {
    if (status !== 'ready') return;
    
    setStatus('scanning');
    setCountdown(3);
    
    // Countdown animation
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate face detection after countdown
    setTimeout(() => {
      clearInterval(countdownInterval);
      setStatus('success');
      
      const now = new Date();
      const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      // Auto close after success
      setTimeout(() => {
        onSuccess(time);
        onClose();
      }, 2000);
    }, 3000);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-card border-0 shadow-elevated">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {scanType === 'in' ? 'Absen Masuk' : 'Absen Pulang'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {status === 'ready' ? 'Kamera aktif' : 
                 status === 'scanning' ? 'Memindai wajah...' :
                 status === 'success' ? 'Berhasil!' : 'Menghubungkan...'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
          {status === 'error' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-foreground font-medium mb-2">Tidak dapat mengakses kamera</p>
              <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
              <Button onClick={startCamera} variant="outline">
                Coba Lagi
              </Button>
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
              
              {/* Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Face guide oval */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-60">
                  <svg viewBox="0 0 192 240" className="w-full h-full">
                    <ellipse
                      cx="96"
                      cy="120"
                      rx="90"
                      ry="115"
                      fill="none"
                      stroke={status === 'success' ? 'hsl(142, 72%, 40%)' : status === 'scanning' ? 'hsl(220, 15%, 15%)' : 'hsl(220, 10%, 45%)'}
                      strokeWidth="3"
                      strokeDasharray={status === 'ready' ? '8 8' : '0'}
                      className="transition-all duration-300"
                    />
                  </svg>
                  
                  {/* Scanning animation */}
                  {status === 'scanning' && (
                    <div className="absolute inset-0 overflow-hidden rounded-[50%]">
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-b from-primary/50 to-transparent animate-scan-line" />
                    </div>
                  )}
                </div>

                {/* Corner guides */}
                <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
                <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
                <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
                <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />

                {/* Status indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  {status === 'initializing' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-foreground">Menghubungkan kamera...</span>
                    </div>
                  )}
                  {status === 'ready' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm text-success font-medium">Kamera Aktif</span>
                    </div>
                  )}
                  {status === 'scanning' && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 backdrop-blur-sm">
                      <span className="text-xl font-bold text-primary-foreground">{countdown}</span>
                      <span className="text-sm text-primary-foreground">Memindai...</span>
                    </div>
                  )}
                </div>

                {/* Success overlay */}
                {status === 'success' && (
                  <div className="absolute inset-0 bg-success/20 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center mx-auto mb-4 animate-scale-in">
                        <CheckCircle2 className="w-10 h-10 text-success-foreground" />
                      </div>
                      <p className="text-xl font-bold text-foreground">Absen Berhasil!</p>
                      <p className="text-muted-foreground">
                        {scanType === 'in' ? 'Selamat datang!' : 'Sampai jumpa besok!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-secondary/30">
          {status === 'ready' && (
            <Button 
              onClick={handleScan} 
              className="w-full" 
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Ambil Foto & Absen
            </Button>
          )}
          {status === 'scanning' && (
            <div className="text-center py-2">
              <p className="text-muted-foreground">Tetap diam, wajah sedang dipindai...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="text-center py-2">
              <p className="text-success font-medium">Mengalihkan otomatis...</p>
            </div>
          )}
          {status === 'initializing' && (
            <div className="text-center py-2">
              <p className="text-muted-foreground">Mohon izinkan akses kamera...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
