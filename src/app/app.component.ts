import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';

import { SolicitudesComponent } from './components/solicitudes/solicitudes.component';
import { AcreditadosComponent } from './components/acreditados/acreditados.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { AgregarEditarUsuarioComponent } from './components/usuarios/agregar-editar-usuario/agregar-editar-usuario.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CreditosEducativos';
}
