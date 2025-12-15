import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/lib/auth-context';
import { 
  LogOut, 
  Users, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  nisn: string;
  class: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha' | 'belum';
  checkIn?: string;
  checkOut?: string;
}

// Mock student data
const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Ahmad Rizki', nisn: '0012345678', class: 'XII RPL 1', status: 'hadir', checkIn: '06:45', checkOut: '14:30' },
  { id: '2', name: 'Budi Pratama', nisn: '0012345679', class: 'XII RPL 1', status: 'terlambat', checkIn: '07:25' },
  { id: '3', name: 'Citra Dewi', nisn: '0012345680', class: 'XII RPL 1', status: 'hadir', checkIn: '06:50', checkOut: '14:00' },
  { id: '4', name: 'Dina Safitri', nisn: '0012345681', class: 'XII RPL 2', status: 'izin' },
  { id: '5', name: 'Eko Wijaya', nisn: '0012345682', class: 'XII RPL 2', status: 'hadir', checkIn: '06:55' },
  { id: '6', name: 'Fitri Handayani', nisn: '0012345683', class: 'XII RPL 2', status: 'belum' },
  { id: '7', name: 'Galih Ramadhan', nisn: '0012345684', class: 'XII TKJ 1', status: 'sakit' },
  { id: '8', name: 'Hana Pertiwi', nisn: '0012345685', class: 'XII TKJ 1', status: 'hadir', checkIn: '06:40', checkOut: '14:30' },
];

interface AttendanceHistory {
  date: string;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
}

const MOCK_HISTORY: AttendanceHistory[] = [
  { date: '2024-01-15', hadir: 180, terlambat: 12, izin: 5, sakit: 3, alpha: 0 },
  { date: '2024-01-14', hadir: 175, terlambat: 15, izin: 8, sakit: 2, alpha: 0 },
  { date: '2024-01-13', hadir: 182, terlambat: 10, izin: 3, sakit: 5, alpha: 0 },
  { date: '2024-01-12', hadir: 178, terlambat: 14, izin: 6, sakit: 2, alpha: 0 },
  { date: '2024-01-11', hadir: 185, terlambat: 8, izin: 4, sakit: 3, alpha: 0 },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.nisn.includes(searchQuery);
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const stats = {
    total: MOCK_STUDENTS.length,
    hadir: MOCK_STUDENTS.filter(s => s.status === 'hadir').length,
    terlambat: MOCK_STUDENTS.filter(s => s.status === 'terlambat').length,
    izin: MOCK_STUDENTS.filter(s => s.status === 'izin' || s.status === 'sakit').length,
    belum: MOCK_STUDENTS.filter(s => s.status === 'belum').length,
  };

  const getStatusBadge = (status: Student['status']) => {
    const styles = {
      hadir: 'bg-success/10 text-success',
      terlambat: 'bg-warning/10 text-warning',
      izin: 'bg-primary/10 text-primary',
      sakit: 'bg-primary/10 text-primary',
      alpha: 'bg-destructive/10 text-destructive',
      belum: 'bg-muted text-muted-foreground',
    };

    const labels = {
      hadir: 'Hadir',
      terlambat: 'Terlambat',
      izin: 'Izin',
      sakit: 'Sakit',
      alpha: 'Alpha',
      belum: 'Belum Absen',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const uniqueClasses = [...new Set(MOCK_STUDENTS.map(s => s.class))];

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
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl shadow-soft p-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Siswa</p>
          </div>
          
          <div className="bg-card rounded-xl shadow-soft p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.hadir}</p>
            <p className="text-sm text-muted-foreground">Hadir</p>
          </div>
          
          <div className="bg-card rounded-xl shadow-soft p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.terlambat}</p>
            <p className="text-sm text-muted-foreground">Terlambat</p>
          </div>
          
          <div className="bg-card rounded-xl shadow-soft p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.belum}</p>
            <p className="text-sm text-muted-foreground">Belum Absen</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'today' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('today')}
          >
            <UserCheck size={18} className="mr-2" />
            Monitoring Hari Ini
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('history')}
          >
            <TrendingUp size={18} className="mr-2" />
            Riwayat Absensi
          </Button>
        </div>

        {activeTab === 'today' ? (
          <>
            {/* Search & Filter */}
            <div className="bg-card rounded-xl shadow-soft p-4 mb-6 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau NISN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="all">Semua Kelas</option>
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="bg-card rounded-xl shadow-soft overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nama</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">NISN</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kelas</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Masuk</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pulang</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{student.name}</p>
                        </td>
                        <td className="p-4 text-muted-foreground">{student.nisn}</td>
                        <td className="p-4 text-muted-foreground">{student.class}</td>
                        <td className="p-4 text-foreground">{student.checkIn || '-'}</td>
                        <td className="p-4 text-foreground">{student.checkOut || '-'}</td>
                        <td className="p-4">{getStatusBadge(student.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* History View */
          <div className="bg-card rounded-xl shadow-soft overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rekap Absensi Mingguan
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tanggal</th>
                    <th className="text-center p-4 text-sm font-medium text-success">Hadir</th>
                    <th className="text-center p-4 text-sm font-medium text-warning">Terlambat</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Izin</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Sakit</th>
                    <th className="text-center p-4 text-sm font-medium text-destructive">Alpha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_HISTORY.map((record) => (
                    <tr key={record.date} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">
                          {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-success/10 text-success font-medium">
                          {record.hadir}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-warning/10 text-warning font-medium">
                          {record.terlambat}
                        </span>
                      </td>
                      <td className="p-4 text-center text-muted-foreground">{record.izin}</td>
                      <td className="p-4 text-center text-muted-foreground">{record.sakit}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full ${record.alpha > 0 ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground'} font-medium`}>
                          {record.alpha}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
