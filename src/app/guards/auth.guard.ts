import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot,Router, CanActivate } from '@angular/router';
import { UsuarioServiceService } from '../services/usuario-service.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const usuarioString = localStorage.getItem('usuario1');

    if (!usuarioString) {
      this.router.navigate(['/inicioSesion']);
      return false;
    }

    const usuario = JSON.parse(usuarioString);
    const rolUsuario = usuario.rol;  

    const rolesPermitidos = next.data['roles'] as string[];

    console.log('Rol del usuario:', rolUsuario);
    console.log('Roles permitidos:', rolesPermitidos);

    if (!rolesPermitidos || rolesPermitidos.includes(rolUsuario)) {
      return true;
    }

    this.router.navigate(['/inicioSesion']);
    return false;
  }
}