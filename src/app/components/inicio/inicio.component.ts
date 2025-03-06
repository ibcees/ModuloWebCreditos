import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // Importa FormsModule


@Component({
  selector: 'app-inicio',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  username: string = '';
  password: string = '';

  onSubmit() {
    //TODO:: Implementar la lógica para manejar el inicio de sesión
    console.log('Usuario:', this.username);
    console.log('Contraseña:', this.password);
  }
}
