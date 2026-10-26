import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { email } from '@angular/forms/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from '../../core/http-error';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private readonly fb = inject(NonNullableFormBuilder)
  private readonly auth = inject(Auth)
  private readonly router = inject(Router)


  readonly error = signal('');
  readonly enviado = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })


  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviado.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (e: unknown) => {
        this.enviado.set(false);
        // Spring responde 403 vacío cuando las credenciales son incorrectas
        const credenciales =
          e instanceof HttpErrorResponse && (e.status === 401 || e.status === 403);
        this.error.set(credenciales ? 'Email o contraseña incorrectos.' : mensajeDeError(e));
      },
    });
  }
}
