import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { mensajeDeError } from "../../core/http-error";
import { Auth } from "../../services/auth";
import { ComercioService } from "../../services/comercioService";
import { TurnoService } from "../../services/turnoService";
import { UsuarioService } from "../../services/usuarioService";
import { Comercio } from "../../Models/catalogo";
import { Turno } from "../../Models/turnos";
import { Usuario } from "../../Models/auth";
import { recortarHora } from "../../core/fechas";
import { DatePipe } from "@angular/common";

@Component({
  imports: [DatePipe],
  selector: "app-comercio-agenda",
  styleUrl: "./comercio-agenda.css",
  templateUrl: "./comercio-agenda.html",
})
export class ComercioAgenda implements OnInit{
   private readonly auth = inject(Auth);
  private readonly comercioService = inject(ComercioService);
  private readonly turnoService = inject(TurnoService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly recortarHora = recortarHora;

  readonly comercio = signal<Comercio | null>(null);
  readonly turnos = signal<Turno[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly filas = computed<FilaAgenda[]>(() => {
    const comercio = this.comercio();
    if (!comercio) {
      return [];
    }
    return this.turnos()
      .filter((t) => t.idComercio === comercio.idComercio)
      .sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio))
      .map((turno) => {
        const cliente = this.usuarios().find((u) => u.idUsuario === turno.usuarioId);
        const servicio = comercio.servicios?.find((s) => s.idServicio === turno.servicioId);
        return {
          turno,
          cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : `Usuario #${turno.usuarioId}`,
          servicio: servicio?.nombreServicio ?? 'Servicio',
        };
      });
  });

  ngOnInit(): void {
    const idUsuario = this.auth.usuario()?.idUsuario ?? 0;
    forkJoin({
      comercio: this.comercioService.miComercio(idUsuario),
      turnos: this.turnoService.listar(),
      usuarios: this.usuarioService.listar(),
    }).subscribe({
      next: ({ comercio, turnos, usuarios }) => {
        this.comercio.set(comercio);
        this.turnos.set(turnos);
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo cargar la agenda.'));
        this.cargando.set(false);
      },
    });
  }
}
