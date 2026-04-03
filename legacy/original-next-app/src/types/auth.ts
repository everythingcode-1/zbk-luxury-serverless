export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
