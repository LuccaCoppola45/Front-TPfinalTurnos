import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudService } from '../../services/solicitudService';
import { readonly } from '@angular/forms/signals';
import { mensajeDeError } from '../../core/http-error';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-solicitar-comercio',
  styleUrl: './solicitar-comercio.css',
  templateUrl: './solicitar-comercio.html',
})
export class SolicitarComercio {
  private readonly fb = inject(FormBuilder);
  private readonly solicitudService = inject(SolicitudService);

  readonly error = signal('');
  readonly ok = signal('');
  readonly enviado = signal(false);

  readonly form = this.fb.group({
    nombreComercioPropuesto: ['',[Validators.required]],
    direccion: ['',[Validators.required]],
    telefono: ['',[Validators.required, Validators.pattern(/^[0-9+\- ]+$/)]],
    descripcion: ['',[Validators.required, Validators.maxLength(100)]]
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviado.set(true);
    this.error.set('');
    this.ok.set('');

    const rawValues = this.form.getRawValue();

    const datos = {
      nombreComercioPropuesto: rawValues.nombreComercioPropuesto ?? '',
      direccion: rawValues.direccion ?? '',
      telefono: rawValues.telefono ?? '',
      descripcion: rawValues.descripcion ?? '',
    };

    this.solicitudService.crear(datos).subscribe({
      next: () => {
        this.enviado.set(false);
        this.form.reset();  
        this.ok.set('Solicitud enviada, espera a que el administrador apruebe tu solicitud');
      },
      error: (e: unknown) => {
        this.enviado.set(false);
        this.error.set(mensajeDeError(e, 'No se pudo enviar la solicitud. Puede que ya tengas una pendiente'));
      },
    });
  }
}
