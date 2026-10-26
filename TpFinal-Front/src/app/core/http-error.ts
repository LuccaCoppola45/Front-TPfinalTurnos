import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte el error del backend en un texto para mostrar.
 * El backend responde de tres formas distintas:
 *  - ErrorResponse { status, error, message, path, timestamp }
 *  - un mapa { campo: mensaje } cuando falla @Valid
 *  - el error genérico de Spring (sin "message") para las excepciones sin handler
 */
export function mensajeDeError(
  error: unknown,
  porDefecto = 'Ocurrió un error inesperado. Intentá de nuevo.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return porDefecto;
  }
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo en http://localhost:8080.';
  }

  let cuerpo: unknown = error.error;
  if (typeof cuerpo === 'string') {
    try {
      cuerpo = JSON.parse(cuerpo);
    } catch {
      // era texto plano
    }
  }

  if (typeof cuerpo === 'string' && cuerpo.trim() && !cuerpo.trim().startsWith('<')) {
    return cuerpo;
  }

  if (cuerpo && typeof cuerpo === 'object') {
    const obj = cuerpo as Record<string, unknown>;
    const mensaje = obj['message'];
    if (typeof mensaje === 'string' && mensaje) {
      return mensaje;
    }
    const esErrorGenerico = 'status' in obj || 'path' in obj;
    if (!esErrorGenerico) {
      const mensajes = Object.values(obj).filter((v): v is string => typeof v === 'string');
      if (mensajes.length > 0) {
        return mensajes.join('. ');
      }
    }
  }

  switch (error.status) {
    case 401:
      return 'Tu sesión no es válida. Iniciá sesión nuevamente.';
    case 403:
      return 'No tenés permisos para realizar esta acción.';
    case 404:
      return 'No se encontró lo que buscabas.';
    default:
      return porDefecto;
  }
}