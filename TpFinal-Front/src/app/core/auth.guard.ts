import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { Auth } from "../services/auth";
import { Router } from "@angular/router";
import { Rol } from "../Models/auth";

export const authGuard: CanActivateFn = () => {
    const auth = inject(Auth);

    const router = inject(Router);

    return auth.estalogueado() ? true : router.createUrlTree(['/login']);
}

export function rolGuard(...roles: Rol[]): CanActivateFn {
    return () => {
        const auth = inject(Auth);

        const router = inject(Router);

        if (!auth.estalogueado()) {
            return router.createUrlTree(['/login']);
        }

        const rol = auth.rol();

        return rol !== null && roles.includes(rol) ? true : router.createUrlTree(['/home']);
    }
}