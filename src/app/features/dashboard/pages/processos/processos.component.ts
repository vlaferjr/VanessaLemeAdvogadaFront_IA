import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Processo {
  id: number;
  numero: string;
  cliente: string;
  descricao: string;
  status: string;
  dataCriacao: string;
  tribunal: string;
}

@Component({
  selector: 'app-processos',
  templateUrl: './processos.component.html',
  styleUrls: ['./processos.component.scss']
})
export class ProcessosComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['numero', 'cliente', 'status', 'tribunal', 'dataCriacao', 'acoes'];
  dataSource!: MatTableDataSource<Processo>;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor() {
    this.dataSource = new MatTableDataSource<Processo>([]);
  }

  ngOnInit(): void {
    this.loadProcessos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega lista de processos
   */
  private loadProcessos(): void {
    this.isLoading = true;

    // TODO: Integrar com serviço real
    // this.processoService.getProcessos()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({...});

    // Dados mockados
    setTimeout(() => {
      this.dataSource.data = [
        {
          id: 1,
          numero: '0001234-56.2024.8.26.0100',
          cliente: 'João Silva',
          descricao: 'Ação Trabalhista - Rescisão Contratual',
          status: 'Em Andamento',
          dataCriacao: '2024-01-15',
          tribunal: 'TRT 2ª Região'
        },
        {
          id: 2,
          numero: '0001235-56.2024.8.26.0100',
          cliente: 'Maria Santos',
          descricao: 'Ação Trabalhista - Horas Extras',
          status: 'Sentenciado',
          dataCriacao: '2024-02-20',
          tribunal: 'TRT 2ª Região'
        }
      ];
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.isLoading = false;
    }, 500);
  }

  /**
   * Filtrar tabela
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Ver detalhes do processo
   */
  viewProcesso(processo: Processo): void {
    console.log('Ver detalhes:', processo);
    // TODO: Navegar para página de detalhes
  }

  /**
   * Editar processo
   */
  editProcesso(processo: Processo): void {
    console.log('Editar:', processo);
    // TODO: Abrir dialog de edição
  }

  /**
   * Deletar processo
   */
  deleteProcesso(processo: Processo): void {
    console.log('Deletar:', processo);
    // TODO: Confirmar e deletar
  }

  /**
   * Retornar status com cor
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'Em Andamento':
        return 'primary';
      case 'Sentenciado':
        return 'accent';
      case 'Encerrado':
        return '';
      default:
        return '';
    }
  }
}
