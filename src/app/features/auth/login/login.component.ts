import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Se já estiver logado, redireciona
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Obtém URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Getters para validação
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  /**
   * Submit do formulário
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, rememberMe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });

          // Aguarda um pouco antes de redirecionar
          setTimeout(() => {
            this.router.navigateByUrl(this.returnUrl);
          }, 500);
        },
        error: (error) => {
          this.isLoading = false;

          let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            errorMessage = Object.values(error.error.errors).join(', ');
          } else if (error.status === 0) {
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          } else if (error.status === 401) {
            errorMessage = 'Email ou senha incorretos.';
          } else if (error.status === 403) {
            errorMessage = 'Acesso negado. Você não tem permissão para acessar.';
          } else if (error.status === 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          }

          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });

          console.error('Erro ao fazer login:', error);
        }
      });
  }

  /**
   * Obter mensagem de erro
   */
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo é obrigatório';
    }

    if (control.errors['email']) {
      return 'E-mail inválido';
    }

    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    }

    return '';
  }

  /**
   * Toggle senha
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
