import { Component, Injectable } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuarios } from '../../../models/usuarios';
import { UsuarioServiceService } from '../../../services/usuario-service.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-agregar-editar-usuario',
  standalone:true,
  imports: [SharedModule,RouterModule, HttpClientModule, MatSnackBarModule,MatFormFieldModule,MatSelectModule],
  templateUrl: './agregar-editar-usuario.component.html',
  styleUrl: './agregar-editar-usuario.component.css',
  providers: [UsuarioServiceService]
})

export class AgregarEditarUsuarioComponent {
  loading: boolean = false;
  form: FormGroup;
  id:number;
  esRegistro: boolean = false;

  opcion: string = 'Agregar';
  volverLink: string = '';
  usuarioAute: boolean | undefined;

  roles = [
    { value: 'admin', viewValue: 'Administrador' },
    { value: 'asistente', viewValue: 'Asistente' },
  ];

  constructor(
    private fb: FormBuilder, 
    private _usuarioService:UsuarioServiceService, 
    private _snackBar : MatSnackBar, 
    private router:Router,
    private aRoute:ActivatedRoute){
    this.form=this.fb.group({
      nombre:['',Validators.required],
      usuario1:['',Validators.required],
      correo:['',Validators.email],
      contraseña:['',Validators.required],
      rol:['',Validators.required],
    })
    this.id =Number(this.aRoute.snapshot.paramMap.get('id'));
    
  }

  ngOnInit(): void {
    this.usuarioAute = !!localStorage.getItem('usuario1');
    this.router.events.subscribe(() => {
      this.usuarioAute = !!localStorage.getItem('usuario1');
    });
  
    this.esRegistro = this.router.url.includes('agregarUsuario') && !this.router.url.includes('modificarUsuario');
  
    if (this.id != 0) {
      this.opcion = 'Modificar';
      this.obtenerUsuario(this.id);
    }

    this.volverLink = this.usuarioAute ? '/Usuarios' : '/inicioSesion';
  
    if (this.esRegistro && !this.usuarioAute) {
      this.form.get('rol')?.clearValidators();
      this.form.get('rol')?.setValue('asistente');
      this.form.get('rol')?.updateValueAndValidity();
    }
  }
  

  logout() {
    localStorage.removeItem('usuario1');
    this.router.navigate(['/inicioSesion']);
  }

  obtenerUsuario(id: number) {
    this.loading = true;
    this._usuarioService.getUsuario(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener el usuario', error);
        this.loading = false;
      }
    });
  }
  
  agregarModificarUsuario() {
    const usuarios_c: Usuarios = {
      nombre: this.form.value.nombre,
      usuario1: this.form.value.usuario1,
      correo: this.form.value.correo,
      contraseña: this.form.value.contraseña,
      rol: this.esRegistro ? 'asistente' : this.form.value.rol, 
    }
  
    if (this.id != 0) {
      usuarios_c.id = this.id;
      this.modificarUsuario(this.id, usuarios_c);
    } else {
      this.agregarUsuario(usuarios_c);
    }
  }
  

  modificarUsuario(id:number, usuarios_c:Usuarios){
      this.loading = true;
      this._usuarioService.updateUsuario(id,usuarios_c).subscribe(() => {
      this.loading = false;
      this.mensajeExito('actualizado');
      this.router.navigate(['/Usuarios']);
    }, (error) => {
    this.loading = false;
        this.mensajeError('actualizado');
    })
  }

  agregarUsuario(usuarios_c: Usuarios) {
    this.loading = true;
    this._usuarioService.addUsuario(usuarios_c).subscribe(
      (data) => {
        this.loading = false;
        this.mensajeExito('registrado');
        this.router.navigate(['/Usuarios']);
      },
      (error) => {
        this.loading = false;

      if (error.status === 409) {
        this._snackBar.open(error.error, '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        });
      } else {
        this.mensajeError('registrado');
      }
    });
  }  

  mensajeExito(texto: string){
    this._snackBar.open(`El usuario fue ${texto} con éxito`, '',{
      duration: 3000,
      horizontalPosition:'right',
      verticalPosition: 'bottom',
    });
  }

  mensajeError(texto: string){
    this._snackBar.open(`El usuario no fue ${texto}`, '',{
      duration: 3000,
      horizontalPosition:'right',
      verticalPosition: 'bottom',
    });
  }
}
