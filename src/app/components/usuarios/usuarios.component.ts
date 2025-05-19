import { Component, AfterViewInit, ViewChild, Injectable } from '@angular/core';
import { Usuarios } from '../../models/usuarios';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UsuarioServiceService } from '../../services/usuario-service.service';

//angular material
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from '@angular/material/progress-bar';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { HttpClientModule } from '@angular/common/http';
import { CustomPaginatorIntl } from '../../customPag';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SharedModule, MatSort, MatPaginator, RouterModule,HttpClientModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  providers:[UsuarioServiceService, { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }]
})

export class UsuariosComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'nombre', 'usuario', 'correo','rol', 'acciones'];
  dataSource = new MatTableDataSource<Usuarios>();
  loading: boolean =false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  

constructor(private _snackBar : MatSnackBar, 
  private _usuarioService:UsuarioServiceService,
  private router: Router
){

}

ngOnInit(): void {
  this.obtenerUsuarios();
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  logout() {
    localStorage.removeItem('usuario1');
    this.router.navigate(['/inicioSesion']);
  }

  obtenerUsuarios(){
    this.loading = true; 
    this._usuarioService.getUsuarios().subscribe(data =>{
      this.loading = false;
      this.dataSource.data = data;
    }, error => {
      this.loading = false;
      alert('Ocurrió un error')
    })
  }

  mensajeExito(){
    this._snackBar.open('El usuario fue eliminado con éxito','',{
      duration: 4000,
      horizontalPosition:'right',
    });
  }
  
  borrarUsuario(id: number) {
  this.loading = true;
  console.log(`Intentando eliminar usuario con ID: ${id}`);

  this._usuarioService.deleteUsuario(id).subscribe({
    next: (response) => {
      console.log('Respuesta del servidor:', response); // Verificar si Angular recibe respuesta
      this.mensajeExito();
      this.obtenerUsuarios();
      this.loading = false;
    },
    error: (error) => {
      this.loading = false;
      console.error('Error al eliminar usuario:', error);
      alert(`Error al eliminar usuario: ${error.message}`);
    }
  });

}
}
