import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ComercioService } from "../../services/comercioService";
import { DIAS_SEMANA, NOMBRE_DIA, diaDeLaSemana, hoyISO, recortarHora } from "../../core/fechas";
import { Comercio } from "../../Models/catalogo";
import { mensajeDeError } from "../../core/http-error";
import { CurrencyPipe } from "@angular/common";
import { FotoService } from "../../services/fotoService";
import { Avatar } from "../../components/avatar/avatar";

interface DiaDeAtencion {
  nombre: string;
  franjas: string[];
  esHoy: boolean;
}

@Component({
  imports: [RouterLink, CurrencyPipe, Avatar],
  selector: "app-comercio-detail",
  styleUrl: "./comercio-detail.css",
  templateUrl: "./comercio-detail.html",
})
export class ComercioDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly comercioService = inject(ComercioService);
  protected readonly fotos = inject(FotoService);

  readonly comercio = signal<Comercio | null>(null);
  readonly error = signal('');

  readonly semana = computed<DiaDeAtencion[]>(() => {
    const horarios = this.comercio()?.horarios ?? [];
    const hoy = diaDeLaSemana(hoyISO());
    return DIAS_SEMANA.map((dia) => ({
      nombre: NOMBRE_DIA[dia],
      esHoy: dia === hoy,
      franjas: horarios
        .filter((h) => h.diaSemana === dia)
        .sort((a, b) => a.horaApertura.localeCompare(b.horaApertura))
        .map((h) => `${recortarHora(h.horaApertura)} a ${recortarHora(h.horaCierre)}`),
    }));
  });

  readonly tieneHorarios = computed(() => (this.comercio()?.horarios ?? []).length > 0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.comercioService.buscar(id).subscribe({
      next: (comercio) => this.comercio.set(comercio),
      error: (e: unknown) => this.error.set(mensajeDeError(e, 'No se pudo cargar el comercio.')),
    });
  }
}
