export interface User {
  email: string;
  roles: string[];
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  id?: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null
}; 