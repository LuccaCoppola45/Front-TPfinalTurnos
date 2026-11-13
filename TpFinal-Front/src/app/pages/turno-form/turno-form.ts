import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComercioService } from '../../services/comercioService';
import { TurnoService } from '../../services/turnoService';
import { aHora, aMinutos, diaDeLaSemana, hoyISO, minutosAhora, NOMBRE_DIA, recortarHora } from '../../core/fechas';
import { Comercio } from '../../Models/catalogo';
import { Turno } from '../../Models/turnos';
import { forkJoin } from 'rxjs';
import { mensajeDeError } from '../../core/http-error';

interface DiaElegible {
  iso: string;
  nombreCorto: string;
  numero: number;
  mes: string;
  abierto: boolean;
  esHoy: boolean;
}

const NOMBRE_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dos = (n: number): string => String(n).padStart(2, '0');

@Component({
  imports: [RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-turno-form',
  styleUrl: './turno-form.css',
  templateUrl: './turno-form.html',
})
export class TurnoForm implements OnInit{
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly comercioService = inject(ComercioService);
  private readonly turnoService = inject(TurnoService);

  protected readonly hoy = hoyISO();
  protected readonly nombreDia = NOMBRE_DIA;
  protected readonly recortarHora = recortarHora;
  protected readonly idComercioRuta = this.route.snapshot.paramMap.get('id');

  readonly comercio = signal<Comercio | null>(null);
  readonly turnos = signal<Turno[]>([]);
  readonly turnoAEditar = signal<Turno | null>(null);
  readonly servicioId = signal(0);

  readonly fecha = signal('');
  readonly horaElegida = signal('');
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal('');

  readonly servicio = computed(
    () => this.comercio()?.servicios?.find((s) => s.idServicio === this.servicioId()) ?? null,
  );

  readonly horariosDelDia = computed(() => {
    const fecha = this.fecha();
    if (!fecha) {
      return [];
    }
    const dia = diaDeLaSemana(fecha);
    return (this.comercio()?.horarios ?? []).filter((h) => h.diaSemana === dia);
  });

  readonly horasDisponibles = computed(() => {
    const servicio = this.servicio();
    const fecha = this.fecha();
    if (!servicio || !fecha) {
      return [];
    }
    const duracion = servicio.duracionDelServicio;
    const paso = Math.min(30, duracion);
    const idEditando = this.turnoAEditar()?.idTurno;

    const ocupados = this.turnos().filter(
      (t) =>
        t.servicioId === servicio.idServicio &&
        t.fecha === fecha &&
        t.estado !== 'CANCELADO' &&
        t.idTurno !== idEditando,
    );

    const resultado: string[] = [];
    for (const horario of this.horariosDelDia()) {
      const cierre = aMinutos(horario.horaCierre);
      for (let inicio = aMinutos(horario.horaApertura); inicio + duracion <= cierre; inicio += paso) {
        const fin = inicio + duracion;
        const choca = ocupados.some(
          (t) => inicio < aMinutos(t.horaFin) && fin > aMinutos(t.horaInicio),
        );
        const yaPaso = fecha === this.hoy && inicio <= minutosAhora();
        if (!choca && !yaPaso) {
          resultado.push(aHora(inicio));
        }
      }
    }
    return resultado;
  });

  readonly esReprogramacion = computed(() => this.turnoAEditar() !== null);

  readonly nombreDelDia = computed(() => {
    const fecha = this.fecha();
    return fecha ? this.nombreDia[diaDeLaSemana(fecha)] : '';
  });

  readonly dias = computed<DiaElegible[]>(() => {
    const diasQueAtiende = new Set((this.comercio()?.horarios ?? []).map((h) => h.diaSemana));
    const [a, m, d] = this.hoy.split('-').map(Number);
    return Array.from({ length: 28 }, (_, i) => {
      const fecha = new Date(a, m - 1, d + i);
      const iso = `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
      return {
        iso,
        nombreCorto: NOMBRE_CORTO[fecha.getDay()],
        numero: fecha.getDate(),
        mes: i === 0 || fecha.getDate() === 1 ? MESES[fecha.getMonth()] : '',
        abierto: diasQueAtiende.has(diaDeLaSemana(iso)),
        esHoy: i === 0,
      };
    });
  });

  elegirDia(iso: string): void {
    this.fecha.set(iso);
    this.horaElegida.set('');
  }

  ngOnInit(): void {
    const idTurno = this.route.snapshot.paramMap.get('idTurno');
    if (idTurno) {
      this.turnoService.buscar(Number(idTurno)).subscribe({
        next: (turno) => {
          this.turnoAEditar.set(turno);
          this.fecha.set(turno.fecha);
          this.cargar(turno.idComercio, turno.servicioId);
        },
        error: (e: unknown) => this.fallarCarga(e),
      });
    } else {
      const idComercio = Number(this.route.snapshot.paramMap.get('id'));
      const idServicio = Number(this.route.snapshot.paramMap.get('servicioId'));
      this.cargar(idComercio, idServicio);
    }
  }

  private cargar(idComercio: number, idServicio: number): void {
    this.servicioId.set(idServicio);
    forkJoin({
      comercio: this.comercioService.buscar(idComercio),
      turnos: this.turnoService.listar(),
    }).subscribe({
      next: ({ comercio, turnos }) => {
        this.comercio.set(comercio);
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: (e: unknown) => this.fallarCarga(e),
    });
  }

  private fallarCarga(e: unknown): void {
    this.error.set(mensajeDeError(e, 'No se pudo cargar la información para reservar.'));
    this.cargando.set(false);
  }

  confirmar(): void {
    const comercio = this.comercio();
    const servicio = this.servicio();
    if (!comercio || !servicio || !this.fecha() || !this.horaElegida()) {
      return;
    }
    const datos = {
      fecha: this.fecha(),
      horaInicio: this.horaElegida(),
      servicioId: servicio.idServicio,
      idComercio: comercio.idComercio,
    };
    const editando = this.turnoAEditar();
    const peticion = editando
      ? this.turnoService.actualizar(editando.idTurno, datos)
      : this.turnoService.crear(datos);

    this.enviando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: () => this.router.navigate(['/mis-turnos']),
      error: (e: unknown) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e, 'No se pudo guardar el turno.'));
      },
    });
  }
}
