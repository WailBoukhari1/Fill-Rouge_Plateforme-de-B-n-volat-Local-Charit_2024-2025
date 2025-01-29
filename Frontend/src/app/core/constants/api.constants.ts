export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  EVENTS: {
    BASE: '/events',
    SEARCH: '/events/search',
    REGISTER: (id: string) => `/events/${id}/register`
  },
  ORGANIZATIONS: {
    BASE: '/organizations',
    VERIFY: (id: string) => `/organizations/${id}/verify`
  },
  VOLUNTEERS: {
    BASE: '/volunteers',
    PROFILE: '/volunteers/profile',
    EVENTS: '/volunteers/events'
  }
}; 