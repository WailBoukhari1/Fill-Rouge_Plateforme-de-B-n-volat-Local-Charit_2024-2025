export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
  timestamp: string;
}

export interface AuthResponse {
  token: string | null;
  refreshToken: string | null;
  user: {
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export interface BackendUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
    profilePicture?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    location?: string;
} 