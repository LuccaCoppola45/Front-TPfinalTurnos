import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SolicitudRequest, SolicitudConversion } from '../Models/solicitud';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api';

@Service()
export class SolicitudService {
    private readonly url = '${API_URL}/api/solicitudes';
    private readonly http = inject(HttpClient);

    crear(datos: SolicitudRequest): Observable<SolicitudConversion>{
        return this.http.post<SolicitudConversion>(this.url, datos);
    }

    listaPendientes(): Observable <SolicitudConversion[]>{
        return this.http.get<SolicitudConversion[]>(this.url);
    }

    aprobar(id: number): Observable<SolicitudConversion>{
        return this.http.put<SolicitudConversion>('${this.url}/${id}/aprobar', {});
    }

    rechazar(id:number):Observable<SolicitudConversion>{
        return this.http.put<SolicitudConversion>('${this.url}/${id}/rechazar', {});
    }
}
