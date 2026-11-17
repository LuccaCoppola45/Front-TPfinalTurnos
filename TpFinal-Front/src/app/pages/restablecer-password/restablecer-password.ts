import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { mensajeDeError } from '../../core/http-error';

const passwordsIguales = (grupo: AbstractControl): ValidationErrors | null =>
  grupo.get('nuevaPassword')?.value === grupo.get('repetirPassword')?.value
    ? null
    : { noCoinciden: true };

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-restablecer-password',
  styleUrls: ['../login/login.css', '../olvide-password/olvide-password.css'],
  templateUrl: './restablecer-password.html',
})
export class RestablecerPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  readonly enviando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');

  readonly form = this.fb.group(
    {
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      repetirPassword: ['', [Validators.required]],
    },
    { validators: passwordsIguales },
  );

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');

    this.auth.restablecerPassword(this.token, this.form.getRawValue().nuevaPassword).subscribe({
      next: (respuesta) => {
        this.enviando.set(false);
        this.mensaje.set(respuesta);
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e, 'No se pudo cambiar la contraseña. Pedí un enlace nuevo.'));
      },
    });
  }
}
