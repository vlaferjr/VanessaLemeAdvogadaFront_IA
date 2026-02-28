import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from 'src/app/core/services/contact.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class ContactComponent implements OnInit, OnDestroy {

  contactForm: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  contactInfo: ContactInfo[] = [
    {
      icon: 'whatsapp',
      title: 'WhatsApp',
      value: '(11) 98204-5906',
      link: 'https://wa.me/5511982045906?text=Ol%C3%A1%20tudo%20bem%3F%20Gostaria%20de%20tirar%20mais%20d%C3%BAvidas%20sobre%20o%20seu%20trabalho'
    },
    {
      icon: 'email',
      title: 'E-mail',
      value: 'advanessaferrari@gmail.com',
      link: 'mailto:advanessaferrari@gmail.com?subject=Ol%C3%A1%20Vanessa%2C%20vi%20seu%20portal%20e%20gostaria%20de%20tirar%20mais%20d%C3%BAvidas&body=Ol%C3%A1%20Vanessa%2C%20tudo%20bem%3F%0D%0AMinha%20d%C3%BAvida%20%C3%A9%20a%20seguinte'
    },
    {
      icon: 'location_on',
      title: 'Endereço',
      value: 'Centro - Guarulhos/SP',
      link: 'https://www.google.com/maps/search/?api=1&query=F%C3%B3rum%20Trabalhista%20de%20Guarulhos'
    },
    {
      icon: 'schedule',
      title: 'Horário de Atendimento',
      value: 'Segunda a Sexta: 9h às 18h'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^(\(?\d{2}\)?)\s?9?\d{4}-?\d{4}$/)]],
      assunto: ['', [Validators.required]],
      mensagem: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Getters para validação
  get nome() { return this.contactForm.get('nome'); }
  get email() { return this.contactForm.get('email'); }
  get telefone() { return this.contactForm.get('telefone'); }
  get assunto() { return this.contactForm.get('assunto'); }
  get mensagem() { return this.contactForm.get('mensagem'); }

  /**
   * Máscara de telefone
   */
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

  /**
   * Submit do formulário
   */
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
    const dados = this.contactForm.value;

    // Remove máscara do telefone para enviar ao backend
    dados.telefone = dados.telefone.replace(/\D/g, '');

    this.contactService.enviarContato(dados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;

          this.snackBar.open('Mensagem enviada com sucesso! Retornaremos em breve.', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });

          this.contactForm.reset();
        },
        error: (error) => {
          this.isSubmitting = false;

          let errorMessage = 'Erro ao enviar mensagem. Tente novamente.';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            errorMessage = Object.values(error.error.errors).join(', ');
          } else if (error.status === 0) {
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          } else if (error.status === 400) {
            errorMessage = 'Dados inválidos. Verifique o formulário.';
          } else if (error.status === 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          }

          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });

          console.error('Erro ao enviar contato:', error);
        }
      });
  }

  /**
   * Obter mensagem de erro
   */
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
      return 'Formato inválido. Use: (XX) 9XXXX-XXXX';
    }

    return '';
  }
}
