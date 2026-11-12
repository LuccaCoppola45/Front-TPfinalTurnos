import { Component, computed, inject, input, signal } from '@angular/core';
import { Avatar } from '../avatar/avatar';
import { FORMATOS_FOTO, FotoService, TAMANIO_MAXIMO_FOTO, TipoFoto } from '../../services/fotoService';
import { mensajeDeError } from '../../core/http-error';

/**
 * Foto grande con un botón de cámara para cambiarla y un link para quitarla.
 * Se usa en "Mi perfil" (foto del usuario) y en "Mi comercio" (foto del comercio).
 */
@Component({
  imports: [Avatar],
  selector: 'app-foto-editor',
  template: `
    <div class="marco">
      <app-avatar
        [src]="url()"
        [nombre]="nombre()"
        [tamanio]="88"
        [alt]="textoAlternativo()"
        (estado)="tieneFoto.set($event)"
      />
      <button
        type="button"
        class="btn-camara"
        [disabled]="enviando()"
        [attr.aria-label]="tieneFoto() ? 'Cambiar foto' : 'Subir foto'"
        [title]="tieneFoto() ? 'Cambiar foto' : 'Subir foto'"
        (click)="archivo.click()"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.3l1.2-2h6l1.2 2h1.3A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
          <circle cx="12" cy="12.5" r="3.5" />
        </svg>
      </button>
    </div>

    <!-- El input real queda oculto: lo abre el botón de la cámara -->
    <input
      #archivo
      class="oculto"
      type="file"
      tabindex="-1"
      aria-hidden="true"
      [accept]="formatos"
      (change)="alElegir(archivo)"
    />

    <p class="ayuda">
      @if (enviando()) {
        Guardando foto...
      } @else if (tieneFoto()) {
        <button type="button" class="btn-quitar" (click)="quitar()">Quitar foto</button>
        <span aria-hidden="true">·</span> JPG, PNG o WEBP hasta 2 MB
      } @else {
        Tocá la cámara para subir una foto (JPG, PNG o WEBP hasta 2 MB)
      }
    </p>

    @if (error()) {
      <p class="mensaje error" role="alert">{{ error() }}</p>
    }
    @if (ok()) {
      <p class="mensaje ok" role="status">{{ ok() }}</p>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.55rem;
      text-align: center;
    }

    .marco {
      position: relative;
      border: 4px solid #14161a;
      border-radius: 50%;
      box-shadow: 0 18px 40px -18px rgb(216 179 106 / 70%);
    }

    .btn-camara {
      position: absolute;
      right: -6px;
      bottom: -6px;
      display: grid;
      place-items: center;
      width: 2.1rem;
      height: 2.1rem;
      padding: 0;
      border: 3px solid #14161a;
      border-radius: 50%;
      background: linear-gradient(135deg, #d8b36a, #e8c987);
      color: #14161a;
      cursor: pointer;
      transition: transform 0.16s ease, box-shadow 0.16s ease;
    }

    .btn-camara svg {
      width: 1rem;
      height: 1rem;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linejoin: round;
    }

    .btn-camara:hover:not(:disabled) {
      transform: scale(1.08);
      box-shadow: 0 8px 20px -8px rgb(216 179 106 / 90%);
    }

    .btn-camara:active:not(:disabled) {
      transform: scale(0.96);
    }

    .btn-camara:disabled {
      cursor: wait;
      opacity: 0.7;
    }

    .btn-camara:focus-visible,
    .btn-quitar:focus-visible {
      outline: 2px solid #d8b36a;
      outline-offset: 3px;
    }

    .oculto {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }

    p {
      margin: 0;
    }

    .ayuda {
      color: #cbc4b7;
      font-size: 0.8rem;
    }

    .btn-quitar {
      padding: 0;
      border: none;
      background: none;
      color: #e8c987;
      font: inherit;
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }

    .btn-quitar:hover {
      color: #f9f5ed;
    }

    .mensaje {
      font-size: 0.85rem;
    }

    .error {
      color: #fca5a5;
    }

    .ok {
      color: #bbf7d0;
    }

    @media (prefers-reduced-motion: reduce) {
      .btn-camara {
        transition: none;
      }
    }
  `,
})
export class FotoEditor {
  private readonly fotoService = inject(FotoService);

  readonly tipo = input.required<TipoFoto>();
  readonly id = input.required<number>();
  readonly nombre = input('');

  protected readonly formatos = FORMATOS_FOTO.join(',');

  readonly tieneFoto = signal(false);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');

  readonly url = computed(() => this.fotoService.url(this.tipo(), this.id()));
  readonly textoAlternativo = computed(() =>
    this.tipo() === 'usuario' ? 'Tu foto de perfil' : `Foto de ${this.nombre() || 'tu comercio'}`,
  );

  alElegir(campo: HTMLInputElement): void {
    const archivo = campo.files?.[0];
    campo.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo) {
      return;
    }
    this.error.set('');
    this.ok.set('');

    if (!FORMATOS_FOTO.includes(archivo.type)) {
      this.error.set('Formato no soportado. Elegí una imagen JPG, PNG o WEBP.');
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO_FOTO) {
      this.error.set('La imagen no puede superar los 2 MB.');
      return;
    }

    this.enviando.set(true);
    this.fotoService.subir(this.tipo(), this.id(), archivo).subscribe({
      next: () => {
        this.enviando.set(false);
        this.ok.set('Foto actualizada.');
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e, 'No se pudo subir la foto.'));
      },
    });
  }

  quitar(): void {
    if (!confirm('¿Quitar la foto?')) {
      return;
    }
    this.error.set('');
    this.ok.set('');
    this.enviando.set(true);
    this.fotoService.eliminar(this.tipo(), this.id()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.ok.set('Foto quitada.');
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e, 'No se pudo quitar la foto.'));
      },
    });
  }
}
