import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProcessosComponent } from './pages/processos/processos.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: OverviewComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: 'clientes',
        component: ClientesComponent,
        data: { title: 'Clientes' }
      },
      {
        path: 'processos',
        component: ProcessosComponent,
        data: { title: 'Processos' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
