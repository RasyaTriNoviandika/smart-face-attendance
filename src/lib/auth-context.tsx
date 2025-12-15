import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

/* =======================
   TYPES & INTERFACES
======================= */

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  nisn?: string;
  className?: string;
  avatar?: string;
}

interface RegisterData {
  nisn: string;
  email: string;
  password: string;
  phone: string;
  faceImages: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

/* =======================
   CONTEXT
======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   MOCK USERS
======================= */

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'siswa@smk.sch.id',
    password: 'siswa123',
    name: 'Ahmad Rizki',
    role: 'student',
    nisn: '0012345678',
    className: 'XII RPL 1',
  },
  {
    id: '2',
    email: 'admin@smk.sch.id',
    password: 'admin123',
    name: 'Budi Santoso',
    role: 'admin',
  },
];

/* =======================
   PROVIDER
======================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('absensi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...safeUser } = foundUser;
      setUser(safeUser);
      localStorage.setItem('absensi_user', JSON.stringify(safeUser));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Email atau password salah' };
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      // nanti isi logic backend di sini
      await new Promise(r => setTimeout(r, 1000));

      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('absensi_user');
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =======================
   HOOK
======================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
