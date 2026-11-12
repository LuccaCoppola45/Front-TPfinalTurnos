import { Component, computed, inject, OnInit } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { HorarioService } from "../../services/horarioService";
import { Auth } from "../../services/auth";
import { ComercioService } from "../../services/comercioService";
import { Comercio, DiaSemana, HorarioAtencion } from "../../Models/catalogo";
import { recortarHora } from "../../core/fechas";
import {signal} from "@angular/core";
import {DIAS_SEMANA, NOMBRE_DIA} from "../../core/fechas";
import { mensajeDeError } from "../../core/http-error";

@Component({
  imports: [ReactiveFormsModule],
  selector: "app-comercio-horarios",
  styleUrl: "./comercio-horarios.css",
  templateUrl: "./comercio-horarios.html",
})
export class ComercioHorarios implements OnInit {
   private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);
  private readonly comercioService = inject(ComercioService);
  private readonly horarioService = inject(HorarioService);

  protected readonly dias = DIAS_SEMANA;
  protected readonly nombreDia = NOMBRE_DIA;
  protected readonly recortarHora = recortarHora;

  readonly comercio = signal<Comercio | null>(null);
  readonly editandoId = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal('');


   readonly form = this.fb.group({
    diaSemana: ['LUNES' as DiaSemana, Validators.required],
    horaApertura: ['09:00', Validators.required],
    horaCierre: ['18:00', Validators.required],
  });

  readonly horarios = computed(() =>
    [...(this.comercio()?.horarios ?? [])].sort(
      (a, b) =>
        DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana) ||
        a.horaApertura.localeCompare(b.horaApertura),
    ),
  );

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


  editar(horario: HorarioAtencion): void {
    this.editandoId.set(horario.idHorarioAtencion);
    this.form.setValue({
      diaSemana: horario.diaSemana,
      horaApertura: recortarHora(horario.horaApertura),
      horaCierre: recortarHora(horario.horaCierre),
    });
    this.error.set('');
  }


  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset({
      diaSemana: 'LUNES',
      horaApertura: '09:00',
      horaCierre: '18:00',
    });
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
    const valores = this.form.getRawValue();
    if (valores.horaApertura >= valores.horaCierre) {
      this.error.set('La hora de apertura debe ser anterior a la de cierre.');
      return;
    }
    const datos = { ...valores, comercioId: comercio.idComercio };
    const id = this.editandoId();
    const peticion = id === null ? this.horarioService.crear(datos) : this.horarioService.actualizar(id, datos);

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
          mensajeDeError(e, 'No se pudo guardar el horario. Puede que se superponga con otro del mismo día.'),
        );
      },
    });
  }
  eliminar(horario: HorarioAtencion): void {
    if (!confirm('¿Eliminar este horario de atención?')) {
      return;
    }
    this.error.set('');
    this.horarioService.eliminar(horario.idHorarioAtencion).subscribe({
      next: () => this.cargar(),
      error: (e: unknown) => this.error.set(mensajeDeError(e, 'No se pudo eliminar el horario.')),
    });
  }
}
