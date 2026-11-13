import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { mensajeDeError } from "../../core/http-error";
import { Auth } from "../../services/auth";
import { ComercioService } from "../../services/comercioService";
import { TurnoService } from "../../services/turnoService";
import { UsuarioService } from "../../services/usuarioService";
import { CancelacionService } from "../../services/cancelacionService";
import { Comercio } from "../../Models/catalogo";
import { Turno } from "../../Models/turnos";
import { Usuario } from "../../Models/auth";
import { recortarHora } from "../../core/fechas";
import { DatePipe } from "@angular/common";

interface FilaAgenda {
  turno: Turno;
  cliente: string;
  servicio: string;
}

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
  private readonly cancelacionService = inject(CancelacionService);

  protected readonly recortarHora = recortarHora;

  readonly comercio = signal<Comercio | null>(null);
  readonly turnos = signal<Turno[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  /** Error al cargar la agenda (reemplaza la tabla) */
  readonly error = signal('');
  /** Resultado de cancelar un turno (se muestra arriba de la tabla) */
  readonly errorAccion = signal('');
  readonly ok = signal('');
  /** Id del turno que se está cancelando (para deshabilitar su botón) */
  readonly cancelandoId = signal<number | null>(null);

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
    this.cargar();
  }

  /** RF-19: el comercio puede cancelar un turno que todavía no pasó ni terminó. */
  puedeCancelar(turno: Turno): boolean {
    const activo = turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADO' || turno.estado === 'RESERVADO';
    const inicio = new Date(`${turno.fecha}T${turno.horaInicio}`);
    return activo && inicio > new Date();
  }

  cancelar(fila: FilaAgenda): void {
    const idUsuario = this.auth.usuario()?.idUsuario;
    if (!idUsuario) {
      return;
    }
    // El motivo le llega al cliente por mail (el backend pide entre 10 y 500 caracteres)
    const motivo = prompt(
      `Vas a cancelar el turno de ${fila.cliente}. ¿Por qué? (le llega por mail)`,
      'El comercio no puede atender en ese horario.',
    );
    if (motivo === null) {
      return; // tocó "Cancelar" en el cuadro
    }
    if (motivo.trim().length < 10) {
      this.errorAccion.set('El motivo tiene que tener al menos 10 caracteres.');
      return;
    }

    this.errorAccion.set('');
    this.ok.set('');
    this.cancelandoId.set(fila.turno.idTurno);
    this.cancelacionService
      .cancelarTurno({ idTurno: fila.turno.idTurno, idUsuario, motivo: motivo.trim() })
      .subscribe({
        next: () => {
          this.cancelandoId.set(null);
          this.ok.set(`Turno de ${fila.cliente} cancelado. Le avisamos por mail.`);
          this.cargar();
        },
        error: (e: unknown) => {
          this.cancelandoId.set(null);
          this.errorAccion.set(mensajeDeError(e, 'No se pudo cancelar el turno.'));
        },
      });
  }

  private cargar(): void {
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
