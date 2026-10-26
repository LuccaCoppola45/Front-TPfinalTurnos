import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, RegistroRequest, Usuario } from '../Models/auth';
import { API_URL } from '../core/api';
import { emailDelToken, tokenVencido } from '../core/jwt';

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
    
     
     // Se ejecuta al arrancar la app: recupera la sesión guardada si el token sigue vigente. 
  async restaurarSesion(): Promise<void> {
    const guardado = localStorage.getItem(CLAVE_TOKEN);
    if (!guardado || tokenVencido(guardado)) {
      localStorage.removeItem(CLAVE_TOKEN);
      return;
    }
    this.token.set(guardado);
    try {
      await firstValueFrom(this.cargarUsuario());
    } catch {
      this.limpiarSesion();
    }
  }

  /** Registra al usuario. El backend responde texto plano, no JSON. */
  registrar(datos: RegistroRequest): Observable<string> {
    return this.http.post(`${API_URL}/api/auth/register`, datos, { responseType: 'text' });
  }

  login(datos: LoginRequest): Observable<Usuario> {
    return this.http.post<LoginResponse>(`${API_URL}/api/auth/login`, datos).pipe(
      tap((respuesta) => {
        localStorage.setItem(CLAVE_TOKEN, respuesta.token);
        this.token.set(respuesta.token);
      }),
      switchMap(() => this.cargarUsuario()),
      catchError((error: unknown) => {
        this.limpiarSesion();
        return throwError(() => error);
      }),
    );
  }

  /**
   * El token solo trae el email, así que el id y el rol se buscan en /usuarios.
   * Sirve también para refrescar el rol (por ejemplo, cuando el admin aprueba una solicitud).
   */
  cargarUsuario(): Observable<Usuario> {
    const email = emailDelToken(this.token());
    return this.http.get<Usuario[] | null>(`${API_URL}/usuarios`).pipe(
      map((lista) => (lista ?? []).find((u) => u.email.toLowerCase() === email?.toLowerCase())),
      map((usuario) => {
        if (!usuario) {
          throw new Error('No se encontró el usuario de la sesión');
        }
        return usuario;
      }),
      tap((usuario) => this.usuario.set(usuario)),
    );
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/login']);
  }

  private limpiarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this.token.set(null);
    this.usuario.set(null);
  }
}



