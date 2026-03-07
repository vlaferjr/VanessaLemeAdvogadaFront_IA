import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { AuthService, User } from 'src/app/core/services/auth.service';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isHandset$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  isDashboardRoute$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  mobileMenuOpen = false;
  isLoading = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private layoutService: LayoutService
  ) {
    // Detecta se e dispositivo movel
    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );

    // Observa estado de autenticacao
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    // Observa usuario logado
    this.currentUser$ = this.authService.currentUser$;

    // Verifica se esta em rota do dashboard
    this.isDashboardRoute$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/dashboard')),
      startWith(this.router.url.startsWith('/dashboard')),
      shareReplay(1)
    );
  }

  ngOnInit(): void {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleDashboardSidenav(): void {
    this.layoutService.requestSidenavToggle();
  }

  logout(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.authService.logout().subscribe({
      next: () => {
        this.isLoading = false;
        this.closeMobileMenu();

        this.snackBar.open('Logout realizado com sucesso!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.closeMobileMenu();

        this.snackBar.open('Erro ao fazer logout', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });

        console.error('Erro no logout:', error);
      }
    });
  }
}

