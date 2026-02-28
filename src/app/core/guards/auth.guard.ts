import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Se está autenticado, permite acesso
    if (this.authService.isLoggedIn()) {
      // Se tem roles requeridas, valida
      if (route.data['roles'] && route.data['roles'].length > 0) {
        const userRole = this.authService.getUserRole();

        if (userRole && route.data['roles'].includes(userRole)) {
          return true;
        }

        // Sem permissão, redireciona para dashboard
        this.router.navigate(['/dashboard']);
        return false;
      }

      return true;
    }

    // Não autenticado, redireciona para login
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
