import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { switchMap } from 'rxjs';
import { mensajeDeError } from '../../core/http-error';
import { RegistroRequest } from '../../Models/auth';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly enviado = signal(false);

  readonly form = this.fb.group({
    nombre: ['',[Validators.required, Validators.minLength(3)]],
    apellido: ['',[Validators.required, Validators.minLength(3)]],
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]],
  });

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviado.set(true);
    this.error.set('');

    const rawValues = this.form.getRawValue();
    
    const datos: RegistroRequest = {
      nombre: rawValues.nombre ?? '',
      apellido: rawValues.apellido ?? '',
      email: rawValues.email ?? '',
      password: rawValues.password ?? '',
    };

    this.auth.registrar(datos)
    .pipe(switchMap(()=>this.auth.login({email: datos.email, password: datos.password})))
    .subscribe({
      next:()=>this.router.navigate(['/home']),
      error: (e: unknown)=>{
        this.enviado.set(false);
        this.error.set(
          mensajeDeError(e,'No se pudo crear la cuenta.'),
        );
      },
    });
}

}
