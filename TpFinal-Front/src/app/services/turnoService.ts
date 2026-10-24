import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Turno, TurnoRequest } from '../Models/turnos';
import { map, Observable } from 'rxjs';
import { API_URL } from '../core/api';



@Service()
export class TurnoService {
    private readonly url = '${API_URL}/turnos';
    private readonly http = inject(HttpClient);

    listar(): Observable<Turno[]>{
        return this.http.get<Turno[] | null>(this.url).pipe(map((lista)=>lista ?? [])); 
    }

    buscar(id: number):Observable<Turno>{
        return this.http.get<Turno>(this.url + '/' + id);
    }

    crear(datos: TurnoRequest):Observable <Turno>{
        return this.http.post<Turno>(this.url, datos);
    } 

    actualizar(id: number, datos: TurnoRequest): Observable<Turno>{
        return this.http.put<Turno>(this.url+ '/'+ id,datos);
    }  
}
