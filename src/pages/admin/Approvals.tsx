import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Mail, Phone, School, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';

interface PendingUser {
  id: string;
  name: string;
  nisn: string;
  email: string;
  phone: string;
  class: string;
  faceImages: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_PENDING_USERS: PendingUser[] = [
  {
    id: '1',
    name: 'Fitri Handayani',
    nisn: '0012345683',
    email: 'fitri@example.com',
    phone: '081234567890',
    class: 'XII RPL 2',
    faceImages: ['https://via.placeholder.com/400', 'https://via.placeholder.com/400', 'https://via.placeholder.com/400'],
    createdAt: '2024-01-15T10:30:00',
    status: 'pending'
  },
  {
    id: '2',
    name: 'Galih Ramadhan',
    nisn: '0012345684',
    email: 'galih@example.com',
    phone: '082345678901',
    class: 'XII TKJ 1',
    faceImages: ['https://via.placeholder.com/400', 'https://via.placeholder.com/400', 'https://via.placeholder.com/400'],
    createdAt: '2024-01-14T14:20:00',
    status: 'pending'
  },
];

export default function ApprovalPage() {
  const [users, setUsers] = useState<PendingUser[]>(MOCK_PENDING_USERS);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const pendingCount = users.filter(u => u.status === 'pending').length;
  const approvedCount = users.filter(u => u.status === 'approved').length;
  const rejectedCount = users.filter(u => u.status === 'rejected').length;

  const handleApprove = async (userId: string) => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'approved' as const } : u
    ));
    
    setIsProcessing(false);
    setSelectedUser(null);
    
    alert('✅ Akun berhasil disetujui! Email notifikasi telah dikirim ke siswa.');
  };

  const handleReject = async (userId: string) => {
    if (!rejectReason.trim()) {
      alert('Harap isi alasan penolakan');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'rejected' as const } : u
    ));
    
    setIsProcessing(false);
    setShowRejectModal(false);
    setSelectedUser(null);
    setRejectReason('');
    
    alert('❌ Akun ditolak. Email notifikasi dengan alasan telah dikirim ke siswa.');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const labels = {
      pending: '⏳ Menunggu',
      approved: '✓ Disetujui',
      rejected: '✗ Ditolak',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span>Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Approval Registrasi
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disetujui</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rejectedCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ditolak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Siswa</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Kontak</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Daftar</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">NISN: {user.nisn}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.class}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                        <p className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4" />
                          {user.phone}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Review Pendaftaran
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informasi Siswa
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Nama Lengkap</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">NISN</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.nisn}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Kelas</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.class}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">No. HP</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Tanggal Daftar</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Face Images */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Foto Wajah yang Diunggah
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedUser.faceImages.map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img src={img} alt={`Face ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedUser.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Setujui
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      <XCircle size={20} />
                      Tolak
                    </button>
                  </div>
                )}

                {selectedUser.status !== 'pending' && (
                  <div className="flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedUser.status === 'approved' ? 'Akun sudah disetujui' : 'Akun sudah ditolak'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Alasan Penolakan
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jelaskan alasan penolakan:
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Foto wajah tidak jelas, data tidak sesuai, dll."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                    }}
                    className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleReject(selectedUser.id)}
                    disabled={!rejectReason.trim() || isProcessing}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Konfirmasi Tolak'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}