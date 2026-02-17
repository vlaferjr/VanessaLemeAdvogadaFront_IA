import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Interceptor que adiciona token JWT em todas as requisições
 * e trata erros de autenticação
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private storage: StorageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Obtém token do storage
    const token = this.storage.getToken();

    // Se existir token e não for requisição de login/public, adiciona header
    if (token && !this.isPublicEndpoint(request.url)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Processa requisição e trata erros
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        // Erro 401: Não autorizado (token inválido/expirado)
        if (error.status === 401) {
          this.handle401Error();
        }

        // Erro 403: Proibido (sem permissão)
        if (error.status === 403) {
          this.handle403Error();
        }

        // Erro 500: Erro do servidor
        if (error.status === 500) {
          this.handle500Error();
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se é endpoint público (não precisa de autenticação)
   */
  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/auth/login',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];

    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Trata erro 401 (não autorizado)
   */
  private handle401Error(): void {
    // Limpa storage
    this.storage.clearStorage();

    // Mostra mensagem
    this.snackBar.open('Sua sessão expirou. Por favor, faça login novamente.', 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });

    // Redireciona para login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Trata erro 403 (proibido)
   */
  private handle403Error(): void {
    this.snackBar.open('Você não tem permissão para acessar este recurso.', 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Trata erro 500 (erro do servidor)
   */
  private handle500Error(): void {
    this.snackBar.open('Erro no servidor. Tente novamente mais tarde.', 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
