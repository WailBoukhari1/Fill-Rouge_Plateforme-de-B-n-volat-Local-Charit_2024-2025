import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../components/auth/services/auth.service';

export const ApiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const token = authService.getAuthToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
}; 