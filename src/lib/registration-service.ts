import { supabase, checkStudentExists, checkUserAccountExists, uploadFaceImage, createUserAccount } from './supabase';
import bcrypt from 'bcryptjs'; // Install: npm install bcryptjs

export interface RegistrationData {
  nisn: string;
  email: string;
  password: string;
  phone: string;
  faceImages: string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  studentData?: {
    name: string;
    class: string;
  };
}

/**
 * Step 1: Validate NISN
 * - Check if NISN exists in students table
 * - Check if NISN already has an account
 */
export async function validateNISN(nisn: string): Promise<ValidationResult> {
  if (nisn.length !== 10) {
    return { valid: false, error: 'NISN harus 10 digit' };
  }

  // Check if student exists in school database
  const student = await checkStudentExists(nisn);
  if (!student) {
    return { 
      valid: false, 
      error: 'NISN tidak terdaftar di sistem sekolah. Hubungi admin jika ini kesalahan.' 
    };
  }

  // Check if student already has an account
  const hasAccount = await checkUserAccountExists(nisn);
  if (hasAccount) {
    return { 
      valid: false, 
      error: 'NISN sudah memiliki akun. Silakan login atau hubungi admin jika lupa password.' 
    };
  }

  return {
    valid: true,
    studentData: {
      name: student.name,
      class: student.class
    }
  };
}

/**
 * Step 2: Validate Email
 */
export async function validateEmail(email: string): Promise<ValidationResult> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Format email tidak valid' };
  }

  // Check if email already used
  const { data } = await supabase
    .from('user_accounts')
    .select('id')
    .eq('email', email)
    .single();

  if (data) {
    return { valid: false, error: 'Email sudah digunakan' };
  }

  return { valid: true };
}

/**
 * Step 3: Process Registration
 */
export async function processRegistration(data: RegistrationData): Promise<{
  success: boolean;
  error?: string;
  userId?: string;
}> {
  try {
    // 1. Validate NISN
    const nisnValidation = await validateNISN(data.nisn);
    if (!nisnValidation.valid) {
      return { success: false, error: nisnValidation.error };
    }

    // 2. Validate Email
    const emailValidation = await validateEmail(data.email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    // 3. Get student data
    const student = await checkStudentExists(data.nisn);
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 5. Upload face images
    const tempUserId = `temp_${Date.now()}`;
    const uploadPromises = data.faceImages.map((img, i) => 
      uploadFaceImage(tempUserId, img, i)
    );
    const imageUrls = await Promise.all(uploadPromises);
    
    const validUrls = imageUrls.filter(url => url !== null) as string[];
    if (validUrls.length === 0) {
      return { success: false, error: 'Gagal upload foto wajah' };
    }

    // 6. Create user account
    const result = await createUserAccount(
      student.id,
      data.email,
      data.phone,
      passwordHash,
      validUrls
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 7. Send notification to admin
    await notifyAdminNewRegistration(data.email, student.name);

    // 8. Send confirmation email to user
    await sendRegistrationConfirmationEmail(data.email, student.name);

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: 'Terjadi kesalahan saat registrasi' };
  }
}

/**
 * Notify admin about new registration
 */
async function notifyAdminNewRegistration(email: string, name: string) {
  // TODO: Implement admin notification
  // Could be email, push notification, or database flag
  console.log('Admin notification:', { email, name });
}

/**
 * Send confirmation email to user
 */
async function sendRegistrationConfirmationEmail(email: string, name: string) {
  // TODO: Implement email service
  // Using Resend, SendGrid, or Supabase Edge Functions
  console.log('Confirmation email sent to:', email);
}

/**
 * Get pending registrations (for admin)
 */
export async function getPendingRegistrations() {
  const { data, error } = await supabase
    .from('user_accounts')
    .select(`
      *,
      students (
        nisn,
        name,
        class
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending registrations:', error);
    return [];
  }

  return data;
}

/**
 * Approve user registration
 */
export async function approveRegistration(userId: string, adminId: string) {
  const { error } = await supabase
    .from('user_accounts')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: adminId
    })
    .eq('id', userId);

  if (error) {
    console.error('Approval error:', error);
    return { success: false, error: error.message };
  }

  // Send approval email
  // TODO: Implement email service

  return { success: true };
}

/**
 * Reject user registration
 */
export async function rejectRegistration(userId: string, reason: string, adminId: string) {
  const { error } = await supabase
    .from('user_accounts')
    .update({
      status: 'rejected',
      approved_by: adminId
    })
    .eq('id', userId);

  if (error) {
    console.error('Rejection error:', error);
    return { success: false, error: error.message };
  }

  // Send rejection email with reason
  // TODO: Implement email service

  return { success: true };
}