import { Service,inject } from '@angular/core';
import { HorarioAtencion, HorarioAtencionRequest } from '../Models/catalogo';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../core/api';

@Service()
export class HorarioService {
    private readonly url = '${API_URL}/api/horarioAtencion';
    private readonly http = inject(HttpClient);

    crear(datos:HorarioAtencionRequest):Observable<HorarioAtencion>{
        return this.http.post<HorarioAtencion>(this.url, datos);
    }

    actualizar(id: number, datos: HorarioAtencionRequest):Observable<HorarioAtencion>{
        return this.http.put<HorarioAtencion>('${this.url}/${id}',datos);
    }

    eliminar(id:number):Observable<void>{
        return this.http.delete<void>('${this.url}/${id}');
    }
}
