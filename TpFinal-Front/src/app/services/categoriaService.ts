import { Service, inject } from '@angular/core';
import { Categoria,CategoriaRequest } from '../Models/catalogo';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../core/api';

@Service()
export class CategoriaService {
    private readonly url = '${API_URL}/api/categorias'
    private readonly http = inject(HttpClient);

    listar():Observable<Categoria[]>{
        return this.http.get<Categoria[]>(this.url);
    }

    crear(datos:CategoriaRequest):Observable<Categoria>{
        return this.http.post<Categoria>(this.url, datos);
    }

    actualizar(id:number, datos: CategoriaRequest):Observable<Categoria>{
        return this.http.put<Categoria>('${this.url}/${id}', datos);
    }

    eliminar(id:number):Observable<void>{
        return this.http.delete<void>('${this.url}/${id}');
    }


}
