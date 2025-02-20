import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuarios } from '../models/usuarios';
import { AgregarEditarUsuarioComponent } from '../components/usuarios/agregar-editar-usuario/agregar-editar-usuario.component';

@Injectable({ 
  providedIn: 'root' 
})

export class UsuarioServiceService {
  private appUrl: string = environment.endpoint;
  private apiUrl: string = 'api/Usuarios/'; 

  constructor(private http:HttpClient) { }
    //Despliega la lista
    getUsuarios():Observable<Usuarios[]>{
      return this.http.get<Usuarios[]>(`${this.appUrl}${this.apiUrl}ConsultarUsuarios`);
    }
    //despliega un usuario
    getUsuario(id: number):Observable<Usuarios>{
      return this.http.get<Usuarios>(`${this.appUrl}${this.apiUrl}ConsultarUsuarios?id=${id}`);
    }
    
    deleteUsuario(id: number): Observable<any> {
      return this.http.delete<any>(`${this.appUrl}${this.apiUrl}BorrarUsuario?id=${id}`);
    }

    addUsuario(usuario: Usuarios): Observable<Usuarios> {
      return this.http.post<Usuarios>(`${this.appUrl}${this.apiUrl}RegistrarUsuario`, usuario);
    }

    updateUsuario(id: number, usuario: Usuarios): Observable<void> {
      return this.http.put<void>(`${this.appUrl}${this.apiUrl}ModificarUsuario?id=${id}`, usuario);
    }
}