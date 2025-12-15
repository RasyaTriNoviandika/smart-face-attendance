import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { Scan, Shield, Clock, Users, BookOpen, ChevronRight, Check } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Scan,
      title: 'Absensi Wajah',
      description: 'Teknologi pengenalan wajah yang akurat dan cepat untuk absensi tanpa sentuh.',
    },
    {
      icon: Clock,
      title: 'Real-time',
      description: 'Data absensi tersimpan secara langsung dan dapat diakses kapan saja.',
    },
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Data siswa terlindungi dengan sistem keamanan yang handal.',
    },
    {
      icon: Users,
      title: 'Mudah Digunakan',
      description: 'Interface yang sederhana untuk siswa dan admin sekolah.',
    },
  ];

  const steps = [
    'Buka halaman absensi',
    'Arahkan wajah ke kamera',
    'Sistem mengenali wajah Anda',
    'Absensi tercatat otomatis',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Link to="/panduan">
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpen size={16} />
                Panduan
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Masuk</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Sistem Aktif
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
            Absensi Modern dengan{' '}
            <span className="text-muted-foreground">Pengenalan Wajah</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Sistem absensi digital untuk SMK yang cepat, akurat, dan tanpa kontak fisik. 
            Cukup tunjukkan wajah Anda, absensi tercatat otomatis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/login">
              <Button variant="outline" className="w-full sm:w-auto">
                Mulai Absensi
                <ChevronRight size={20} />
              </Button>
            </Link>
            <Link to="/panduan">
              <Button variant="outline" size="lg" className="">
                <BookOpen size={18} />
                Baca Panduan
              </Button>
            </Link>
          </div>
          <br />
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button variant="outline" size="lg">
              Login
            </Button>
          </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button variant="outline" size="lg">
              Daftar Sekarang
            </Button>
          </Link>
        </div>
        </div>
      </section>

      {/* Preview */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-card rounded-2xl shadow-elevated p-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent" />
              <div className="text-center z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Scan className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground">Preview Kamera Absensi</p>
              </div>
              {/* Face outline guide */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 border-2 border-dashed border-muted-foreground/30 rounded-[50%_50%_45%_45%]" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground">
              Dirancang untuk kemudahan siswa dan efisiensi administrasi sekolah
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-300 animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Cara Kerja
            </h2>
            <p className="text-muted-foreground">
              Proses absensi yang simpel dan cepat
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-soft animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-semibold">{index + 1}</span>
                </div>
                <p className="text-foreground">{step}</p>
                <Check className="w-5 h-5 text-success ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Siap Mulai Absensi?
          </h2>
          <p className="text-muted-foreground mb-8">
            Login dengan akun sekolah Anda untuk mulai menggunakan sistem absensi wajah.
          </p>
          <Link to="/login">
            <Button variant="hero">
              Masuk Sekarang
              <ChevronRight size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 FaceAbsen. Sistem Absensi SMK.
          </p>
          <Link to="/panduan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Buku Panduan
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
