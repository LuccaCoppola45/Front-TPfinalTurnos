import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio, ServicioRequest } from '../Models/catalogo';
import { API_URL } from '../core/api';


@Service()
export class ServicioService {
    private readonly url = '${API_URL}/api/servicios';
    private readonly http = inject(HttpClient); 

    crear(datos: ServicioRequest):Observable<Servicio> {
        return this.http.post<Servicio>(this.url, datos);
    }

    actualizar(id: number, datos: ServicioRequest):Observable<Servicio>{
        return this.http.put<Servicio>('${this.url}/${id}', datos);
    }

    eliminar(id: number): Observable<void>{
        return this.http.delete<void>('${this.url}/${id}');
    }
}
