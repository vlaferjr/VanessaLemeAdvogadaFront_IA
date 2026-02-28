import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface ContatoRequest {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

export interface ContatoResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
  dataCriacao: string;
  status: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }

    /**
   * Envia formulário de contato
   */
  enviarContato(dados: ContatoRequest): Observable<ContatoResponse> {
    const url = `${environment.apiUrl}${environment.endpoints.contato.enviar}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ContatoResponse>(url, dados, { headers }).pipe(
      catchError(error => {
        console.error('Erro ao enviar contato:', error);
        return throwError(() => error);
      })
    );
  }
}
