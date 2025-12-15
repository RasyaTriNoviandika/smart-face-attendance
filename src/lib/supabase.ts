import { createClient } from '@supabase/supabase-js';

// ⚠️ GANTI dengan URL dan KEY dari Supabase Dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types untuk database
export interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string;
  created_at: string;
}

export interface UserAccount {
  id: string;
  student_id: string;
  email: string;
  phone: string;
  password_hash: string;
  status: 'pending' | 'approved' | 'rejected';
  face_data: {
    images: string[];
  } | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface FaceEncoding {
  id: string;
  user_id: string;
  encoding: string;
  image_url: string;
  captured_at: string;
}

// Helper functions
export async function checkStudentExists(nisn: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('nisn', nisn)
    .single();

  if (error) return null;
  return data;
}

export async function checkUserAccountExists(nisn: string): Promise<boolean> {
  const student = await checkStudentExists(nisn);
  if (!student) return false;

  const { data } = await supabase
    .from('user_accounts')
    .select('id')
    .eq('student_id', student.id)
    .single();

  return !!data;
}

export async function uploadFaceImage(userId: string, imageData: string, index: number): Promise<string | null> {
  try {
    // Convert base64 to blob
    const base64Response = await fetch(imageData);
    const blob = await base64Response.blob();
    
    const fileName = `${userId}/face_${index}_${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('face-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('face-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

export async function createUserAccount(
  studentId: string,
  email: string,
  phone: string,
  passwordHash: string,
  faceImageUrls: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .insert({
        student_id: studentId,
        email,
        phone,
        password_hash: passwordHash,
        status: 'pending',
        face_data: { images: faceImageUrls }
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Create account error:', error);
    return { success: false, error: error.message };
  }
}