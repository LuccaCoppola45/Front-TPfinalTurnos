import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comercio, ComercioRequest } from '../Models/catalogo';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api';

@Service()
export class ComercioService {
    private readonly url = '${API_URL}/api/comercios';
    private readonly http = inject(HttpClient);

    crear(datos: ComercioRequest):Observable<Comercio>{
        return this.http.post<Comercio>(this.url, datos);
    }

    actualizar(id:number, datos: ComercioRequest):Observable<Comercio>{
        return this.http.put<Comercio>('${this.url}/${id}', datos);
    }

    eliminar(id:number):Observable<void>{
        return this.http.delete<void>('${this.url}/{id}');
    }

}
