import { Component, computed, input, linkedSignal, output } from '@angular/core';

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
  readonly alt = input('');

  readonly estado = output<boolean>();

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
