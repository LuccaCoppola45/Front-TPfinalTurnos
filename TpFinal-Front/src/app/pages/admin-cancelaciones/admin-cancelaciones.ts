import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { forkJoin } from "rxjs";
import { CancelacionService } from "../../services/cancelacionService";
import { UsuarioService } from "../../services/usuarioService";
import { TurnoService } from "../../services/turnoService";
import { ComercioService } from "../../services/comercioService";
import { Cancelacion, Turno } from "../../Models/turnos";
import { Usuario } from "../../Models/auth";
import { Comercio } from "../../Models/catalogo";
import { recortarHora } from "../../core/fechas";
import { mensajeDeError } from "../../core/http-error";

interface FilaCancelacion {
  cancelacion: Cancelacion;
  usuario: Usuario | undefined;
  turno: Turno | undefined;
  comercio: string;
  servicio: string;
}

@Component({
  imports: [DatePipe],
  selector: "app-admin-cancelaciones",
  styleUrl: "./admin-cancelaciones.css",
  templateUrl: "./admin-cancelaciones.html",
})
export class AdminCancelaciones implements OnInit {
  private readonly cancelacionService = inject(CancelacionService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly turnoService = inject(TurnoService);
  private readonly comercioService = inject(ComercioService);

  protected readonly recortarHora = recortarHora;

  readonly cancelaciones = signal<Cancelacion[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly turnos = signal<Turno[]>([]);
  readonly comercios = signal<Comercio[]>([]);
  readonly busqueda = signal('');
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly filas = computed<FilaCancelacion[]>(() =>
    this.cancelaciones().map((cancelacion) => {
      const turno = this.turnos().find((t) => t.idTurno === cancelacion.idTurno);
      const comercio = this.comercios().find((c) => c.idComercio === turno?.idComercio);
      const servicio = comercio?.servicios?.find((s) => s.idServicio === turno?.servicioId);
      return {
        cancelacion,
        usuario: this.usuarios().find((u) => u.idUsuario === cancelacion.idUsuario),
        turno,
        comercio: comercio?.nombre ?? '',
        servicio: servicio?.nombreServicio ?? '',
      };
    }),
  );

  readonly filtradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) {
      return this.filas();
    }
    return this.filas().filter((f) =>
      [f.usuario?.nombre, f.usuario?.apellido, f.usuario?.email, f.comercio, f.cancelacion.motivo]
        .join(' ')
        .toLowerCase()
        .includes(texto),
    );
  });

  ngOnInit(): void {
    forkJoin({
      cancelaciones: this.cancelacionService.listar(),
      usuarios: this.usuarioService.listar(),
      turnos: this.turnoService.listar(),
      comercios: this.comercioService.listar(),
    }).subscribe({
      next: ({ cancelaciones, usuarios, turnos, comercios }) => {
        this.cancelaciones.set(
          [...(cancelaciones ?? [])].sort((a, b) => b.fechaCancelacion.localeCompare(a.fechaCancelacion)),
        );
        this.usuarios.set(usuarios);
        this.turnos.set(turnos);
        this.comercios.set(comercios);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar las cancelaciones.'));
        this.cargando.set(false);
      },
    });
  }

  alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }
}
