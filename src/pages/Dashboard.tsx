import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Clock, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  History,
  Scan,
  User
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';
}

// Mock attendance data
const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', date: '2024-01-15', checkIn: '06:45', checkOut: '14:30', status: 'hadir' },
  { id: '2', date: '2024-01-14', checkIn: '07:15', checkOut: '14:30', status: 'terlambat' },
  { id: '3', date: '2024-01-13', checkIn: '06:50', checkOut: '14:00', status: 'hadir' },
  { id: '4', date: '2024-01-12', status: 'izin' },
  { id: '5', date: '2024-01-11', checkIn: '06:55', checkOut: '14:30', status: 'hadir' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'in' | 'out' | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Check today's attendance
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

  const handleScan = (type: 'in' | 'out') => {
    setScanType(type);
    setIsScanning(true);

    // Simulate face scanning
    setTimeout(() => {
      setIsScanning(false);
      setScanType(null);
      
      const time = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      if (type === 'in') {
        setTodayAttendance(prev => ({
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          checkIn: time,
          status: parseInt(time.split(':')[0]) > 7 ? 'terlambat' : 'hadir',
          ...prev,
        }));
        toast({
          title: 'Absen Masuk Berhasil',
          description: `Tercatat pada ${time}`,
        });
      } else {
        setTodayAttendance(prev => prev ? { ...prev, checkOut: time } : null);
        toast({
          title: 'Absen Pulang Berhasil',
          description: `Tercatat pada ${time}`,
        });
      }
    }, 2500);
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles = {
      hadir: 'bg-success/10 text-success',
      terlambat: 'bg-warning/10 text-warning',
      izin: 'bg-primary/10 text-primary',
      sakit: 'bg-primary/10 text-primary',
      alpha: 'bg-destructive/10 text-destructive',
    };

    const labels = {
      hadir: 'Hadir',
      terlambat: 'Terlambat',
      izin: 'Izin',
      sakit: 'Sakit',
      alpha: 'Alpha',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.class}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Card */}
        <div className="bg-card rounded-2xl shadow-soft p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
              <User className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Halo, {user.name}!</h1>
              <p className="text-muted-foreground text-sm">NISN: {user.nisn} • {user.class}</p>
            </div>
          </div>
        </div>

        {/* Time & Date */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl shadow-soft p-4 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Waktu</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <div className="bg-card rounded-xl shadow-soft p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tanggal</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Attendance Actions */}
        <div className="bg-card rounded-2xl shadow-medium p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Absensi Hari Ini</h2>
          
          {isScanning ? (
            <div className="text-center py-8">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse-ring" />
                <div className="absolute inset-2 rounded-full bg-secondary flex items-center justify-center">
                  <Scan className="w-12 h-12 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-foreground font-medium">Memindai Wajah...</p>
              <p className="text-muted-foreground text-sm">
                {scanType === 'in' ? 'Absen Masuk' : 'Absen Pulang'}
              </p>
            </div>
          ) : (
            <>
              {/* Today's status */}
              {todayAttendance && (
                <div className="bg-secondary/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status Hari Ini</p>
                        <p className="font-medium text-foreground">
                          Masuk: {todayAttendance.checkIn || '-'} • Pulang: {todayAttendance.checkOut || '-'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(todayAttendance.status)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="hero"
                  className="h-24 flex-col gap-2"
                  onClick={() => handleScan('in')}
                  disabled={!!todayAttendance?.checkIn}
                >
                  <Scan size={28} />
                  <span>Absen Masuk</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 shadow-soft"
                  onClick={() => handleScan('out')}
                  disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
                >
                  <Scan size={28} />
                  <span>Absen Pulang</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* History */}
        <div className="bg-card rounded-2xl shadow-soft p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Riwayat Absensi</h2>
          </div>

          <div className="space-y-3">
            {MOCK_ATTENDANCE.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.checkIn ? `${record.checkIn} - ${record.checkOut || '...'}` : '-'}
                  </p>
                </div>
                {getStatusBadge(record.status)}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
