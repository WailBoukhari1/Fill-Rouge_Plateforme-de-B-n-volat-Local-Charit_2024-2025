export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface EmailVerificationRequest {
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: {
      name: string;
      email: string;
      role: string;
      status: string;
    }
  };
} 