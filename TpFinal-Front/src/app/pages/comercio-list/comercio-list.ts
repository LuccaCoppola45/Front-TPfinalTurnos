import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComercioService } from '../../services/comercioService';
import { Comercio } from '../../Models/catalogo';
import { mensajeDeError } from '../../core/http-error';
import { FotoService } from '../../services/fotoService';
import { Avatar } from '../../components/avatar/avatar';

@Component({
  imports: [RouterLink, CurrencyPipe, Avatar],
  selector: 'app-comercio-list',
  styleUrl: './comercio-list.css',
  templateUrl: './comercio-list.html',
})
export class ComercioList implements OnInit {
  private readonly comercioService = inject(ComercioService);
  protected readonly fotos = inject(FotoService);

  readonly comercios = signal<Comercio[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly busqueda = signal('');
  readonly categoriaElegida = signal<string | null>(null);

  readonly categorias = computed(() => {
    const todas = this.comercios().flatMap((c) => c.categorias ?? []);
    return [...new Set(todas)].sort();
  });

  readonly comerciosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const categoria = this.categoriaElegida();

    return this.comercios().filter((c) => {
      const coincideTexto =
        !texto ||
        c.nombre.toLowerCase().includes(texto) ||
        c.direccion.toLowerCase().includes(texto);
      const coincideCategoria = !categoria || (c.categorias ?? []).includes(categoria);
      return coincideTexto && coincideCategoria;
    });
  });

  ngOnInit(): void {
    this.comercioService.listar().subscribe({
      next: (lista) => {
        this.comercios.set(lista);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar los comercios.'));
        this.cargando.set(false);
      },
    });
  }

  alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  elegirCategoria(categoria: string | null): void {
    this.categoriaElegida.set(this.categoriaElegida() === categoria ? null : categoria);
  }

  precioDesde(comercio: Comercio): number {
    return Math.min(...(comercio.servicios ?? []).map((s) => s.precio));
  }
}
