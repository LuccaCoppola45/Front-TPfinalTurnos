import { Component, inject, signal } from "@angular/core";
import { NonNullableFormBuilder, Validators } from "@angular/forms";
import { Auth } from "../../services/auth";
import { ComercioService } from "../../services/comercioService";
import { ServicioService } from "../../services/servicioService";
import { Comercio, Servicio } from "../../Models/catalogo";
import { mensajeDeError } from "../../core/http-error";

@Component({
  imports: [],
  selector: "app-comercio-servicios",
  styleUrl: "./comercio-servicios.css",
  templateUrl: "./comercio-servicios.html",
})
export class ComercioServicios {
   private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);
  private readonly comercioService = inject(ComercioService);
  private readonly servicioService = inject(ServicioService);

  readonly comercio = signal<Comercio | null>(null);
  readonly editandoId = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal('');

  readonly form = this.fb.group({
    nombreServicio: ['', Validators.required],
    duracionDelServicio: [30, [Validators.required, Validators.min(5)]],
    precio: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    const idUsuario = this.auth.usuario()?.idUsuario ?? 0;
    this.comercioService.miComercio(idUsuario).subscribe({
      next: (comercio) => {
        this.comercio.set(comercio);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo cargar tu comercio.'));
        this.cargando.set(false);
      },
    });
  }

  editar(servicio: Servicio): void {
    this.editandoId.set(servicio.idServicio);
    this.form.setValue({
      nombreServicio: servicio.nombreServicio,
      duracionDelServicio: servicio.duracionDelServicio,
      precio: servicio.precio,
    });
    this.error.set('');
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset({ nombreServicio: '', duracionDelServicio: 30, precio: 0 });
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
    const datos = { ...this.form.getRawValue(), idComercio: comercio.idComercio };
    const id = this.editandoId();
    const peticion = id === null ? this.servicioService.crear(datos) : this.servicioService.actualizar(id, datos);

    this.enviando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: () => {
        this.enviando.set(false);
        this.cancelarEdicion();
        this.cargar();
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(
          mensajeDeError(e, 'No se pudo guardar el servicio. Puede que ya exista uno con ese nombre.'),
        );
      },
    });
  }

  eliminar(servicio: Servicio): void {
    if (!confirm(`¿Eliminar el servicio "${servicio.nombreServicio}"?`)) {
      return;
    }
    this.error.set('');
    this.servicioService.eliminar(servicio.idServicio).subscribe({
      next: () => this.cargar(),
      error: (e: unknown) =>
        this.error.set(
          mensajeDeError(e, 'No se pudo eliminar. Si el servicio tiene turnos asociados no puede borrarse.'),
        ),
    });
  }
}
