import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { Auth } from "../../services/auth";
import { UsuarioService } from "../../services/usuarioService";
import { FotoService } from "../../services/fotoService";
import { Rol, Usuario } from "../../Models/auth";
import { mensajeDeError } from "../../core/http-error";
import { Avatar } from "../../components/avatar/avatar";

/** null = mostrar todos los roles */
type FiltroRol = Rol | null;

@Component({
  imports: [Avatar],
  selector: "app-admin-usuarios",
  styleUrl: "./admin-usuarios.css",
  templateUrl: "./admin-usuarios.html",
})
export class AdminUsuarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  protected readonly auth = inject(Auth);
  protected readonly fotos = inject(FotoService);

  /** Botones de filtro: texto y rol que filtran */
  protected readonly filtros: { texto: string; rol: FiltroRol }[] = [
    { texto: 'Todos', rol: null },
    { texto: 'Clientes', rol: 'CLIENTE' },
    { texto: 'Comercios', rol: 'COMERCIO' },
    { texto: 'Admins', rol: 'ADMIN' },
  ];

  readonly usuarios = signal<Usuario[]>([]);
  readonly busqueda = signal('');
  readonly rolElegido = signal<FiltroRol>(null);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly ok = signal('');
  readonly eliminandoId = signal<number | null>(null);

  /** Primero filtra por rol y después por el texto buscado (nombre, apellido o email). */
  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const rol = this.rolElegido();
    return this.usuarios().filter((u) => {
      const coincideRol = rol === null || u.rol === rol;
      const coincideTexto =
        !texto || `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(texto);
      return coincideRol && coincideTexto;
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.usuarioService.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(
          [...lista].sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)),
        );
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar los usuarios.'));
        this.cargando.set(false);
      },
    });
  }

  /** Cuántos usuarios hay de cada rol (para mostrar en los botones de filtro). */
  cantidad(rol: FiltroRol): number {
    return rol === null ? this.usuarios().length : this.usuarios().filter((u) => u.rol === rol).length;
  }

  esUsuarioActual(usuario: Usuario): boolean {
    return usuario.idUsuario === this.auth.usuario()?.idUsuario;
  }

  alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  eliminar(usuario: Usuario): void {
    if (!confirm(`¿Eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.error.set('');
    this.ok.set('');
    this.eliminandoId.set(usuario.idUsuario);
    this.usuarioService.eliminar(usuario.idUsuario).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        this.ok.set(`${usuario.nombre} ${usuario.apellido} fue eliminado.`);
        this.cargar();
      },
      // Si tiene turnos, el backend no deja borrarlo y manda su propio mensaje
      error: (e: unknown) => {
        this.eliminandoId.set(null);
        this.error.set(mensajeDeError(e, `No se pudo eliminar a ${usuario.nombre}.`));
      },
    });
  }
}
