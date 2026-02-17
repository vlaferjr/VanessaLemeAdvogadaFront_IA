import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
   isHandset$: Observable<boolean>;

  // Features (serviços/diferenciais)
  features: Feature[] = [
    {
      icon: 'gavel',
      title: 'Direito do Trabalho',
      description: 'Atuação especializada em ações trabalhistas, defesa de direitos e negociações sindicais.'
    },
    {
      icon: 'schedule',
      title: 'Agenda Integrada',
      description: 'Agendamento de compromissos via Google Calendar e notificações por Telegram.'
    },
    {
      icon: 'update',
      title: 'Atualizações em Tempo Real',
      description: 'Acompanhe seus processos com integração automática ao sistema do TRT.'
    },
    {
      icon: 'shield',
      title: 'Segurança de Dados',
      description: 'Plataforma segura com autenticação JWT e controle de acesso por perfis.'
    },
    {
      icon: 'support_agent',
      title: 'Atendimento Personalizado',
      description: 'Consultoria jurídica focada nas necessidades específicas de cada cliente.'
    },
    {
      icon: 'description',
      title: 'Gestão Documental',
      description: 'Controle e organização de documentos e petições de forma digital e centralizada.'
    }
  ];

  // Depoimentos
  testimonials: Testimonial[] = [
    {
      name: 'João Silva',
      role: 'Cliente',
      content: 'Excelente atendimento e acompanhamento do meu processo. Sempre atualizada e atenta aos detalhes.',
      rating: 5
    },
    {
      name: 'Maria Santos',
      role: 'Empresária',
      content: 'Profissional dedicada que resolveu questões trabalhistas da minha empresa com eficiência.',
      rating: 5
    },
    {
      name: 'Carlos Oliveira',
      role: 'Cliente',
      content: 'Conquistei meus direitos graças ao trabalho competente da Dra. Vanessa. Recomendo!',
      rating: 5
    }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    // Detecta se é mobile
    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {}

  // Retorna array para loop de estrelas
  getStars(rating: number): number[] {
    return Array(rating).fill(0).map((x, i) => i);
  }

}
