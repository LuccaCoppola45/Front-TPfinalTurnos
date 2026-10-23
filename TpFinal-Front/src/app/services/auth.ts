import { Rol, Usuario } from './../Models/auth';
import { Service , computed, inject, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


const CLAVE_TOKEN = 'turnos_token'
@Service()
export class Auth {

    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    //Este es un signal que usamos basicamente para guardar el token de autenticacion, empieza en null porque no hay un token cargado
    readonly token = signal<string| null>(null);
    //Este es otro signal pero que lo suamos para guardar los datos del usuario, y empieza en null por lo mismo que antes
    readonly usuario = signal<Usuario | null>(null)
    // es true solo si hay token y también hay datos del usuario.
    readonly estalogueado = computed(() => this.token() !== null && this.usuario() !== null);

    //esto te devuelv eel rol del usuario, y si el usuario es todavia null. devuelve null
    readonly rol = computed(() => this.usuario()?.rol ?? null);
    
     
     

}
