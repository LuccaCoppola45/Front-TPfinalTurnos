import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { authGuard, rolGuard } from './core/auth.guard';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  // Link del mail de recordatorio "¿Vas a ir?": público, no hace falta iniciar sesión
  {
    path: 'confirmar-turno/:codigo',
    loadComponent: () =>
      import('./pages/confirmar-turno/confirmar-turno').then((m) => m.ConfirmarTurno),
  },
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
    canActivate: [rolGuard('CLIENTE')],
    loadComponent: () =>
      import('./pages/comercio-list/comercio-list').then((m) => m.ComercioList),
  },
  {
    // Detalle del comercio (RF-28): datos, horarios y servicios para reservar
    path: 'comercios/:id',
    canActivate: [rolGuard('CLIENTE')],
    loadComponent: () =>
      import('./pages/comercio-detail/comercio-detail').then((m) => m.ComercioDetail),
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
  // COMERCIO
  {
    path: 'mi-comercio',
    canActivate: [rolGuard('COMERCIO')],
    loadComponent: () =>
      import('./pages/comercio-datos/comercio-datos').then((m) => m.ComercioDatos),
  },
  {
    path: 'mi-comercio/servicios',
    canActivate: [rolGuard('COMERCIO')],
    loadComponent: () =>
      import('./pages/comercio-servicios/comercio-servicios').then((m) => m.ComercioServicios),
  },
  {
    path: 'mi-comercio/horarios',
    canActivate: [rolGuard('COMERCIO')],
    loadComponent: () =>
      import('./pages/comercio-horarios/comercio-horarios').then((m) => m.ComercioHorarios),
  },
  {
    path: 'mi-comercio/agenda',
    canActivate: [rolGuard('COMERCIO')],
    loadComponent: () =>
      import('./pages/comercio-agenda/comercio-agenda').then((m) => m.ComercioAgenda),
  },

  // ADMIN
  {
    path: 'admin/categorias',
    canActivate: [rolGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/admin-categorias/admin-categorias').then((m) => m.AdminCategorias),
  },
  {
    path: 'admin/solicitudes',
    canActivate: [rolGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/admin-solicitudes/admin-solicitudes').then((m) => m.AdminSolicitudes),
  },
  {
    path: 'admin/comercios',
    canActivate: [rolGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/admin-comercios/admin-comercios').then((m) => m.AdminComercios),
  },
  {
    path: 'admin/usuarios',
    canActivate: [rolGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/admin-usuarios/admin-usuarios').then((m) => m.AdminUsuarios),
  },
  {
    path: 'admin/cancelaciones',
    canActivate: [rolGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/admin-cancelaciones/admin-cancelaciones').then((m) => m.AdminCancelaciones),
  },

  // Siempre al final: Angular prueba las rutas en orden y '**' atrapa cualquier cosa
  { path: '**', redirectTo: '' },
];
