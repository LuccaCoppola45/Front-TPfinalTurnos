import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { Auth } from "../services/auth";
import { Router } from "@angular/router";
import { Rol } from "../Models/auth";

// Guard para proteger rutas: solo deja pasar si el usuario está logueado
export const authGuard: CanActivateFn = () => {
    // Inyecta el servicio de autenticación
    const auth = inject(Auth);

    // Inyecta el router de Angular para poder redirigir
    const router = inject(Router);

    // Si está logueado, devuelve true para permitir la navegación
    // Si no, redirige al login
    return auth.estalogueado() ? true : router.createUrlTree(['/login']);
}

// Guard dinámico según roles permitidos
export function rolGuard(...roles: Rol[]): CanActivateFn {
    // La función devuelve otra función que Angular ejecuta al entrar a la ruta
    return () => {
        // Inyecta el servicio de auth
        const auth = inject(Auth);

        // Inyecta el router
        const router = inject(Router);

        // Si no está logueado, lo manda al login
        if (!auth.estalogueado()) {
            return router.createUrlTree(['/login']);
        }

        // Obtiene el rol del usuario
        const rol = auth.rol();

        // Si el rol existe y está dentro de los roles permitidos, deja pasar
        // Si no, lo manda al home
        return rol !== null && roles.includes(rol) ? true : router.createUrlTree(['/home']);
    }
}