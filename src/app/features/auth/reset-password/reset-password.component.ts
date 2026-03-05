import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit{
  resetPasswordForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string = '';
  tokenValid = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Captura token da URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';

      if (!this.token) {
        this.tokenValid = false;
        this.snackBar.open(
          'Token inválido ou expirado',
          'Fechar',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });

    this.initForm();
  }

  /**
   * Inicializa formulário
   */
  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador de confirmação de senha
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (!confirmPassword.value) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Submete formulário
   */
  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const newPassword = this.resetPasswordForm.get('newPassword')?.value;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.snackBar.open(
          'Senha redefinida com sucesso!',
          'Fechar',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          }
        );

        // Redireciona para login após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;

        let errorMessage = 'Erro ao redefinir senha. Tente novamente.';

        if (error.status === 400) {
          errorMessage = 'Token inválido ou expirado. Solicite um novo link.';
        } else if (error.status === 404) {
          errorMessage = 'Usuário não encontrado.';
        }

        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
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
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Verifica erro de confirmação de senha
   */
  hasPasswordMismatch(): boolean {
    return this.resetPasswordForm.hasError('passwordMismatch') &&
           this.resetPasswordForm.get('confirmPassword')?.touched || false;
  }
}


