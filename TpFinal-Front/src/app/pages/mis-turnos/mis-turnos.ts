import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Auth } from '../../services/auth';
import { TurnoService } from '../../services/turnoService';
import { ComercioService } from '../../services/comercioService';
import { CancelacionService } from '../../services/cancelacionService';
import { Turno } from '../../Models/turnos';
import { mensajeDeError } from '../../core/http-error';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-mis-turnos',
  styleUrl: './mis-turnos.css',
  templateUrl: './mis-turnos.html',
})
export class MisTurnos implements OnInit {
  private readonly auth = inject(Auth);
  private readonly turnoService = inject(TurnoService);
  private readonly comercioService = inject(ComercioService);
  private readonly cancelacionService = inject(CancelacionService);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  // idComercio -> nombre, para mostrar "Barbería X" en vez de un número
  private nombresComercios = new Map<number, string>();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const idUsuario = this.auth.usuario()?.idUsuario;
    this.cargando.set(true);

    forkJoin({
      turnos: this.turnoService.listar(),
      comercios: this.comercioService.listar(),
    }).subscribe({
      next: ({ turnos, comercios }) => {
        comercios.forEach((c) => this.nombresComercios.set(c.idComercio, c.nombre));
        // TODO RF-13: cuando el backend filtre por usuario, sacar este filter
        this.turnos.set(turnos.filter((t) => t.usuarioId === idUsuario));
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeDeError(err, 'No se pudieron cargar tus turnos.'));
        this.cargando.set(false);
      },
    });
  }

  nombreComercio(idComercio: number): string {
    return this.nombresComercios.get(idComercio) ?? 'Comercio';
  }

  // Solo se puede cancelar o reprogramar un turno que sigue activo
  puedeModificar(turno: Turno): boolean {
    return turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADO' || turno.estado === 'RESERVADO';
  }

  cancelar(turno: Turno): void {
    const idUsuario = this.auth.usuario()?.idUsuario;
    if (!idUsuario || !confirm('¿Seguro que querés cancelar este turno?')) {
      return;
    }
    this.cancelacionService
      .cancelarTurno({ idTurno: turno.idTurno, idUsuario, motivo: 'Cancelado por el cliente' })
      .subscribe({
        next: () => this.cargar(),
        error: (err) => this.error.set(mensajeDeError(err, 'No se pudo cancelar el turno.')),
      });
  }
}
