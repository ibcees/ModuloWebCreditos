import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';

import { AgregarEditarUsuarioComponent } from './components/usuarios/agregar-editar-usuario/agregar-editar-usuario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { SolicitudesComponent } from './components/solicitudes/solicitudes.component';
import { AcreditadosComponent } from './components/acreditados/acreditados.component';


export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'Usuarios', component: UsuariosComponent },
  { path: 'agregarUsuario', component: AgregarEditarUsuarioComponent },
  { path: 'modificarUsuario/:id', component: AgregarEditarUsuarioComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'solicitudes', component: SolicitudesComponent},
  { path: 'acreditados', component: AcreditadosComponent },
  { path: '**',  redirectTo: 'inicio', pathMatch: 'full' }
];