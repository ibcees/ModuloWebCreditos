import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
//importacion de clases o servicios
import { Usuarios } from '../../models/usuarios';
import { UsuarioServiceService } from '../../services/usuario-service.service';
import { Route,Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard } from '../../guards/auth.guard';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, FormsModule, HttpClientModule, 
    SharedModule,RouterModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  providers: [UsuarioServiceService]
})

export class InicioComponent {
  username: string = '';
  password: string = '';

  constructor(
    private usuarioService: UsuarioServiceService,
    private router: Router
  ) {}

  onSubmit() {
    this.usuarioService.iniciarSesion(this.username, this.password)
      .subscribe({
        next: (usuario) => {
          console.log('Sesión iniciada:', usuario);
  
          if (!usuario || !usuario.rol) {
            alert('Error: el rol no está definido.');
            return;
          }          
  
          alert('Inicio de sesión exitoso. ¡Bienvenido ' + usuario.nombre + '!');
  
          // Guardar sesión en localStorage
          localStorage.setItem('usuario1', JSON.stringify(usuario));
          console.log('Usuario guardado:', JSON.parse(localStorage.getItem('usuario1')!));
  
          // Redirigir según el rol
          if (usuario.rol === 'admin') {
            this.router.navigate(['/acreditados']);
          } else if (usuario.rol === 'asistente') {
            this.router.navigate(['/acreditados']);
          } else {
            alert('Rol no reconocido. No se puede redirigir.');
          }
        },
        error: (err) => {
          console.error('Error de inicio de sesión:', err);
          alert('Usuario o contraseña incorrectos.');
        }
      });
  }  
}
