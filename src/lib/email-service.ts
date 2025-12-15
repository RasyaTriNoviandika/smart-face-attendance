// Install: npm install resend

import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

const FROM_EMAIL = 'FaceAbsen <noreply@faceabsen.com>';
const SCHOOL_NAME = 'SMK Negeri 1 Cikarang';

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmation(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Registrasi Berhasil - ${SCHOOL_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .info-box { background: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registrasi Berhasil!</h1>
            </div>
            <div class="content">
              <p>Halo <strong>${name}</strong>,</p>
              
              <p>Terima kasih telah mendaftar di sistem absensi <strong>FaceAbsen ${SCHOOL_NAME}</strong>!</p>
              
              <div class="info-box">
                <p><strong>📋 Status Akun:</strong> Menunggu Approval Admin</p>
                <p><strong>⏱️ Estimasi Waktu:</strong> Maksimal 1x24 jam</p>
              </div>
              
              <p>Kami akan mengirim email notifikasi setelah akun Anda disetujui oleh admin sekolah.</p>
              
              <p><strong>Yang perlu Anda lakukan selanjutnya:</strong></p>
              <ul>
                <li>Tunggu email konfirmasi approval dari kami</li>
                <li>Setelah disetujui, Anda bisa login menggunakan email dan password yang sudah didaftarkan</li>
                <li>Jika lebih dari 1x24 jam belum ada kabar, hubungi admin sekolah</li>
              </ul>
              
              <p>Jika Anda tidak merasa mendaftar, abaikan email ini atau hubungi admin sekolah.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 12px; color: #6b7280;">
                Email ini dikirim otomatis oleh sistem FaceAbsen ${SCHOOL_NAME}.<br>
                Mohon tidak membalas email ini.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return { success: true };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send approval notification email
 */
export async function sendApprovalNotification(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Akun Disetujui - ${SCHOOL_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; text-align: center; }
            .success-box { background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Akun Anda Disetujui!</h1>
            </div>
            <div class="content">
              <p>Halo <strong>${name}</strong>,</p>
              
              <div class="success-box">
                <p style="margin: 0;"><strong>🎉 Selamat! Akun Anda telah disetujui oleh admin sekolah.</strong></p>
              </div>
              
              <p>Anda sekarang dapat login dan menggunakan sistem absensi FaceAbsen.</p>
              
              <p><strong>Langkah selanjutnya:</strong></p>
              <ol>
                <li>Kunjungi halaman login FaceAbsen</li>
                <li>Masuk menggunakan email dan password yang sudah Anda daftarkan</li>
                <li>Mulai melakukan absensi menggunakan pengenalan wajah</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/login" class="button">Login Sekarang</a>
              </div>
              
              <p><strong>Tips penggunaan:</strong></p>
              <ul>
                <li>Pastikan wajah Anda terlihat jelas saat absen</li>
                <li>Gunakan pencahayaan yang cukup</li>
                <li>Absen harus dilakukan di area sekolah (dalam radius 100m)</li>
              </ul>
              
              <p>Jika mengalami kendala, hubungi admin sekolah atau baca panduan di aplikasi.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 12px; color: #6b7280;">
                Email ini dikirim otomatis oleh sistem FaceAbsen ${SCHOOL_NAME}.<br>
                Mohon tidak membalas email ini.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return { success: true };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send rejection notification email
 */
export async function sendRejectionNotification(
  email: string,
  name: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Registrasi Tidak Disetujui - ${SCHOOL_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning-box { background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registrasi Tidak Disetujui</h1>
            </div>
            <div class="content">
              <p>Halo <strong>${name}</strong>,</p>
              
              <p>Mohon maaf, registrasi akun Anda di sistem FaceAbsen ${SCHOOL_NAME} tidak dapat disetujui.</p>
              
              <div class="warning-box">
                <p><strong>📝 Alasan:</strong></p>
                <p>${reason}</p>
              </div>
              
              <p><strong>Apa yang harus dilakukan?</strong></p>
              <ul>
                <li>Hubungi admin sekolah untuk informasi lebih lanjut</li>
                <li>Jika ada kesalahan data, Anda bisa mendaftar ulang dengan data yang benar</li>
                <li>Pastikan foto wajah yang diupload jelas dan sesuai</li>
              </ul>
              
              <p>Jika Anda merasa ini adalah kesalahan, silakan hubungi bagian tata usaha sekolah.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 12px; color: #6b7280;">
                Email ini dikirim otomatis oleh sistem FaceAbsen ${SCHOOL_NAME}.<br>
                Mohon tidak membalas email ini.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return { success: true };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send admin notification for new registration
 */
export async function sendAdminNewRegistrationAlert(
  adminEmail: string,
  studentName: string,
  studentEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🔔 Registrasi Baru - ${studentName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; text-align: center; }
            .info-box { background: #ede9fe; padding: 15px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Registrasi Baru</h1>
            </div>
            <div class="content">
              <p>Ada registrasi akun baru yang memerlukan approval:</p>
              
              <div class="info-box">
                <p><strong>Nama:</strong> ${studentName}</p>
                <p><strong>Email:</strong> ${studentEmail}</p>
                <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
              </div>
              
              <p>Silakan login ke dashboard admin untuk meninjau dan menyetujui registrasi ini.</p>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/admin/approvals" class="button">Buka Dashboard Admin</a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 12px; color: #6b7280;">
                Email ini dikirim otomatis oleh sistem FaceAbsen ${SCHOOL_NAME}.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return { success: true };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}