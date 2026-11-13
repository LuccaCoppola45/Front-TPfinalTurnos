import { Component, ElementRef, inject, OnInit, signal, viewChild } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CategoriaService } from "../../services/categoriaService";
import { Categoria } from "../../Models/catalogo";
import { mensajeDeError } from "../../core/http-error";

@Component({
  imports: [ReactiveFormsModule],
  selector: "app-admin-categorias",
  styleUrl: "./admin-categorias.css",
  templateUrl: "./admin-categorias.html",
})
export class AdminCategorias implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly categoriaService = inject(CategoriaService);

  private readonly campoNombre = viewChild<ElementRef<HTMLInputElement>>('campoNombre');

  readonly categorias = signal<Categoria[]>([]);
  readonly editandoId = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');

  readonly form = this.fb.group({
    nombreCategoria: [
      '',
      [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)],
    ],
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.categoriaService.listar().subscribe({
      next: (lista) => {
        this.categorias.set(
          [...(lista ?? [])].sort((a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria)),
        );
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar las categorías.'));
        this.cargando.set(false);
      },
    });
  }

  editar(categoria: Categoria): void {
    this.editandoId.set(categoria.uniqueId);
    this.form.setValue({ nombreCategoria: categoria.nombreCategoria });
    this.error.set('');
    this.ok.set('');
    this.campoNombre()?.nativeElement.focus();
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = { nombreCategoria: this.form.getRawValue().nombreCategoria.trim() };
    const id = this.editandoId();
    const peticion =
      id === null ? this.categoriaService.crear(datos) : this.categoriaService.actualizar(id, datos);

    this.enviando.set(true);
    this.error.set('');
    this.ok.set('');
    peticion.subscribe({
      next: () => {
        this.enviando.set(false);
        this.ok.set(id === null ? `Categoría "${datos.nombreCategoria}" creada.` : 'Categoría actualizada.');
        this.cancelarEdicion();
        this.cargar();
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e, 'No se pudo guardar la categoría. Puede que ya exista una con ese nombre.'));
      },
    });
  }

  eliminar(categoria: Categoria): void {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombreCategoria}"?`)) {
      return;
    }
    this.error.set('');
    this.ok.set('');
    this.categoriaService.eliminar(categoria.uniqueId).subscribe({
      next: () => {
        this.ok.set(`Categoría "${categoria.nombreCategoria}" eliminada.`);
        if (this.editandoId() === categoria.uniqueId) {
          this.cancelarEdicion();
        }
        this.cargar();
      },
      error: (e: unknown) => this.error.set(mensajeDeError(e, 'No se pudo eliminar la categoría.')),
    });
  }
}
