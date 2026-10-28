import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  protected readonly auth = inject(Auth);

  //Refresca el usuario por si el admid le cambiop el rol(acepto la solicitud de conversion)
  ngOnInit(): void{
    this.auth.cargarUsuario().subscribe({error: ()=>undefined})
  }

}
