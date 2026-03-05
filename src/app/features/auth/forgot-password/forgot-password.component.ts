import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit{
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa formulário
   */
  private initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
        ]
      ]
    });
  }

  /**
   * Submete formulário
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.emailSent = true;

        this.snackBar.open(
          'Email enviado! Verifique sua caixa de entrada.',
          'Fechar',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        this.isLoading = false;

        let errorMessage = 'Erro ao enviar email. Tente novamente.';

        if (error.status === 404) {
          errorMessage = 'Email não encontrado no sistema.';
        } else if (error.status === 429) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
        }

        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Volta para login
   */
  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica se campo tem erro
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

}
