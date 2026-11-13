import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  protected readonly auth = inject(Auth);

  ngOnInit(): void{
    this.auth.cargarUsuario().subscribe({error: ()=>undefined})
  }

}
