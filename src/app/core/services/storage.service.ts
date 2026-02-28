import { Injectable } from '@angular/core';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_data';
  private rememberMeKey = 'remember_me';

  constructor() { }

  /**
   * Salva token de acesso
   */
  saveToken(token: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);
    localStorage.setItem(this.rememberMeKey, rememberMe.toString());
  }

  /**
   * Obtém token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Remove token de acesso
   */
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  /**
   * Salva refresh token
   */
  saveRefreshToken(token: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.refreshTokenKey, token);
  }

  /**
   * Obtém refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey) || sessionStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken(): void {
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Salva dados do usuário
   */
  saveUser(user: User, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Obtém dados do usuário
   */
  getUser(): User | null {
    const user = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Remove dados do usuário
   */
  removeUser(): void {
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
  }

  /**
   * Limpa todo armazenamento
   */
  clearStorage(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    localStorage.removeItem(this.rememberMeKey);
  }

  /**
   * Verifica se "Lembrar me" está ativo
   */
  isRememberMe(): boolean {
    return localStorage.getItem(this.rememberMeKey) === 'true';
  }
}
