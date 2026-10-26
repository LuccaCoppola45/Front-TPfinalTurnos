import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comercio, ComercioRequest } from '../Models/catalogo';
import { Observable, map } from 'rxjs';
import { API_URL } from '../core/api';

@Service()
export class ComercioService {
    private readonly url = '${API_URL}/api/comercios';
    private readonly http = inject(HttpClient);

    listar():Observable<Comercio[]>{
        return this.http.get<Comercio[]| null>(this.url).pipe(map((lista)=>lista??[]));
    }

    buscar(id:number):Observable<Comercio>{
        return this.http.get<Comercio>('${this.url}/${id}');
    }

    miComercio(idUsuario: number):Observable<Comercio|null>{
        return this.listar().pipe(
            map((lista)=>lista.find((c)=>c.usuarioPropietarioId === idUsuario)??null),
        );
    }

    actualizar(id:number, datos: ComercioRequest):Observable<Comercio>{
        return this.http.put<Comercio>('${this.url}/${id}', datos);
    }

    eliminar(id:number):Observable<void>{
        return this.http.delete<void>('${this.url}/{id}');
    }

}
