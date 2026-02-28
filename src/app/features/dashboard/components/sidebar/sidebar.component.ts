import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
  requiredRoles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Output() navigated = new EventEmitter<void>();

  menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeMenu();
  }

  /**
   * Inicializa menu conforme role do usuário
   */
  private initializeMenu(): void {
    const userRole = this.authService.getUserRole();

    const baseMenu: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard'
      }
    ];

    // Menu para ADVOGADA
    if (userRole === 'ADVOGADA' || userRole === 'ADMIN') {
      baseMenu.push(
        {
          label: 'Clientes',
          icon: 'people',
          route: '/dashboard/clientes'
        },
        {
          label: 'Processos',
          icon: 'description',
          route: '/dashboard/processos'
        },
        {
          label: 'Agenda',
          icon: 'calendar_today',
          route: '/dashboard/agenda'
        },
        {
          label: 'Usuários',
          icon: 'admin_panel_settings',
          route: '/dashboard/usuarios',
          requiredRoles: ['ADVOGADA', 'ADMIN']
        }
      );
    }

    // Menu para CLIENTE
    if (userRole === 'CLIENTE') {
      baseMenu.push(
        {
          label: 'Meus Processos',
          icon: 'description',
          route: '/dashboard/processos'
        },
        {
          label: 'Atualizações',
          icon: 'notifications',
          route: '/dashboard/atualizacoes'
        }
      );
    }

    this.menuItems = baseMenu;
  }

  /**
   * Navega para rota
   */
  navigate(route: string): void {
    this.router.navigate([route]);
    this.navigated.emit();
  }

  /**
   * Verifica se item deve ser exibido
   */
  canShowItem(item: MenuItem): boolean {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }

    return this.authService.hasAnyRole(item.requiredRoles);
  }
}
