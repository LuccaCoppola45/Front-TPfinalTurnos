import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';
import { ActualizarUsuarioRequest, ActualizarUsuarioResponse, Usuario } from '../Models/auth';
import { API_URL } from '../core/api';


@Service()
export class UsuarioService {
    private readonly http = inject(HttpClient);
    private readonly url = '${API_URL}/usuarios';

    listar(): Observable<Usuario[]>{
        return this.http.get<Usuario[] | null>(this.url).pipe(map((lista)=>lista??[]));
    }

    actualizar(id: number, datos: ActualizarUsuarioRequest):Observable<ActualizarUsuarioResponse>{
        return this.http.put<ActualizarUsuarioResponse>(`${this.url}/update/${id}`, datos);
    }

    eliminar(id:number):Observable<void>{
        return this.http.delete<void>(this.url+'/'+id);
    }
}

