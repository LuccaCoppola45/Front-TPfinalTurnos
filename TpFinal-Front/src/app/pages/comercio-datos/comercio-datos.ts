import { Component, inject, OnInit, signal } from "@angular/core";
import { Auth } from "../../services/auth";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ComercioService } from "../../services/comercioService";
import { CategoriaService } from "../../services/categoriaService";
import { Categoria, Comercio } from "../../Models/catalogo";
import { forkJoin } from "rxjs";
import { mensajeDeError } from "../../core/http-error";

@Component({
  imports: [ReactiveFormsModule],
  selector: "app-comercio-datos",
  styleUrl: "./comercio-datos.css",
  templateUrl: "./comercio-datos.html",
})
export class ComercioDatos implements OnInit{
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);
  private readonly comercioService = inject(ComercioService);
  private readonly categoriaService = inject(CategoriaService);

  readonly comercio = signal<Comercio | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly seleccionadas = signal<number[]>([]);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]+$/)]],
  });

  ngOnInit(): void {
    const idUsuario = this.auth.usuario()?.idUsuario ?? 0;
    forkJoin({
      comercio: this.comercioService.miComercio(idUsuario),
      categorias: this.categoriaService.listar(),
    }).subscribe({
      next: ({ comercio, categorias }) => {
        this.categorias.set(categorias);
        this.comercio.set(comercio);
        if (comercio) {
          this.form.setValue({
            nombre: comercio.nombre,
            direccion: comercio.direccion,
            telefono: comercio.telefono,
          });
          // El backend devuelve los nombres de las categorías; se buscan sus ids
          const nombres = comercio.categorias ?? [];
          this.seleccionadas.set(
            categorias.filter((c) => nombres.includes(c.nombreCategoria)).map((c) => c.uniqueId),
          );
        }
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo cargar tu comercio.'));
        this.cargando.set(false);
      },
    });
  }

  alternarCategoria(id: number): void {
    this.seleccionadas.update((actuales) =>
      actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id],
    );
  }

  guardar(): void {
    const comercio = this.comercio();
    if (!comercio) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.seleccionadas().length === 0) {
      this.error.set('Elegí al menos una categoría.');
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.ok.set('');

    this.comercioService
      .actualizar(comercio.idComercio, {
        ...this.form.getRawValue(),
        listaCategoriasIds: this.seleccionadas(),
      })
      .subscribe({
        next: (actualizado) => {
          this.enviando.set(false);
          this.comercio.set(actualizado);
          this.ok.set('Datos del comercio actualizados.');
        },
        error: (e: unknown) => {
          this.enviando.set(false);
          this.error.set(mensajeDeError(e, 'No se pudieron guardar los cambios.'));
        },
      });
  }
}
