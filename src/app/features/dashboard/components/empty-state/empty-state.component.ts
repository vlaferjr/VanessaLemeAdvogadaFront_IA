import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nenhum dado disponível';
  @Input() message = 'Não há registros para exibir no momento.';
  @Input() actionLabel: string | null = null;
  @Input() actionIcon: string | null = null;

  constructor() { }
}
