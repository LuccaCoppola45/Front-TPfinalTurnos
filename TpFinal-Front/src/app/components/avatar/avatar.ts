import { Component, computed, input, linkedSignal, output } from '@angular/core';

/**
 * Muestra una foto (de usuario o de comercio). Si no hay foto cargada
 * (el backend responde 404) muestra las iniciales del nombre.
 *
 * Los colores y la forma se pueden cambiar desde la página que lo usa:
 *   app-avatar { --avatar-radio: 0.9rem; --avatar-fondo: ...; --avatar-texto: ...; }
 */
@Component({
  selector: 'app-avatar',
  template: `
    @if (!sinFoto()) {
      <img
        [src]="src()"
        [alt]="alt()"
        [width]="tamanio()"
        [height]="tamanio()"
        (load)="estado.emit(true)"
        (error)="alFallar()"
      />
    } @else if (alt()) {
      <span class="iniciales" role="img" [attr.aria-label]="alt()">{{ iniciales() }}</span>
    } @else {
      <span class="iniciales" aria-hidden="true">{{ iniciales() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--tam);
      height: var(--tam);
    }

    img,
    .iniciales {
      width: 100%;
      height: 100%;
      border-radius: var(--avatar-radio, 50%);
    }

    img {
      object-fit: cover;
      /* borde sutil para que una foto clara no se "pierda" contra el fondo */
      outline: 1px solid rgb(245 241 232 / 12%);
      outline-offset: -1px;
    }

    .iniciales {
      display: grid;
      place-items: center;
      background: var(--avatar-fondo, linear-gradient(135deg, #d8b36a, #e8c987));
      color: var(--avatar-texto, #14161a);
      font-size: calc(var(--tam) * 0.4);
      font-weight: 700;
      letter-spacing: 0.02em;
      user-select: none;
    }
  `,
  host: { '[style.--tam.px]': 'tamanio()' },
})
export class Avatar {
  readonly src = input.required<string>();
  readonly nombre = input('');
  readonly tamanio = input(40);
  /** Texto alternativo. Vacío cuando el nombre ya aparece al lado (la imagen es decorativa). */
  readonly alt = input('');

  /** Avisa si la foto existe (true) o no (false). */
  readonly estado = output<boolean>();

  /** Vuelve a false cada vez que cambia la URL (por ejemplo, después de subir una foto nueva). */
  readonly sinFoto = linkedSignal({ source: this.src, computation: () => false });

  readonly iniciales = computed(() =>
    this.nombre()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join(''),
  );

  alFallar(): void {
    this.sinFoto.set(true);
    this.estado.emit(false);
  }
}
