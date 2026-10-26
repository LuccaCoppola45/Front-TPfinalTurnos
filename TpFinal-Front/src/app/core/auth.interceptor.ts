import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api';
import { tokenVencido } from './jwt';
import { Auth } from '../services/auth';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

const auth = inject(Auth);
  const token = auth.token();
  const esPublica = req.url.startsWith(`${API_URL}/api/auth/`);

  if (token && !esPublica && tokenVencido(token)) {
    auth.l();
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 401,
          error: { message: 'Tu sesión venció. Iniciá sesión nuevamente.' },
        }),
    );
  }

  const peticion =
    token && !esPublica ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !esPublica) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
