import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { 
  ArrowLeft, 
  BookOpen, 
  Scan, 
  User, 
  Shield, 
  Clock, 
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Panduan() {
  const sections = [
    {
      id: 'intro',
      title: 'Pengenalan Sistem',
      icon: BookOpen,
      content: `FaceAbsen adalah sistem absensi modern yang menggunakan teknologi pengenalan wajah untuk mencatat kehadiran siswa secara otomatis. Sistem ini dirancang untuk mempermudah proses absensi di lingkungan SMK dengan akurasi tinggi dan tanpa kontak fisik.`,
    },
    {
      id: 'siswa',
      title: 'Panduan untuk Siswa',
      icon: User,
      content: '',
      steps: [
        {
          title: 'Login ke Sistem',
          description: 'Buka aplikasi FaceAbsen dan masuk menggunakan email dan password yang diberikan sekolah.',
        },
        {
          title: 'Absen Masuk',
          description: 'Klik tombol "Absen Masuk" lalu arahkan wajah Anda ke kamera. Pastikan wajah terlihat jelas dan pencahayaan cukup.',
        },
        {
          title: 'Tunggu Verifikasi',
          description: 'Sistem akan memindai dan mengenali wajah Anda dalam beberapa detik. Jika berhasil, akan muncul notifikasi konfirmasi.',
        },
        {
          title: 'Absen Pulang',
          description: 'Di akhir jam sekolah, lakukan proses yang sama dengan menekan tombol "Absen Pulang".',
        },
        {
          title: 'Cek Riwayat',
          description: 'Anda bisa melihat riwayat absensi di bagian bawah dashboard untuk memastikan semua tercatat dengan benar.',
        },
      ],
    },
    {
      id: 'admin',
      title: 'Panduan untuk Admin',
      icon: Shield,
      content: '',
      steps: [
        {
          title: 'Login sebagai Admin',
          description: 'Masuk menggunakan kredensial admin yang diberikan oleh sekolah.',
        },
        {
          title: 'Monitoring Real-time',
          description: 'Di tab "Monitoring Hari Ini", Anda dapat melihat siswa yang sudah absen, terlambat, atau belum absen.',
        },
        {
          title: 'Filter Data',
          description: 'Gunakan fitur pencarian dan filter kelas untuk menemukan siswa tertentu dengan cepat.',
        },
        {
          title: 'Lihat Rekap',
          description: 'Tab "Riwayat Absensi" menampilkan rekap mingguan dengan statistik hadir, terlambat, izin, sakit, dan alpha.',
        },
      ],
    },
    {
      id: 'tips',
      title: 'Tips Agar Wajah Terdeteksi',
      icon: Scan,
      content: '',
      tips: [
        'Pastikan pencahayaan ruangan cukup terang',
        'Hadapkan wajah lurus ke kamera',
        'Lepaskan masker atau penutup wajah saat absen',
        'Jaga jarak sekitar 30-50 cm dari kamera',
        'Hindari backlight (cahaya dari belakang)',
        'Pastikan lensa kamera bersih',
      ],
    },
    {
      id: 'jam',
      title: 'Jam Absensi',
      icon: Clock,
      content: '',
      schedule: [
        { label: 'Absen Masuk', time: '06:00 - 07:00', note: 'Lebih dari 07:00 tercatat terlambat' },
        { label: 'Absen Pulang', time: '14:00 - 15:00', note: 'Sesuai jadwal masing-masing kelas' },
      ],
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      content: '',
      faqs: [
        {
          q: 'Bagaimana jika wajah tidak terdeteksi?',
          a: 'Pastikan pencahayaan cukup dan wajah menghadap kamera dengan jelas. Jika masih bermasalah, hubungi admin sekolah.',
        },
        {
          q: 'Apakah bisa absen jika lupa password?',
          a: 'Hubungi admin atau bagian tata usaha sekolah untuk reset password.',
        },
        {
          q: 'Bagaimana jika terlambat?',
          a: 'Sistem akan otomatis mencatat sebagai "Terlambat" jika absen setelah jam 07:00.',
        },
        {
          q: 'Apakah data wajah saya aman?',
          a: 'Ya, semua data tersimpan dengan enkripsi dan hanya digunakan untuk keperluan absensi sekolah.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link to="/login">
            <Button size="sm">Masuk</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft size={18} />
            <span>Kembali ke Beranda</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Buku Panduan</h1>
              <p className="text-muted-foreground">Panduan lengkap penggunaan sistem FaceAbsen</p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-card rounded-xl shadow-soft p-4 mb-8 animate-slide-up">
          <h2 className="font-semibold text-foreground mb-3">Daftar Isi</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                <section.icon size={16} className="text-muted-foreground" />
                <span className="text-foreground">{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-card rounded-xl shadow-soft p-6 animate-slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              </div>

              {section.content && (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              )}

              {section.steps && (
                <div className="space-y-4 mt-4">
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground text-sm font-semibold">{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.tips && (
                <ul className="space-y-2 mt-4">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.schedule && (
                <div className="space-y-3 mt-4">
                  {section.schedule.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.note}</p>
                      </div>
                      <span className="text-lg font-semibold text-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.faqs && (
                <div className="space-y-4 mt-4">
                  {section.faqs.map((faq, i) => (
                    <div key={i} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                        <p className="font-medium text-foreground">{faq.q}</p>
                      </div>
                      <p className="text-muted-foreground text-sm pl-6">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 py-8 animate-fade-in">
          <p className="text-muted-foreground mb-4">Siap menggunakan FaceAbsen?</p>
          <Link to="/login">
            <Button variant="hero">
              Mulai Sekarang
              <ChevronRight size={20} />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 FaceAbsen. Sistem Absensi Wajah untuk SMK.
          </p>
        </div>
      </footer>
    </div>
  );
}
