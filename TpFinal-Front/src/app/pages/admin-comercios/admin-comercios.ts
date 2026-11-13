import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { ComercioService } from "../../services/comercioService";
import { UsuarioService } from "../../services/usuarioService";
import { FotoService } from "../../services/fotoService";
import { Comercio } from "../../Models/catalogo";
import { Usuario } from "../../Models/auth";
import { mensajeDeError } from "../../core/http-error";
import { Avatar } from "../../components/avatar/avatar";

@Component({
  imports: [Avatar],
  selector: "app-admin-comercios",
  styleUrl: "./admin-comercios.css",
  templateUrl: "./admin-comercios.html",
})
export class AdminComercios implements OnInit {
  private readonly comercioService = inject(ComercioService);
  private readonly usuarioService = inject(UsuarioService);
  protected readonly fotos = inject(FotoService);

  readonly comercios = signal<Comercio[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly busqueda = signal('');
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly ok = signal('');
  readonly eliminandoId = signal<number | null>(null);

  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) {
      return this.comercios();
    }
    return this.comercios().filter((c) => {
      const duenio = this.propietario(c.usuarioPropietarioId);
      const enDuenio = duenio
        ? `${duenio.nombre} ${duenio.apellido} ${duenio.email}`.toLowerCase().includes(texto)
        : false;
      return (
        c.nombre.toLowerCase().includes(texto) || c.direccion.toLowerCase().includes(texto) || enDuenio
      );
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    forkJoin({
      comercios: this.comercioService.listar(),
      usuarios: this.usuarioService.listar(),
    }).subscribe({
      next: ({ comercios, usuarios }) => {
        this.comercios.set([...comercios].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar los comercios.'));
        this.cargando.set(false);
      },
    });
  }

  propietario(id: number | null): Usuario | undefined {
    return this.usuarios().find((u) => u.idUsuario === id);
  }

  alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  eliminar(comercio: Comercio): void {
    if (!confirm(`¿Eliminar el comercio "${comercio.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.error.set('');
    this.ok.set('');
    this.eliminandoId.set(comercio.idComercio);
    this.comercioService.eliminar(comercio.idComercio).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        this.ok.set(`Comercio "${comercio.nombre}" eliminado.`);
        this.cargar();
      },
      error: (e: unknown) => {
        this.eliminandoId.set(null);
        this.error.set(
          mensajeDeError(
            e,
            `No se pudo eliminar "${comercio.nombre}". Si tiene servicios o turnos cargados, primero hay que borrarlos.`,
          ),
        );
      },
    });
  }
}
