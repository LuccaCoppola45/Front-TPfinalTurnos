import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { forkJoin, Observable } from "rxjs";
import { SolicitudService } from "../../services/solicitudService";
import { UsuarioService } from "../../services/usuarioService";
import { SolicitudConversion } from "../../Models/solicitud";
import { Usuario } from "../../Models/auth";
import { mensajeDeError } from "../../core/http-error";

@Component({
  imports: [DatePipe],
  selector: "app-admin-solicitudes",
  styleUrl: "./admin-solicitudes.css",
  templateUrl: "./admin-solicitudes.html",
})
export class AdminSolicitudes implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly usuarioService = inject(UsuarioService);

  readonly solicitudes = signal<SolicitudConversion[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly ok = signal('');
  readonly procesandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    forkJoin({
      solicitudes: this.solicitudService.listaPendientes(),
      usuarios: this.usuarioService.listar(),
    }).subscribe({
      next: ({ solicitudes, usuarios }) => {
        this.solicitudes.set(solicitudes ?? []);
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar las solicitudes.'));
        this.cargando.set(false);
      },
    });
  }

  solicitante(idUsuario: number): Usuario | undefined {
    return this.usuarios().find((u) => u.idUsuario === idUsuario);
  }

  aprobar(solicitud: SolicitudConversion): void {
    if (!confirm(`¿Aprobar "${solicitud.nombreComercioPropuesto}"? El usuario pasará a ser COMERCIO.`)) {
      return;
    }
    this.resolver(solicitud, this.solicitudService.aprobar(solicitud.id), 'Solicitud aprobada.');
  }

  rechazar(solicitud: SolicitudConversion): void {
    if (!confirm(`¿Rechazar la solicitud de "${solicitud.nombreComercioPropuesto}"?`)) {
      return;
    }
    this.resolver(solicitud, this.solicitudService.rechazar(solicitud.id), 'Solicitud rechazada.');
  }

  private resolver(
    solicitud: SolicitudConversion,
    peticion: Observable<SolicitudConversion>,
    mensaje: string,
  ): void {
    this.error.set('');
    this.ok.set('');
    this.procesandoId.set(solicitud.id);
    peticion.subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.ok.set(`${mensaje} (${solicitud.nombreComercioPropuesto})`);
        this.cargar();
      },
      error: (e: unknown) => {
        this.procesandoId.set(null);
        this.error.set(mensajeDeError(e, 'No se pudo procesar la solicitud. Puede que ya esté resuelta.'));
      },
    });
  }
}
