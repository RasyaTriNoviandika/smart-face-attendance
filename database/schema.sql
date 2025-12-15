-- Tabel siswa yang terdaftar di sekolah
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nisn VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  class VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel user accounts (setelah registrasi)
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  face_data JSONB, -- Store 3 face image URLs
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES user_accounts(id)
);

-- Tabel untuk face recognition data
CREATE TABLE face_encodings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_accounts(id),
  encoding TEXT NOT NULL, -- Base64 encoded face vector
  image_url TEXT,
  captured_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_user_accounts_status ON user_accounts(status);
CREATE INDEX idx_students_nisn ON students(nisn);