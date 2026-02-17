import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ContactInfo {
  icon: string;
  title: string;
  value: string;
  link?: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit{

  contactForm: FormGroup;
  isSubmitting = false;

  contactInfo: ContactInfo[] = [
    {
      icon: 'phone',
      title: 'Telefone',
      value: '(11) 9XXXX-XXXX',
      link: 'tel:+5511900000000'
    },
    {
      icon: 'email',
      title: 'E-mail',
      value: 'contato@vanessaleme.adv.br',
      link: 'mailto:contato@vanessaleme.adv.br'
    },
    {
      icon: 'location_on',
      title: 'Endereço',
      value: 'Av. Paulista, 1000 - São Paulo/SP',
      link: 'https://maps.google.com'
    },
    {
      icon: 'schedule',
      title: 'Horário de Atendimento',
      value: 'Segunda a Sexta: 9h às 18h'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      assunto: ['', [Validators.required]],
      mensagem: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {}

  // Getters para validação
  get nome() { return this.contactForm.get('nome'); }
  get email() { return this.contactForm.get('email'); }
  get telefone() { return this.contactForm.get('telefone'); }
  get assunto() { return this.contactForm.get('assunto'); }
  get mensagem() { return this.contactForm.get('mensagem'); }

  // Máscara de telefone
  onTelefoneInput(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }

    this.contactForm.patchValue({ telefone: valor }, { emitEvent: false });
  }

  // Submit do formulário
  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSubmitting = true;

    // Simula envio (aqui você integraria com EmailJS ou backend)
    setTimeout(() => {
      this.isSubmitting = false;

      this.snackBar.open('Mensagem enviada com sucesso! Retornaremos em breve.', 'Fechar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });

      this.contactForm.reset();
    }, 2000);
  }

  // Obter mensagem de erro
  getErrorMessage(field: string): string {
    const control = this.contactForm.get(field);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo é obrigatório';
    }

    if (control.errors['email']) {
      return 'E-mail inválido';
    }

    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    }

    if (control.errors['pattern']) {
      return 'Formato inválido. Use: (XX) XXXXX-XXXX';
    }

    return '';
  }

}
