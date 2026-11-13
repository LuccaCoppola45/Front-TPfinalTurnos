import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmacionTurno, Turno, TurnoRequest } from '../Models/turnos';
import { map, Observable } from 'rxjs';
import { API_URL } from '../core/api';



@Service()
export class TurnoService {
    private readonly url = `${API_URL}/turnos`;
    private readonly http = inject(HttpClient);

    listar(): Observable<Turno[]>{
        return this.http.get<Turno[] | null>(this.url).pipe(map((lista)=>lista ?? [])); 
    }

    buscar(id: number):Observable<Turno>{
        return this.http.get<Turno>(`${this.url}/${id}`);
    }

    crear(datos: TurnoRequest):Observable <Turno>{
        return this.http.post<Turno>(this.url, datos);
    } 

    actualizar(id: number, datos: TurnoRequest): Observable<Turno>{
        return this.http.put<Turno>(`${this.url}/${id}`,datos);
    }

    /** Página "¿Vas a ir?" del mail de recordatorio (pública, sin iniciar sesión). */
    obtenerConfirmacion(codigo: string): Observable<ConfirmacionTurno> {
        return this.http.get<ConfirmacionTurno>(`${API_URL}/api/turnos/confirmacion/${codigo}`);
    }

    /** asiste = true confirma el turno; false lo cancela. */
    responderConfirmacion(codigo: string, asiste: boolean): Observable<ConfirmacionTurno> {
        return this.http.post<ConfirmacionTurno>(`${API_URL}/api/turnos/confirmacion/${codigo}`, { asiste });
    }
}
