import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TurnoService } from '../../services/turnoService';
import { ConfirmacionTurno } from '../../Models/turnos';
import { recortarHora } from '../../core/fechas';
import { mensajeDeError } from '../../core/http-error';

/**
 * Página que se abre desde el mail de recordatorio (24 h antes).
 * No pide iniciar sesión: el código del link identifica el turno.
 * El cliente toca "Sí, voy" (CONFIRMADO) o "No puedo ir" (CANCELADO).
 */
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-confirmar-turno',
  styleUrl: './confirmar-turno.css',
  templateUrl: './confirmar-turno.html',
})
export class ConfirmarTurno implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly turnoService = inject(TurnoService);

  protected readonly recortarHora = recortarHora;
  private readonly codigo = this.route.snapshot.paramMap.get('codigo') ?? '';

  /** Lo que tocó en el mail (?respuesta=si|no): se resalta ese botón, pero igual hay que confirmar. */
  protected readonly sugerida = this.route.snapshot.queryParamMap.get('respuesta');

  readonly turno = signal<ConfirmacionTurno | null>(null);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal('');
  /** Respuesta que se acaba de mandar (para mostrar el mensaje final) */
  readonly respondio = signal<'si' | 'no' | null>(null);

  ngOnInit(): void {
    this.turnoService.obtenerConfirmacion(this.codigo).subscribe({
      next: (turno) => {
        this.turno.set(turno);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'El link no es válido o el turno ya no existe.'));
        this.cargando.set(false);
      },
    });
  }

  responder(asiste: boolean): void {
    this.enviando.set(true);
    this.error.set('');
    this.turnoService.responderConfirmacion(this.codigo, asiste).subscribe({
      next: (turno) => {
        this.turno.set(turno);
        this.respondio.set(asiste ? 'si' : 'no');
        this.enviando.set(false);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e, 'No se pudo guardar tu respuesta. Probá de nuevo.'));
      },
    });
  }
}
