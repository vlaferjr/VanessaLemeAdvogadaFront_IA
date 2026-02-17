import { Injectable } from '@angular/core';


interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

   private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly REMEMBER_ME_KEY = 'remember_me';

  constructor() {}

  /**
   * Salva token de acesso
   */
  saveToken(token: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);

    if (rememberMe) {
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
    }
  }

  /**
   * Obtém token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Salva refresh token
   */
  saveRefreshToken(token: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Obtém refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
           sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Salva dados do usuário
   */
  saveUser(user: User, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtém dados do usuário
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY) ||
                    sessionStorage.getItem(this.USER_KEY);

    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error);
      return null;
    }
  }

  /**
   * Verifica se está com "lembrar-me" ativo
   */
  isRememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
  }

  /**
   * Limpa todo o storage
   */
  clearStorage(): void {
    // Limpa localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);

    // Limpa sessionStorage
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }
}
