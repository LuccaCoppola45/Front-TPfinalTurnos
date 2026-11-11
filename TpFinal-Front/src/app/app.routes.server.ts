import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Páginas públicas: se pueden pre-generar en el servidor
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'registro', renderMode: RenderMode.Prerender },
  // El resto depende de la sesión (localStorage), que solo existe en el navegador
  { path: '**', renderMode: RenderMode.Client },
];
