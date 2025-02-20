import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuarios } from '../../../models/usuarios';
import { UsuarioServiceService } from '../../../services/usuario-service.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-editar-usuario',
  imports: [SharedModule,RouterModule, HttpClientModule],
  templateUrl: './agregar-editar-usuario.component.html',
  styleUrl: './agregar-editar-usuario.component.css',
  providers: [UsuarioServiceService]
})

export class AgregarEditarUsuarioComponent {
  loading: boolean = false;
  form: FormGroup;
  id:number;

  opcion: string='Agregar';

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
    })
    
    this.id =Number(this.aRoute.snapshot.paramMap.get('id'));
    
  }

  ngOnInit() : void {
    if(this.id != 0){
      this.opcion ='Modificar';
      this.obtenerUsuario(this.id);
    }
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
  
  agregarModificarUsuario(){
    //objeto
    const usuarios_c: Usuarios ={
      nombre:this.form.value.nombre,
      usuario1:this.form.value.usuario1,
      correo:this.form.value.correo,
      contraseña:this.form.value.contraseña
    }
    if(this.id != 0){
      usuarios_c.id = this.id;
      this.modificarUsuario(this.id,usuarios_c);
    }else{
      this.agregarUsuario(usuarios_c);
    }
    
  }

  modificarUsuario(id:number, usuarios_c:Usuarios){
      this.loading = true;
      this._usuarioService.updateUsuario(id,usuarios_c).subscribe(() => {
      this.loading = false;
      this.mensajeExito('actualizada');
      this.router.navigate(['/Usuarios']);
    })

  }

  agregarUsuario(usuarios_c:Usuarios){
    this._usuarioService.addUsuario(usuarios_c).subscribe(data =>{
    this.mensajeExito('registrada');
    this.router.navigate(['/Usuarios']);
    })
  }

  mensajeExito(texto: string){
    this._snackBar.open(`El usuario fue ${texto} con éxito`, '',{
      duration: 4000,
      horizontalPosition:'right',
    });
  }
}
