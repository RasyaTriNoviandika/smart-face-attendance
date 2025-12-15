import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Camera, CheckCircle2, AlertCircle, Loader2, Info, IdCard, Phone } from 'lucide-react';

// Mock data NISN yang terdaftar di sekolah
const REGISTERED_NISN = [
  { nisn: '0012345678', name: 'Ahmad Rizki', class: 'XII RPL 1' },
  { nisn: '0012345679', name: 'Budi Santoso', class: 'XII RPL 1' },
  { nisn: '0012345680', name: 'Citra Dewi', class: 'XII RPL 2' },
  { nisn: '0012345681', name: 'Dina Safitri', class: 'XII TKJ 1' },
  { nisn: '0012345682', name: 'Eko Wijaya', class: 'XII TKJ 1' },
];

type Step = 'form' | 'face-capture' | 'processing' | 'success';

interface FormData {
  nisn: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface StudentData {
  name: string;
  class: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [formData, setFormData] = useState<FormData>({
    nisn: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isValidatingNISN, setIsValidatingNISN] = useState(false);
  const [faceImages, setFaceImages] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Debounce untuk validasi NISN
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.nisn.length === 10) {
        validateNISN(formData.nisn);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.nisn]);

  // Camera management
  useEffect(() => {
    if (currentStep === 'face-capture') {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [currentStep]);

  const validateNISN = async (nisn: string) => {
    setIsValidatingNISN(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const student = REGISTERED_NISN.find(s => s.nisn === nisn);

    if (student) {
      setStudentData({
        name: student.name,
        class: student.class
      });
      setErrors(prev => ({ ...prev, nisn: undefined }));
    } else {
      setStudentData(null);
      setErrors(prev => ({
        ...prev,
        nisn: 'NISN tidak terdaftar di database sekolah'
      }));
    }
    
    setIsValidatingNISN(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'nisn') {
      const onlyNumber = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, nisn: onlyNumber }));
      
      // Clear student data if length changes
      if (onlyNumber.length !== 10) {
        setStudentData(null);
        setErrors(prev => ({ ...prev, nisn: undefined }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // NISN
    if (!formData.nisn) {
      newErrors.nisn = 'NISN wajib diisi';
    } else if (formData.nisn.length !== 10) {
      newErrors.nisn = 'NISN harus 10 digit';
    } else if (!studentData) {
      newErrors.nisn = 'NISN tidak terdaftar';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    // Phone
    if (!formData.phone) {
      newErrors.phone = 'Nomor HP wajib diisi';
    } else if (!/^08\d{8,11}$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor HP tidak valid (08xxxxxxxxx)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setCurrentStep('face-capture');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Gagal mengakses kamera. Pastikan Anda mengizinkan akses kamera.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const newImages = [...faceImages, imageData];
    setFaceImages(newImages);
    
    if (newImages.length >= 3) {
      stopCamera();
      setCurrentStep('processing');
      processRegistration();
    }
  };

  const processRegistration = async () => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCurrentStep('success');
  };

  const resetForm = () => {
    setCurrentStep('form');
    setFormData({
      nisn: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    });
    setStudentData(null);
    setFaceImages([]);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-xl">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Daftar Akun Baru
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bergabung dengan sistem absensi FaceAbsen
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {currentStep === 'form' && (
            <div className="p-8">
              <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6">
                <ArrowLeft size={18} />
                <span className="text-sm">Kembali</span>
              </Link>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-1">Panduan Registrasi:</p>
                    <ol className="list-decimal ml-4 space-y-1 text-blue-800 dark:text-blue-200">
                      <li>Isi data dengan NISN yang terdaftar</li>
                      <li>Setelah itu, ambil foto wajah Anda</li>
                      <li>Tunggu approval dari admin (1x24 jam)</li>
                    </ol>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-5">
                {/* NISN Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => handleInputChange('nisn', e.target.value)}
                      placeholder="0012345678"
                      maxLength={10}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                        errors.nisn 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : studentData
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } focus:outline-none focus:ring-2 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                    />
                    {isValidatingNISN && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                    )}
                    {studentData && !isValidatingNISN && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {errors.nisn && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nisn}
                    </p>
                  )}
                  {studentData && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-900 dark:text-green-100 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Data ditemukan!
                      </p>
                      <div className="mt-1 text-sm text-green-800 dark:text-green-200">
                        <p>Nama: <strong>{studentData.name}</strong></p>
                        <p>Kelas: <strong>{studentData.class}</strong></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="nama@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } focus:outline-none focus:ring-2 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor HP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="08123456789"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } focus:outline-none focus:ring-2 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Min. 6 karakter"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } focus:outline-none focus:ring-2 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Ketik ulang password"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } focus:outline-none focus:ring-2 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!studentData || isValidatingNISN}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isValidatingNISN ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memvalidasi NISN...
                    </span>
                  ) : (
                    'Lanjut ke Pengambilan Foto'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  Login di sini
                </Link>
              </p>
            </div>
          )}

          {currentStep === 'face-capture' && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                📸 Pengambilan Foto Wajah
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Ambil {3 - faceImages.length} foto lagi dari sudut berbeda
              </p>

              <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60">
                    <svg viewBox="0 0 192 240" className="w-full h-full">
                      <ellipse
                        cx="96" cy="120" rx="90" ry="115"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="8 8"
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white font-medium">
                    Foto {faceImages.length + 1} dari 3
                  </span>
                </div>
              </div>

              {faceImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {faceImages.map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-green-500">
                      <img src={img} alt={`Capture ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={captureFrame}
                disabled={!isCameraReady}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <Camera size={20} />
                {isCameraReady ? `Ambil Foto (${faceImages.length}/3)` : 'Memuat Kamera...'}
              </button>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Memproses Registrasi...
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Mohon tunggu, kami sedang menyimpan data Anda
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p>✓ Memvalidasi data</p>
                <p>✓ Menyimpan foto wajah</p>
                <p>⏳ Mengirim ke admin untuk approval...</p>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 Registrasi Berhasil!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Akun Anda telah terdaftar dan menunggu approval dari admin
              </p>
              
              {studentData && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Data yang terdaftar:
                  </p>
                  <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <p>Nama: <strong>{studentData.name}</strong></p>
                    <p>NISN: <strong>{formData.nisn}</strong></p>
                    <p>Kelas: <strong>{studentData.class}</strong></p>
                    <p>Email: <strong>{formData.email}</strong></p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  📧 Kami akan mengirim email notifikasi setelah akun Anda disetujui oleh admin (maks. 1x24 jam)
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Ke Halaman Login
                </Link>
                <button
                  onClick={resetForm}
                  className="w-full py-3 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all"
                >
                  Daftar Akun Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}