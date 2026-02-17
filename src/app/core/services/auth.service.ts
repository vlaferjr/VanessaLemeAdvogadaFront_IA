import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  // Subject para controlar estado de autenticação
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Subject para dados do usuário
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Timer para verificar expiração da sessão
  private sessionCheckInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    // Inicia verificação de sessão se já estiver logado
    if (this.isLoggedIn()) {
      this.startSessionCheck();
    }
  }

  /**
   * Efetua login do usuário
   */
  login(email: string, senha: string, rememberMe: boolean = false): Observable<LoginResponse> {
    const body = { email, senha };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body).pipe(
      tap(response => {
        // Salva tokens e dados do usuário
        this.storage.saveToken(response.accessToken, rememberMe);
        this.storage.saveRefreshToken(response.refreshToken, rememberMe);

        const user: User = {
          id: response.id,
          nome: response.nome,
          email: response.email,
          role: response.role
        };
        this.storage.saveUser(user, rememberMe);

        // Atualiza subjects
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(user);

        // Inicia verificação de sessão
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError(error => {
        // Mesmo com erro, limpa sessão local
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<LoginResponse>(`${this.apiUrl}/renew-session`, {}, { headers }).pipe(
      tap(response => {
        // Atualiza tokens
        this.storage.saveToken(response.accessToken, this.storage.isRememberMe());
        if (response.refreshToken) {
          this.storage.saveRefreshToken(response.refreshToken, this.storage.isRememberMe());
        }

        // Atualiza usuário
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/check-session`, { headers }).pipe(
      map((response: any) => {
        // Se sessão está expirando, mostra modal de renovação
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
   * Inicia verificação periódica de sessão (a cada 30 segundos)
   */
  private startSessionCheck(): void {
    // Limpa qualquer interval anterior
    this.stopSessionCheck();

    // Verifica a cada 30 segundos
    this.sessionCheckInterval = setInterval(() => {
      this.checkSession().subscribe();
    }, 30000); // 30 segundos
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
   * (você pode implementar com MatDialog depois)
   */
  private showRenewSessionDialog(remainingSeconds: number): void {
    // TODO: Implementar com MatDialog
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { currentPassword, newPassword };

    return this.http.post(`${this.apiUrl}/change-password`, body, { headers }).pipe(
      tap(() => {
        // Após trocar senha, faz logout para segurança
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
    const body = { email };
    return this.http.post(`${this.apiUrl}/forgot-password`, body);
  }

  /**
   * Aplica reset de senha com token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    const body = { token, newPassword };
    return this.http.post(`${this.apiUrl}/reset-password`, body);
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
