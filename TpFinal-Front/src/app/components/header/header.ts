import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { FotoService } from '../../services/fotoService';
import { Avatar } from '../avatar/avatar';

@Component({
  imports: [RouterLink, RouterLinkActive, Avatar],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {

  protected readonly auth = inject(Auth);
  protected readonly fotos = inject(FotoService);
}
