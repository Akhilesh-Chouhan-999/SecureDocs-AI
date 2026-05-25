export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  data: {
    user?: User;
    token: string;
    refreshToken: string;
    message?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  register: (
    email: string,
    password: string,
    organization: string,
  ) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  checkAuth?: () => Promise<void>;
}
