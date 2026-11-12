import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ComercioService } from "../../services/comercioService";
import { DIAS_SEMANA, NOMBRE_DIA, recortarHora } from "../../core/fechas";
import { Comercio } from "../../Models/catalogo";
import { mensajeDeError } from "../../core/http-error";
import { CurrencyPipe } from "@angular/common";

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: "app-comercio-detail",
  styleUrl: "./comercio-detail.css",
  templateUrl: "./comercio-detail.html",
})
export class ComercioDetail implements OnInit{
  private readonly route = inject(ActivatedRoute);
  private readonly comercioService = inject(ComercioService);

  protected readonly nombreDia = NOMBRE_DIA;
  protected readonly recortarHora = recortarHora;

  readonly comercio = signal<Comercio | null>(null);
  readonly error = signal('');

  /** Horarios ordenados de lunes a domingo y por hora de apertura. */
  readonly horarios = computed(() =>
    [...(this.comercio()?.horarios ?? [])].sort(
      (a, b) =>
        DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana) ||
        a.horaApertura.localeCompare(b.horaApertura),
    ),
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.comercioService.buscar(id).subscribe({
      next: (comercio) => this.comercio.set(comercio),
      error: (e: unknown) => this.error.set(mensajeDeError(e, 'No se pudo cargar el comercio.')),
    });
  }
}
