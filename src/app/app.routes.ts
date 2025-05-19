import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AgregarEditarUsuarioComponent } from './components/usuarios/agregar-editar-usuario/agregar-editar-usuario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { SolicitudesComponent } from './components/solicitudes/solicitudes.component';
import { AcreditadosComponent } from './components/acreditados/acreditados.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicioSesion', pathMatch: 'full' },

  // Solo ADMIN puede ver esta pantalla
  { 
    path: 'Usuarios', 
    component: UsuariosComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin'] } 
  },

  { 
    path: 'agregarUsuario', 
    component: AgregarEditarUsuarioComponent 
  },
  // Solo ADMIN puede modificar usuarios
  { 
    path: 'modificarUsuario/:id', 
    component: AgregarEditarUsuarioComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin'] } 
  },
  // Cualquiera puede entrar a la página de inicio de sesión
  { path: 'inicioSesion', component: InicioComponent },
  // ADMIN y ASISTENTE pueden ver solicitudes
  { 
    path: 'solicitudes', 
    component: SolicitudesComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin', 'asistente'] } 
  },
  // ADMIN y ASISTENTE pueden ver acreditados
  { 
    path: 'acreditados', 
    component: AcreditadosComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin', 'asistente'] } 
  },
  // Ruta por defecto si no se encuentra otra
  { path: '**', redirectTo: 'inicioSesion', pathMatch: 'full' }
];
