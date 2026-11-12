import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { authGuard, rolGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  //Esto es para cualquier usuario Logeado
  {path: 'home', canActivate: [authGuard], loadComponent: () => import('./pages/home/home').then((m) => m.Home), },
  
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
  },


  // CLIENTE

  {
    path: 'comercios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/comercio-list/comercio-list').then((m) => m.ComercioList),
  },
  {
    path: 'comercios/:id/reservar/:servicioId',
    canActivate: [rolGuard('CLIENTE')],
    loadComponent: () => import('./pages/turno-form/turno-form').then((m) => m.TurnoForm),
  },
  {
    path: 'turnos/:idTurno/reprogramar',
    canActivate: [rolGuard('CLIENTE')],
    loadComponent: () => import('./pages/turno-form/turno-form').then((m) => m.TurnoForm),
  },
  {
    path: 'mis-turnos',
    canActivate: [rolGuard('CLIENTE')],
    loadComponent: () => import('./pages/mis-turnos/mis-turnos').then((m) => m.MisTurnos),
  },
  {
    path: 'solicitar-comercio',
    canActivate: [rolGuard('CLIENTE')],
    loadComponent: () =>
      import('./pages/solicitar-comercio/solicitar-comercio').then((m) => m.SolicitarComercio),
  },

  // Siempre al final: Angular prueba las rutas en orden y '**' atrapa cualquier cosa
  { path: '**', redirectTo: '' },
];
