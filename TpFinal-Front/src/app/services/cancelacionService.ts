import { Service,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Cancelacion,CancelacionRequest } from '../Models/turnos';
import { API_URL } from '../core/api';

@Service()
export class CancelacionService {
    private readonly url = '${API_URL}/api/cancelaciones';
    private readonly http = inject(HttpClient);

    listar():Observable<Cancelacion[]>{
        return this.http.get<Cancelacion[]>(this.url);
    }

    cancelarTurno(datos: CancelacionRequest):Observable<Cancelacion>{
        return this.http.post<Cancelacion>(this.url, datos);
    }
}
