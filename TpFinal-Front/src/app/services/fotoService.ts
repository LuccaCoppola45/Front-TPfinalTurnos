import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../core/api';

export type TipoFoto = 'usuario' | 'comercio';

/** Tamaño máximo que acepta el backend (spring.servlet.multipart.max-file-size). */
export const TAMANIO_MAXIMO_FOTO = 2 * 1024 * 1024;
export const FORMATOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];

const RUTAS: Record<TipoFoto, string> = {
  usuario: `${API_URL}/usuarios`,
  comercio: `${API_URL}/api/comercios`,
};

@Service()
export class FotoService {
  private readonly http = inject(HttpClient);

  /**
   * Cada vez que se sube o borra una foto se cambia su "versión", así todas las
   * <img> que la muestran (por ejemplo la del menú) se vuelven a pedir al backend.
   */
  private readonly versiones = signal<Record<string, number>>({});

  url(tipo: TipoFoto, id: number): string {
    const version = this.versiones()[`${tipo}-${id}`];
    return `${RUTAS[tipo]}/${id}/foto${version ? `?v=${version}` : ''}`;
  }

  subir(tipo: TipoFoto, id: number, archivo: File): Observable<void> {
    const datos = new FormData();
    datos.append('foto', archivo);
    return this.http
      .put<void>(`${RUTAS[tipo]}/${id}/foto`, datos)
      .pipe(tap(() => this.marcarCambio(tipo, id)));
  }

  eliminar(tipo: TipoFoto, id: number): Observable<void> {
    return this.http
      .delete<void>(`${RUTAS[tipo]}/${id}/foto`)
      .pipe(tap(() => this.marcarCambio(tipo, id)));
  }

  private marcarCambio(tipo: TipoFoto, id: number): void {
    this.versiones.update((v) => ({ ...v, [`${tipo}-${id}`]: Date.now() }));
  }
}
