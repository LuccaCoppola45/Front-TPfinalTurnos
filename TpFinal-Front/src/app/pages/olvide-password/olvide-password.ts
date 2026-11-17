import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { mensajeDeError } from '../../core/http-error';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-olvide-password',
  styleUrls: ['../login/login.css', './olvide-password.css'],
  templateUrl: './olvide-password.html',
})
export class OlvidePassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);

  readonly enviando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');

    this.auth.solicitarRecuperacion(this.form.getRawValue().email).subscribe({
      next: (respuesta) => {
        this.enviando.set(false);
        this.mensaje.set(respuesta);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }
}
