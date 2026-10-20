import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  let authService = inject(AuthService)
  let router = inject(Router)


  return next(req).pipe(
    catchError((error) => {
      if (error.status == 401) {
        authService.logout();
        router.navigate(['/logout'])
      }
      return throwError(() => error)
    })
  )
};
