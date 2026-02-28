import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardStats {
  totalClientes: number;
  totalProcessos: number;
  processosAbertos: number;
  processosEncerrados: number;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  isLoading = true;
  stats: DashboardStats = {
    totalClientes: 0,
    totalProcessos: 0,
    processosAbertos: 0,
    processosEncerrados: 0
  };

  private destroy$ = new Subject<void>();

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega estatísticas do dashboard
   */
  private loadStats(): void {
    this.isLoading = true;

    // TODO: Integrar com serviço real de estatísticas
    // this.dashboardService.getStats()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (stats) => {
    //       this.stats = stats;
    //       this.isLoading = false;
    //     },
    //     error: (error) => {
    //       this.isLoading = false;
    //       console.error('Erro ao carregar estatísticas:', error);
    //     }
    //   });

    // Dados mockados para teste
    setTimeout(() => {
      this.stats = {
        totalClientes: 12,
        totalProcessos: 24,
        processosAbertos: 18,
        processosEncerrados: 6
      };
      this.isLoading = false;
    }, 500);
  }
}
