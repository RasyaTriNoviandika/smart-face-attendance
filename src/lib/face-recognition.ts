import * as faceapi from 'face-api.js';

export async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

export async function getFaceDescriptor(imageData: string) {
  const img = await faceapi.fetchImage(imageData);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  return detection?.descriptor;
}

export function compareFaces(descriptor1: Float32Array, descriptor2: Float32Array) {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

// Alur Register
// 1. Siswa → /register
//    ├─ Input NISN
//    ├─ Validasi ke DB (cek di table students)
//    ├─ Jika valid → tampilkan nama & kelas
//    └─ Isi email, password, phone

// 2. Klik "Lanjut" → Face Capture
//    ├─ Ambil 3 foto dari sudut berbeda
//    ├─ Upload ke Supabase Storage
//    └─ Extract face encoding (opsional)

// 3. Submit → Create user_account
//    ├─ Status: 'pending'
//    ├─ Send email ke siswa: "Menunggu approval"
//    └─ Send notification ke admin

// 4. Admin → /admin/approvals
//    ├─ Lihat list pending registrations
//    ├─ Review foto wajah
//    └─ Approve / Reject

// 5. Jika Approved:
//    ├─ Update status → 'approved'
//    ├─ Send email: "Akun disetujui"
//    └─ Siswa bisa login

// 6. Jika Rejected:
//    ├─ Update status → 'rejected'
//    └─ Send email dengan alasan