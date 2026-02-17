import { Component } from '@angular/core';

interface Timeline {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {

  timeline: Timeline[] = [
    {
      year: '2014',
      title: 'Formação em Direito',
      description: 'Graduação pela Universidade de São Paulo (USP) com especialização em Direito do Trabalho.'
    },
    {
      year: '2016',
      title: 'Início da Advocacia',
      description: 'Primeiros casos trabalhistas atuando em escritório de grande porte.'
    },
    {
      year: '2018',
      title: 'Especialização TRT',
      description: 'Pós-graduação focada em litígios trabalhistas no Tribunal Regional do Trabalho.'
    },
    {
      year: '2020',
      title: 'Escritório Próprio',
      description: 'Abertura do escritório com foco em atendimento personalizado e uso de tecnologia.'
    },
    {
      year: '2024',
      title: 'Transformação Digital',
      description: 'Lançamento da plataforma digital para acompanhamento de processos em tempo real.'
    }
  ];

}
