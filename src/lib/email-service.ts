// Menggunakan service seperti Resend, SendGrid, atau SMTP
export async function sendApprovalEmail(email: string, name: string) {
  // Send email: "Akun Anda telah disetujui"
}

export async function sendRejectionEmail(email: string, reason: string) {
  // Send email: "Pendaftaran ditolak karena..."
}

export async function sendPendingEmail(email: string, name: string) {
  // Send email: "Registrasi berhasil, menunggu approval"
}