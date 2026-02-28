import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

export interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  message: string;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.auth.login}`.replace('/login', '');

  // Subjects para reatividade
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private sessionCheckInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    if (this.isLoggedIn()) {
      this.startSessionCheck();
    }
  }

  /**
   * Efetua login do usuário
   */
  login(email: string, senha: string, rememberMe: boolean = false): Observable<LoginResponse> {
    const url = `${this.apiUrl}${environment.endpoints.auth.login}`;
    const body = { email, senha };

    return this.http.post<LoginResponse>(url, body).pipe(
      tap(response => {
        this.storage.saveToken(response.accessToken, rememberMe);
        this.storage.saveRefreshToken(response.refreshToken, rememberMe);

        const user: User = {
          id: response.id,
          nome: response.nome,
          email: response.email,
          role: response.role
        };
        this.storage.saveUser(user, rememberMe);

        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(user);

        this.startSessionCheck();
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Efetua logout do usuário
   */
  logout(): Observable<any> {
    const token = this.storage.getToken();
    const url = `${this.apiUrl}${environment.endpoints.auth.logout}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(url, {}, { headers }).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Limpa sessão local
   */
  private clearSession(): void {
    this.storage.clearStorage();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.stopSessionCheck();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Renova sessão (mantém usuário logado)
   */
  renewSession(): Observable<LoginResponse> {
    const token = this.storage.getToken();
    const url = `${this.apiUrl}${environment.endpoints.auth.renewSession}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<LoginResponse>(url, {}, { headers }).pipe(
      tap(response => {
        this.storage.saveToken(response.accessToken, this.storage.isRememberMe());
        if (response.refreshToken) {
          this.storage.saveRefreshToken(response.refreshToken, this.storage.isRememberMe());
        }

        const user: User = {
          id: response.id,
          nome: response.nome,
          email: response.email,
          role: response.role
        };
        this.storage.saveUser(user, this.storage.isRememberMe());
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Erro ao renovar sessão:', error);
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca dados do usuário logado
   */
  getMe(): Observable<User> {
    const token = this.storage.getToken();
    const url = `${this.apiUrl}${environment.endpoints.auth.me}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<User>(url, { headers }).pipe(
      tap(user => {
        this.storage.saveUser(user, this.storage.isRememberMe());
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Erro ao buscar usuário:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica status da sessão
   */
  checkSession(): Observable<any> {
    const token = this.storage.getToken();
    const url = `${this.apiUrl}${environment.endpoints.auth.checkSession}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(url, { headers }).pipe(
      map((response: any) => {
        if (response.status === 'EXPIRING') {
          this.showRenewSessionDialog(response.remainingSeconds);
        }
        return response;
      }),
      catchError(error => {
        console.error('Erro ao verificar sessão:', error);
        if (error.status === 401) {
          this.clearSession();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Inicia verificação periódica de sessão
   */
  private startSessionCheck(): void {
    this.stopSessionCheck();

    this.sessionCheckInterval = setInterval(() => {
      this.checkSession().subscribe();
    }, 30000);
  }

  /**
   * Para verificação de sessão
   */
  private stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Mostra dialog perguntando se deseja renovar sessão
   */
  private showRenewSessionDialog(remainingSeconds: number): void {
    const shouldRenew = confirm(
      `Sua sessão expirará em ${remainingSeconds} segundos. Deseja continuar conectado?`
    );

    if (shouldRenew) {
      this.renewSession().subscribe({
        next: () => {
          console.log('Sessão renovada com sucesso');
        },
        error: (error) => {
          console.error('Erro ao renovar sessão:', error);
        }
      });
    }
  }

  /**
   * Troca senha do usuário logado
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const token = this.storage.getToken();
    const url = `${this.apiUrl}${environment.endpoints.auth.changePassword}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { currentPassword, newPassword };

    return this.http.post(url, body, { headers }).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError(error => {
        console.error('Erro ao trocar senha:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Solicita reset de senha (esqueci senha)
   */
  forgotPassword(email: string): Observable<any> {
    const url = `${this.apiUrl}${environment.endpoints.auth.forgotPassword}`;
    const body = { email };
    return this.http.post(url, body);
  }

  /**
   * Aplica reset de senha com token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    const url = `${this.apiUrl}${environment.endpoints.auth.resetPassword}`;
    const body = { token, newPassword };
    return this.http.post(url, body);
  }

  /**
   * Verifica se usuário está logado
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * Verifica se tem token
   */
  private hasToken(): boolean {
    return !!this.storage.getToken();
  }

  /**
   * Obtém usuário atual do storage
   */
  private getUserFromStorage(): User | null {
    return this.storage.getUser();
  }

  /**
   * Obtém role do usuário
   */
  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  /**
   * Verifica se usuário tem role específica
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Verifica se usuário tem alguma das roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }
}
