import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataCriacao: string;
  status: string;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nome', 'email', 'telefone', 'dataCriacao', 'status', 'acoes'];
  dataSource!: MatTableDataSource<Cliente>;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor() {
    this.dataSource = new MatTableDataSource<Cliente>([]);
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega lista de clientes
   */
  private loadClientes(): void {
    this.isLoading = true;

    // TODO: Integrar com serviço real
    // this.clienteService.getClientes()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (clientes) => {
    //       this.dataSource.data = clientes;
    //       this.isLoading = false;
    //     },
    //     error: (error) => {
    //       this.isLoading = false;
    //       console.error('Erro ao carregar clientes:', error);
    //     }
    //   });

    // Dados mockados
    setTimeout(() => {
      this.dataSource.data = [
        {
          id: 1,
          nome: 'João Silva',
          email: 'joao@example.com',
          telefone: '(11) 98765-4321',
          cpf: '123.456.789-00',
          dataCriacao: '2024-01-15',
          status: 'Ativo'
        },
        {
          id: 2,
          nome: 'Maria Santos',
          email: 'maria@example.com',
          telefone: '(11) 97654-3210',
          cpf: '987.654.321-00',
          dataCriacao: '2024-02-20',
          status: 'Ativo'
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
   * Editar cliente
   */
  editCliente(cliente: Cliente): void {
    console.log('Editar:', cliente);
    // TODO: Abrir dialog de edição
  }

  /**
   * Deletar cliente
   */
  deleteCliente(cliente: Cliente): void {
    console.log('Deletar:', cliente);
    // TODO: Confirmar e deletar
  }

  /**
   * Ver detalhes do cliente
   */
  viewCliente(cliente: Cliente): void {
    console.log('Ver detalhes:', cliente);
    // TODO: Navegar para página de detalhes
  }
}
