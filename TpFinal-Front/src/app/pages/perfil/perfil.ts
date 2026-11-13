import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { UsuarioService } from '../../services/usuarioService';
import { mensajeDeError } from '../../core/http-error';
import { FotoEditor } from '../../components/foto-editor/foto-editor';

@Component({
  imports: [ReactiveFormsModule, FotoEditor],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(Auth);
  private readonly usuarioService = inject(UsuarioService);

  readonly error = signal('');
  readonly ok = signal('');
  readonly enviando = signal(false);

  readonly form = this.fb.group({
    nombre: ['',[Validators.required, Validators.minLength(3)]],
    apellido: ['',[Validators.required, Validators.minLength(3)]],
    email: ['',[Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const usuario = this.auth.usuario();
    if(usuario){
      this.form.setValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
      });
    }
  }

  guardar(): void {
  const usuario = this.auth.usuario();
  if (!usuario) {
    return;
  }
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.enviando.set(true);
  this.error.set('');
  this.ok.set('');

  const rawValues = this.form.getRawValue();

  const datos = {
    nombre: rawValues.nombre ?? '',
    apellido: rawValues.apellido ?? '',
    email: rawValues.email ?? '',
  };

  const cambioElEmail = datos.email.trim().toLowerCase() !== usuario.email.toLowerCase();

  this.usuarioService.actualizar(usuario.idUsuario, datos).subscribe({
    next: (respuesta) => {
      this.enviando.set(false);
      if (cambioElEmail) {
        this.auth.logout();
        return;
      }
      this.auth.usuario.set(respuesta.data);
      this.ok.set('Datos actualizados correctamente.');
    },
    error: (e: unknown) => {
      this.enviando.set(false);
      this.error.set(mensajeDeError(e, 'No se pudieron guardar los cambios.'));
    },
  });
}

}
