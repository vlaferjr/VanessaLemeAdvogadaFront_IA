import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private storage: StorageService,
    private authService: AuthService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isCheckSession = request.url.includes('/auth/check-session');

    // Adiciona token se existir
    if (this.storage.getToken()) {
      request = this.addToken(request, this.storage.getToken()!);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // Se erro de autenticação (401)
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (isCheckSession) {
            // Não tenta renovar sessão no check-session
            this.authService['clearSession']();
            return throwError(() => error);
          }
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Adiciona token no header
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Trata erro 401 (token expirado)
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.storage.getRefreshToken();

      if (refreshToken) {
        return this.authService.renewSession().pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.accessToken);

            // Salva novo token
            this.storage.saveToken(response.accessToken, this.storage.isRememberMe());

            return next.handle(this.addToken(request, response.accessToken));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService['clearSession']();
            return throwError(() => error);
          })
        );
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next.handle(this.addToken(request, token));
      })
    );
  }
}
