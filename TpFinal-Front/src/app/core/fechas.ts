import { DiaSemana } from '../Models/catalogo';

export const DIAS_SEMANA: DiaSemana[] = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];

export const NOMBRE_DIA: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

const POR_INDICE_JS: DiaSemana[] = [
  'DOMINGO',
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
];

const dos = (n: number): string => String(n).padStart(2, '0');

export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export function minutosAhora(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Recibe 'YYYY-MM-DD' y devuelve el día de la semana con el mismo formato que el backend. */
export function diaDeLaSemana(fechaISO: string): DiaSemana {
  const [a, m, d] = fechaISO.split('-').map(Number);
  return POR_INDICE_JS[new Date(a, m - 1, d).getDay()];
}

/** '09:30' o '09:30:00' -> 570 */
export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** 570 -> '09:30' */
export function aHora(minutos: number): string {
  return `${dos(Math.floor(minutos / 60))}:${dos(minutos % 60)}`;
}

/** '09:30:00' -> '09:30' */
export function recortarHora(hora: string): string {
  return hora.slice(0, 5);
}
